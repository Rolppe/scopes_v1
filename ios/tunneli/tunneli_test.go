package tunneli

import (
	"strings"
	"testing"
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
