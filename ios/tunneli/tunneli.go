// Package tunneli on Scopes-äpin oma WireGuard-tunneli (SCOPES-ETAYHTEYS 14.10.2026). Ilmainen Apple-tili ei
// salli Network Extensionia, joten tunneli ajetaan äpin prosessissa: wireguard-go ja käyttäjätilan TCP/IP-pino
// (netstack), ja äppi puhuu palvelulle paikallisen portin 127.0.0.1:<portti> kautta, jonka tunneli välittää
// kohteeseen (palvelun LAN-osoite). Toimii vain, kun äppi on auki. gomobile bind → Tunneli.xcframework.
package tunneli

import (
	"bufio"
	"context"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"net"
	"net/netip"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
	"golang.zx2c4.com/wireguard/tun/netstack"
)

type ajo struct {
	asetus, kohde string
	laite         *device.Device
	verkko        *netstack.Net
	kuuntelija    net.Listener
	kuollut       atomic.Bool // Accept palautti virheen: iOS otti pistokkeen takaisin äpin ollessa jäädytettynä
	paate         string      // Endpoint-rivi sellaisenaan (nimi:portti); ratkaistaan uudelleen Paivita-kutsussa
	vertainen     string      // PublicKey heksana: UAPI hyväksyy endpoint-rivin vain vertaisen public_key-rivin perässä
}

var (
	lukko sync.Mutex
	nyt   *ajo
)

// Kaynnista avaa tunnelin wg-quick-muotoisella asetuksella ja palauttaa paikallisen portin, joka välittää
// kohteeseen (isäntä:portti tunnelin takana). Sama asetus ja kohde palauttavat käynnissä olevan tunnelin portin;
// kuollut paikallinen portti avataan ensin uudelleen (V-487: muuten jokainen pyyntö sai -1004:n äpin uudelleenkäynnistykseen asti).
func Kaynnista(asetus, kohde string) (int, error) {
	lukko.Lock()
	defer lukko.Unlock()
	if nyt != nil && nyt.asetus == asetus && nyt.kohde == kohde {
		if nyt.kuollut.Load() {
			if err := nyt.kuuntele(); err != nil {
				return 0, err
			}
		}
		return nyt.portti(), nil
	}
	pysayta()
	a, err := avaa(asetus, kohde)
	if err != nil {
		return 0, err
	}
	nyt = a
	return a.portti(), nil
}

// Paivita avaa paikallisen portin uudelleen (iOS ottaa jäädytetyn äpin kuuntelevan pistokkeen takaisin, eikä
// Accept välttämättä ole vielä huomannut sitä), ratkaisee päätepisteen nimen uudelleen (DDNS) ja avaa
// UDP-pistokkeen uudelleen verkon vaihtuessa (Wi-Fi ↔ mobiili). Äppi kutsuu tätä palatessaan etualalle.
func Paivita() error {
	lukko.Lock()
	defer lukko.Unlock()
	if nyt == nil {
		return nil
	}
	if err := nyt.kuuntele(); err != nil {
		return err
	}
	if err := nyt.laite.BindUpdate(); err != nil {
		return err
	}
	osoite, err := ratkaise(nyt.paate)
	if err != nil {
		return err
	}
	return nyt.laite.IpcSet("public_key=" + nyt.vertainen + "\nendpoint=" + osoite + "\n")
}

// Pysayta sulkee tunnelin ja paikallisen portin.
func Pysayta() {
	lukko.Lock()
	defer lukko.Unlock()
	pysayta()
}

// Kaynnissa kertoo, onko tunneli auki.
func Kaynnissa() bool {
	lukko.Lock()
	defer lukko.Unlock()
	return nyt != nil
}

func pysayta() {
	if nyt == nil {
		return
	}
	nyt.kuuntelija.Close()
	nyt.laite.Close()
	nyt = nil
}

type jasennetty struct {
	osoite    netip.Addr
	uapi      string
	paate     string
	vertainen string
}

// jasenna lukee wg-quick-asetuksen: [Interface] PrivateKey, Address; [Peer] PublicKey, PresharedKey, Endpoint,
// AllowedIPs, PersistentKeepalive. DNS ja muut rivit ohitetaan: kohde on IP-osoite.
func jasenna(asetus string) (jasennetty, error) {
	var j jasennetty
	var liitanta, vertainen strings.Builder
	osio := ""
	rivit := bufio.NewScanner(strings.NewReader(asetus))
	for rivit.Scan() {
		rivi := strings.TrimSpace(rivit.Text())
		if i := strings.IndexByte(rivi, '#'); i >= 0 {
			rivi = strings.TrimSpace(rivi[:i])
		}
		if rivi == "" {
			continue
		}
		if strings.HasPrefix(rivi, "[") {
			osio = strings.ToLower(strings.Trim(rivi, "[] "))
			continue
		}
		avain, arvo, ok := strings.Cut(rivi, "=")
		if !ok {
			return j, fmt.Errorf("rivi ilman =-merkkiä: %q", avain)
		}
		avain = strings.ToLower(strings.TrimSpace(avain))
		arvo = strings.TrimSpace(arvo)
		switch osio + "." + avain {
		case "interface.privatekey":
			h, err := heksana(arvo)
			if err != nil {
				return j, fmt.Errorf("PrivateKey: %w", err)
			}
			fmt.Fprintf(&liitanta, "private_key=%s\n", h)
		case "interface.address":
			eka := strings.TrimSpace(strings.Split(arvo, ",")[0])
			p, err := netip.ParsePrefix(eka)
			if err != nil {
				a, err2 := netip.ParseAddr(eka)
				if err2 != nil {
					return j, fmt.Errorf("Address: %w", err)
				}
				p = netip.PrefixFrom(a, a.BitLen())
			}
			j.osoite = p.Addr()
		case "peer.publickey":
			h, err := heksana(arvo)
			if err != nil {
				return j, fmt.Errorf("PublicKey: %w", err)
			}
			fmt.Fprintf(&vertainen, "public_key=%s\n", h)
			j.vertainen = h
		case "peer.presharedkey":
			h, err := heksana(arvo)
			if err != nil {
				return j, fmt.Errorf("PresharedKey: %w", err)
			}
			fmt.Fprintf(&vertainen, "preshared_key=%s\n", h)
		case "peer.endpoint":
			j.paate = arvo
		case "peer.allowedips":
			for _, ip := range strings.Split(arvo, ",") {
				fmt.Fprintf(&vertainen, "allowed_ip=%s\n", strings.TrimSpace(ip))
			}
		case "peer.persistentkeepalive":
			fmt.Fprintf(&vertainen, "persistent_keepalive_interval=%s\n", arvo)
		}
	}
	if !j.osoite.IsValid() || j.paate == "" || !strings.Contains(liitanta.String(), "private_key") || !strings.Contains(vertainen.String(), "public_key") {
		return j, fmt.Errorf("asetuksesta puuttuu PrivateKey, Address, PublicKey tai Endpoint")
	}
	j.uapi = liitanta.String() + vertainen.String()
	return j, nil
}

func heksana(b64 string) (string, error) {
	d, err := base64.StdEncoding.DecodeString(b64)
	if err != nil || len(d) != 32 {
		return "", fmt.Errorf("ei 32 tavun base64-avain")
	}
	return hex.EncodeToString(d), nil
}

// ratkaise muuttaa Endpoint-rivin (nimi:portti) IP:portiksi; IPv4 ensin, koska kotiverkon A-tietue on DDNS:n.
func ratkaise(paate string) (string, error) {
	isanta, portti, err := net.SplitHostPort(paate)
	if err != nil {
		return "", fmt.Errorf("Endpoint: %w", err)
	}
	ctx, peru := context.WithTimeout(context.Background(), 5*time.Second)
	defer peru()
	ipt, err := net.DefaultResolver.LookupNetIP(ctx, "ip", isanta)
	if err != nil || len(ipt) == 0 {
		return "", fmt.Errorf("Endpoint %s ei ratkea: %v", isanta, err)
	}
	valittu := ipt[0]
	for _, ip := range ipt {
		if ip.Unmap().Is4() {
			valittu = ip.Unmap()
			break
		}
	}
	return net.JoinHostPort(valittu.String(), portti), nil
}

func avaa(asetus, kohde string) (*ajo, error) {
	j, err := jasenna(asetus)
	if err != nil {
		return nil, err
	}
	if _, _, err := net.SplitHostPort(kohde); err != nil {
		return nil, fmt.Errorf("kohde: %w", err)
	}
	osoite, err := ratkaise(j.paate)
	if err != nil {
		return nil, err
	}
	liitanta, verkko, err := netstack.CreateNetTUN([]netip.Addr{j.osoite}, nil, 1420)
	if err != nil {
		return nil, err
	}
	laite := device.NewDevice(liitanta, conn.NewDefaultBind(), device.NewLogger(device.LogLevelError, "tunneli: "))
	if err := laite.IpcSet(j.uapi + "endpoint=" + osoite + "\n"); err != nil {
		laite.Close()
		return nil, err
	}
	if err := laite.Up(); err != nil {
		laite.Close()
		return nil, err
	}
	kuuntelija, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		laite.Close()
		return nil, err
	}
	a := &ajo{asetus: asetus, kohde: kohde, laite: laite, verkko: verkko, kuuntelija: kuuntelija, paate: j.paate, vertainen: j.vertainen}
	go a.valita(kuuntelija)
	return a, nil
}

func (a *ajo) portti() int { return a.kuuntelija.Addr().(*net.TCPAddr).Port }

// kuuntele vaihtaa paikallisen kuuntelijan uuteen samaan porttiin, jotta äpin muistama osoite pysyy voimassa;
// jos portti ei vapaudu, mikä tahansa vapaa portti (äppi kysyy sen Kaynnista-kutsulla, kun reitti valitaan uudelleen).
func (a *ajo) kuuntele() error {
	vanha := a.portti()
	a.kuuntelija.Close()
	k, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", vanha))
	if err != nil {
		if k, err = net.Listen("tcp", "127.0.0.1:0"); err != nil {
			a.kuollut.Store(true)
			return err
		}
	}
	a.kuuntelija = k
	a.kuollut.Store(false)
	go a.valita(k)
	return nil
}

// valita ottaa paikalliset yhteydet vastaan ja kytkee kunkin tunnelin läpi kohteeseen. Kuuntelija annetaan
// parametrina: vaihdettu kuuntelija ei saa merkitä uutta kuolleeksi.
func (a *ajo) valita(kuuntelija net.Listener) {
	for {
		paikallinen, err := kuuntelija.Accept()
		if err != nil {
			lukko.Lock()
			if a.kuuntelija == kuuntelija {
				a.kuollut.Store(true)
			}
			lukko.Unlock()
			return
		}
		go func() {
			defer paikallinen.Close()
			ctx, peru := context.WithTimeout(context.Background(), 10*time.Second)
			etainen, err := a.verkko.DialContext(ctx, "tcp", a.kohde)
			peru()
			if err != nil {
				return
			}
			defer etainen.Close()
			valmis := make(chan struct{}, 2)
			kopioi := func(minne, mista net.Conn) {
				io.Copy(minne, mista)
				if t, ok := minne.(interface{ CloseWrite() error }); ok {
					t.CloseWrite()
				}
				valmis <- struct{}{}
			}
			go kopioi(etainen, paikallinen)
			go kopioi(paikallinen, etainen)
			<-valmis
			<-valmis
		}()
	}
}
