# Harjoituspokeri

Texas Hold'em -harjoituspeli valmentajalla. Peli pyörii selaimessa, ja siinä pelataan vain pelimerkeillä, ei oikealla rahalla.

**Pelaa:** https://joniasdf.github.io/harjoituspokeri/

## Ominaisuudet
- No-limit Hold'em 3–5 bottia vastaan (tiukka, löysä ja aggressiivinen), sivupotit ja showdown
- Valmentaja: Monte Carlo -equity, pottikertoimet, EV, outsit (2:n ja 4:n sääntö) ja suositeltu siirto perusteluineen
- Vastustajien tilastot (VPIP, PFR, AF) ja niihin perustuvat strategiavinkit
- Vihjeet näkyvät pelin aikana tai palaute vasta käden jälkeen, sekä session tilastot
- 12 tutoriaalia oppimispolkuna, harjoituskysymyksiä arvotuilla luvuilla, edistyminen tallentuu selaimeen

## Kehitys
`index.html` on yksi itsenäinen tiedosto, joka toimii myös ilman nettiyhteyttä. Se kootaan lähdetiedostoista komennolla:

    python3 build.py

Testit: `node test.js`, `node tuttest.js`, `node stress.js`
