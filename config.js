/*
 * ============================================================
 *  PODEŠAVANJA SAJTA: ovo je jedini fajl koji treba menjati
 * ============================================================
 */
window.SITE_CONFIG = {
  bandName: "Grand Plus Orkestar",

  // Broj telefona u međunarodnom formatu, bez "+" i razmaka (koristi se za Viber i WhatsApp)
  // TODO: upisati pravi broj benda
  phone: "381600000000",
  // Kako se broj prikazuje na sajtu
  phoneDisplay: "+381 60 000 0000",

  instagram: "https://www.instagram.com/grandplusorkestar/",
  city: "Srbija i region",
  // Gradovi i mesta gde bend svira. Prikazuju se na sajtu i pomažu da sajt izlazi na Google-u
  // kada neko traži npr. "bend za svadbu Šabac". TODO: upisati prave gradove.
  serviceAreas: ["Srbija"],

  // ---- Google kalendar (zauzeti termini) ----
  // Uputstvo je u README.md. Dok su ova dva polja prazna, sajt prikazuje demo zauzete datume.
  googleCalendarId: "",   // npr. "abc123@group.calendar.google.com"
  googleApiKey: "",       // API ključ iz Google Cloud konzole (ograničen na domen sajta)

  // Demo zauzeti datumi (koriste se samo dok Google kalendar nije podešen)
  demoBusyDates: ["2026-10-31", "2026-11-01", "2026-11-07", "2026-11-14", "2026-11-15", "2026-11-21", "2026-11-28", "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26", "2026-12-31"],

  // YouTube ID-jevi videa (deo linka posle "v="). Ako je prazno, prikazuje se poziv ka Instagramu.
  youtubeVideos: []
};
