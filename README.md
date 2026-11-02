# Budget Tracker

Aplikacija za praćenje ličnih finansija, prihoda, troškova i mesečnih budžeta.

## Tehnologije

- React
- TypeScript
- Vite
- CSS
- LocalStorage za čuvanje podataka u pregledaču

## Funkcionalnosti

- Dodavanje, izmena i brisanje transakcija.
- Evidencija prihoda i troškova.
- Upravljanje kategorijama i njihovim bojama.
- Postavljanje mesečnih budžeta po kategorijama.
- Praćenje potrošnje i preostalog budžeta.
- Mesečni pregled finansija.
- Filtriranje, pretraga i sortiranje transakcija.
- Čuvanje podataka u LocalStorage-u.
- Vraćanje aplikacije na početne podatke.
- Prilagođen prikaz za mobilne telefone, tablete i računare.

## Pokretanje projekta

Instaliranje zavisnosti:

```bash
npm install
```

Pokretanje aplikacije u razvojnom režimu:

```bash
npm run dev
```

Provera TypeScript koda i pravljenje produkcione verzije:

```bash
npm run build
```

Pregled produkcione verzije:

```bash
npm run preview
```

## Čuvanje podataka

Podaci se čuvaju u LocalStorage-u pregledača. Aplikacija ne koristi backend server niti korisničke naloge.

Podaci ostaju sačuvani u istom pregledaču dok se ne obrišu ili dok korisnik ne vrati početne podatke.

## Valuta

Svi finansijski iznosi prikazuju se u evrima (€).
