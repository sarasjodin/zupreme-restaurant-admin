# Zuprême Restaurant Admin

Administrationsgränssnitt för restaurangen Zuprême.
Administrationssidan används av behöriga användare för att logga in och hantera restaurangens meny via Zuprême Restaurant API.

<img width="1842" height="865" alt="image" src="https://github.com/user-attachments/assets/54676192-5a7c-450f-b059-9f3c9fdc3a44" />

---

## Om projektet

Zuprême Restaurant Admin är administrationsdelen av Zuprême Restaurant-systemet.
Gränssnittet är utvecklat med HTML, CSS och JavaScript och kommunicerar med ett separat REST API.
Administratörer och redaktörer kan logga in och arbeta med restaurangens meny. Skyddade API-anrop kräver autentisering med JWT (JSON Web Token).

Den publika webbplatsen och administrationsgränssnittet använder samma REST API men har olika ansvarsområden:

- Den publika webbplatsen visar restaurangens innehåll för besökare
- Administrationsgränssnittet används för att hantera och uppdatera innehållet
- REST API:t hanterar autentisering, validering och kommunikation med databasen

Projektet är utvecklat som en del av ett utbildningsprojekt inom webbutveckling.

---

## Funktioner

### Menyadministration

Administrationsgränssnittet är utformat för att hantera restaurangens menyartiklar.

Menyartiklar visas grupperade efter kategori:

- Förrätter
- Soppor
- Varmrätter
- Efterrätter
- Drycker

För varje menyartikel visas bland annat:

- Sorteringsposition
- Namn
- Beskrivning
- Bild
- Servering
- Pris
- Tillgänglighet
- Åtgärder för redigering och borttagning

När CRUD-funktionaliteten är implementerad ska behöriga användare kunna:

- Visa alla menyartiklar, även de som inte är tillgängliga
- Skapa nya menyartiklar
- Redigera befintliga menyartiklar
- Ändra om en menyartikel är tillgänglig
- Ändra sorteringsordning
- Ta bort menyartiklar

### Autentisering

Administrationsgränssnittet använder Zuprême Restaurant API för autentisering.
Efter en lyckad inloggning används en JWT för anrop till skyddade API-endpoints.

Användaren ska kunna:

- Logga in
- Använda skyddade administrationsfunktioner
- Logga ut

---

### Implementation

- Login mot `POST /api/auth/login`
- JWT-hantering
- Hämtning av alla menyartiklar
- Create för menyartiklar
- Update för menyartiklar
- Toggle för `is_available`
- Delete för menyartiklar
- Loading-, success- och error-meddelanden

---

## Tekniker

- HTML5
- CSS3
- JavaScript
- Fetch API
- REST API
- JWT
- Git
- GitHub
- Docker
- Nginx

---

## Projektstruktur

En förenklad struktur för administrationsprojektet:

```text
zupreme-restaurant-admin/
│
├── assets/
│   ├── icons/
│   ├── images/
│   ├── js/
│   │   └── admin.js
│   └── styles/
│       ├── global.css
│       └── admin.css
│
├── favicon.ico
├── index.html
└── README.md
```
---

## Lokal utveckling

- Klona repositoryt: `git clone <repository-url>`

- Gå till projektmappen: `cd zupreme-restaurant-admin`

Administrationsgränssnittet är en statisk frontend och behöver köras via en lokal webbserver.
Exempelvis kan projektet köras med en lokal utvecklingsserver i VS Code.
Admin-klienten behöver också kunna kommunicera med Zuprême Restaurant API.

---

## API-integration

Administrationsgränssnittet kommunicerar med Zuprême Restaurant API med webbläsarens `Fetch API`.

---

### API-basadress

Production:
https://zupreme-restaurant-api.sarasjodin.se/api

Admin och den publika webbplatsen använder samma backend.
Skillnaden är att administrationsgränssnittet använder JWT för skyddade endpoints.

---

## Autentisering

```
Method	Endpoint	    Beskrivning	                                Auth
POST	/auth/login	    Loggar in användaren och returnerar JWT	    Nej
GET     /auth/me	    Hämtar information om inloggad användare	JWT
```
---

## Menu items

```
Method	Endpoint	                            Beskrivning	                Auth
GET	    /menu-items?include_unavailable=true    Hämtar alla menyartiklar	JWT
POST	/menu-items	                            Skapar en menyartikel	    JWT
PATCH	/menu-items/:id	                        Uppdaterar en menyartikel	JWT
DELETE	/menu-items/:id	                        Tar bort en menyartikel	    JWT
```

De skyddade meny-endpointsen kräver en giltig JWT.

---

## Säkerhet

Administrationsgränssnittet kommunicerar aldrig direkt med MySQL-databasen.

Flödet är:

Admin frontend → Zuprême Restaurant API → Autentisering och validering → MySQL

- Skyddade API-anrop kräver en giltig JWT.
- Servern ansvarar för den slutliga valideringen av inkommande data.
- Klientvalidering används endast som ett komplement för bättre användarupplevelse.

---

## Deployment

- Administrationsgränssnittet publiceras separat från den publika webbplatsen.
- Administrationssidan körs som en separat webbapplikation och använder Zuprême Restaurant API som backend.
- Vid uppdateringar av `index.html` eller `admin.html` på VPS:en behöver admin-containern återskapas för att de nya filerna ska användas:
```
docker compose up -d --force-recreate admin
```
---

## Versionshantering

Projektet använder Git och GitHub för versionshantering.

- Ändringar dokumenteras i CHANGELOG.md
- Viktiga releaser kan märkas med Git tags
- Commit-meddelanden följer Conventional Commits, exempelvis feat:, fix:, chore: och docs:
- Funktionalitet utvecklas i separata branches och mergas genom pull requests

Exempel:
`feat/add-admin-authentication`
`feat/add-menu-item-management`

---

## Relaterade Zuprême-applikationer

- Publik webbplats: https://zupreme-restaurant.netlify.app/
- REST API: https://zupreme-restaurant-api.sarasjodin.se/
- Administration: https://zupreme-restaurant-admin.sarasjodin.se/

