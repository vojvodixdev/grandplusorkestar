# Grand Plus Orkestar: sajt

Statički sajt (HTML/CSS/JS) bez baze i bez servera. Hosting je besplatan, a nema šta da se održava.
Zauzeti termini dolaze iz **Google kalendara benda**, a upiti stižu bendu preko **Vibera/WhatsApp-a**.

```
site/
├─ index.html   sadržaj stranice (tekstovi, sekcije)
├─ styles.css   dizajn
├─ app.js       kalendar, forma, meni
├─ config.js    ← telefon, Instagram, gradovi, Google kalendar (jedino što se menja)
├─ img/         slike članova + og-image.jpg (kartica pri deljenju linka)
├─ favicon.ico, favicon-32.png, apple-touch-icon.png, icon-512.png   ikonice
└─ robots.txt, sitemap.xml   za Google pretragu
```

---

## 1. Pre objave: popuniti `config.js`
- `phone`: broj za Viber/WhatsApp u formatu `3816XXXXXXXX` (bez `+`, bez razmaka)
- `phoneDisplay`: kako se broj prikazuje, npr. `+381 6X XXX XXXX`
- `googleCalendarId` i `googleApiKey`: vidi korak 2
- `youtubeVideos`: (opciono) ID-jevi YouTube videa, npr. za `youtube.com/watch?v=abc123` upisati `"abc123"`

U `index.html` proveriti i tekstove koji su za sada primer: brojke u sekciji „O nama“ (15 godina, 500 proslava…) i odgovore u sekciji „Česta pitanja“.
> Slike u `img/` su isečene iz Instagram storija i niske su rezolucije. Za bolji izgled zamenite ih originalnim fotografijama sa istim imenima fajlova (`dragan.jpg`, `radovan.jpg`…).

---

## 2. Google kalendar (radi se jednom, ~10 minuta)

### A) Bend: kalendar za svirke
1. Na računaru otvoriti **calendar.google.com** (nalog benda).
2. Levo: **Drugi kalendari → + → Napravi novi kalendar**, nazvati ga npr. „Grand Plus – svirke“.
3. Otvoriti **Podešavanja** tog kalendara → **Dozvole za pristup događajima** → štiklirati **Učini javno dostupnim** i izabrati **Vidi samo slobodno/zauzeto (sakrij detalje)**.
   Na sajtu se vidi samo da je dan zauzet, a ne ko je klijent ni gde se svira.
4. Niže na istoj strani, u delu **Integriši kalendar**, kopirati **ID kalendara** (izgleda kao `xxxx@group.calendar.google.com`) i upisati ga u `googleCalendarId`.

### B) API ključ (Nikola)
1. Otvoriti **console.cloud.google.com** i napraviti novi projekat „grandplus-sajt“.
2. **APIs & Services → Library → Google Calendar API → Enable**.
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Ograničiti ključ (**Edit API key**):
   - *Application restrictions* → **Websites** → dodati domen sajta, npr. `https://grandplusorkestar.rs/*` (i `http://localhost/*` za testiranje)
   - *API restrictions* → **Restrict key → Google Calendar API**
5. Ključ upisati u `googleApiKey`.

Ključ je vidljiv u kodu sajta, i to je u redu: zbog ograničenja iz koraka 4 radi samo na vašem domenu i samo za čitanje javnih kalendara. Korišćenje je besplatno.

### Kako bend posle koristi kalendar
- Dogovorena svirka → u Google Calendar aplikaciji na telefonu dodati događaj u kalendar „Grand Plus – svirke“.
  - **Celodnevni događaj**: zauzima taj dan (ili više dana)
  - **Događaj sa satnicom** (npr. 19h–04h): zauzima dan kada svirka počinje
- Svirka otkazana → obrisati događaj, i dan je ponovo slobodan.
- Sajt se ažurira sam, odmah. Ništa drugo ne treba raditi.

Dok `googleCalendarId` i `googleApiKey` nisu popunjeni, sajt prikazuje primer zauzetih datuma (`demoBusyDates`) i napomenu da je reč o demo prikazu.

---

## 3. Objava sajta (besplatno)

**Najlakše: Netlify Drop**
1. Otvoriti **app.netlify.com/drop**.
2. Prevući ceo folder `site` u prozor i sajt je odmah online.
3. U podešavanjima (*Domain management*) povezati domen (npr. `grandplusorkestar.rs`, kupljen kod domaćeg registra).

Alternativa: **GitHub Pages** ili **Cloudflare Pages**, gde je postupak isti (upload foldera).

Kada sajt dobije domen:
1. Taj domen dodati u ograničenja API ključa (korak 2B-4).
2. U `index.html`, `robots.txt` i `sitemap.xml` zameniti `https://www.grandplusorkestar.rs` pravim domenom (Find & Replace).
   Ovo je bitno za karticu pri deljenju linka: Viber, WhatsApp i Facebook moraju da imaju punu adresu slike `img/og-image.jpg`.

---

## 4. Google pretraga (SEO)
- U `config.js` upisati gradove u `serviceAreas`, npr. `["Šabac", "Loznica", "Valjevo", "Beograd"]`. Prikazuju se u dnu sajta i šalju Google-u.
- Posle objave: na **search.google.com/search-console** dodati sajt i poslati `sitemap.xml`. Google tako brže pronađe sajt.
- Najveći efekat ima besplatan **Google Business profil** benda (business.google.com), sa linkom ka sajtu.
- Kartica pri deljenju se može proveriti na **developers.facebook.com/tools/debug** (uneti adresu sajta).

---

## 5. Lokalni pregled
U folderu `site` pokrenuti:
```
python -m http.server 8080
```
i otvoriti http://localhost:8080
