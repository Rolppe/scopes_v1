package tunneli

import (
	"fmt"
	"net"
	"strings"
	"testing"
	"time"
)

const avain = "YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=" // 32 × 'a'

func TestJasenna(t *testing.T) {
	j, err := jasenna(`[Interface]
PrivateKey = ` + avain + `
Address = 192.0.2.30/32
DNS = 192.0.2.99 # ohitetaan

[Peer]
PublicKey = ` + avain + `
Endpoint = wg.example.com:51820
AllowedIPs = 192.0.2.11/32, 192.0.2.31/32
PersistentKeepalive = 25
`)
	if err != nil {
		t.Fatal(err)
	}
	if j.osoite.String() != "192.0.2.30" || j.paate != "wg.example.com:51820" {
		t.Fatalf("osoite %v paate %q", j.osoite, j.paate)
	}
	h := strings.Repeat("61", 32)
	for _, r := range []string{"private_key=" + h, "public_key=" + h, "allowed_ip=192.0.2.11/32", "allowed_ip=192.0.2.31/32", "persistent_keepalive_interval=25"} {
		if !strings.Contains(j.uapi, r+"\n") {
			t.Errorf("uapi:sta puuttuu %q", r)
		}
	}
}

func TestJasennaPuuttuva(t *testing.T) {
	if _, err := jasenna("[Interface]\nPrivateKey = " + avain + "\n"); err == nil {
		t.Fatal("puuttuva Peer hyväksyttiin")
	}
	if _, err := jasenna("[Interface]\nPrivateKey = lyhyt\n"); err == nil {
		t.Fatal("väärä avain hyväksyttiin")
	}
}

func TestRatkaiseIP(t *testing.T) {
	if o, err := ratkaise("192.0.2.1:51820"); err != nil || o != "192.0.2.1:51820" {
		t.Fatalf("%q %v", o, err)
	}
}

// V-487: iOS ottaa jäädytetyn äpin kuuntelevan pistokkeen takaisin. Kaynnista ja Paivita avaavat portin uudelleen.
func TestKuollutPorttiAvataanUudelleen(t *testing.T) {
	asetus := "[Interface]\nPrivateKey = " + avain + "\nAddress = 192.0.2.30/32\n[Peer]\nPublicKey = " + avain +
		"\nEndpoint = 192.0.2.1:51820\nAllowedIPs = 192.0.2.31/32\n"
	defer Pysayta()
	vastaa := func(portti int) bool {
		c, err := net.DialTimeout("tcp", fmt.Sprintf("127.0.0.1:%d", portti), time.Second)
		if err == nil {
			c.Close()
		}
		return err == nil
	}
	tapa := func() {
		lukko.Lock()
		k := nyt.kuuntelija
		lukko.Unlock()
		k.Close()
		for i := 0; i < 100 && !nyt.kuollut.Load(); i++ {
			time.Sleep(10 * time.Millisecond)
		}
	}
	p1, err := Kaynnista(asetus, "192.0.2.31:8787")
	if err != nil || !vastaa(p1) {
		t.Fatalf("käynnistys: %d %v", p1, err)
	}
	tapa()
	if vastaa(p1) {
		t.Fatal("suljettu portti vastasi yhä")
	}
	p2, err := Kaynnista(asetus, "192.0.2.31:8787")
	if err != nil || !vastaa(p2) {
		t.Fatalf("Kaynnista ei avannut kuollutta porttia: %d %v", p2, err)
	}
	if p2 != p1 {
		t.Errorf("portti vaihtui %d → %d", p1, p2)
	}
	tapa()
	if err := Paivita(); err != nil {
		t.Fatal(err)
	}
	if !vastaa(p2) {
		t.Fatal("Paivita ei avannut kuollutta porttia")
	}
}
