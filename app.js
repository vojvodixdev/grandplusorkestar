(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};

  var MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
  var WEEKDAYS = ["nedelja", "ponedeljak", "utorak", "sreda", "četvrtak", "petak", "subota"];
  var MAX_MONTHS_AHEAD = 24;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function formatLong(d) { return WEEKDAYS[d.getDay()] + ", " + d.getDate() + ". " + MONTHS[d.getMonth()] + " " + d.getFullYear() + "."; }

  /* ---------- Kontakt linkovi iz config.js ---------- */
  function viberUrl(text) { return "viber://chat?number=%2B" + cfg.phone + (text ? "&draft=" + encodeURIComponent(text) : ""); }
  function whatsappUrl(text) { return "https://wa.me/" + cfg.phone + (text ? "?text=" + encodeURIComponent(text) : ""); }

  $$("[data-tel]").forEach(function (a) { a.href = "tel:+" + cfg.phone; });
  $$("[data-viber]").forEach(function (a) { a.href = viberUrl(); });
  $$("[data-whatsapp]").forEach(function (a) { a.href = whatsappUrl(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-instagram]").forEach(function (a) { a.href = cfg.instagram; });
  $$("[data-phone-display]").forEach(function (el) { el.textContent = cfg.phoneDisplay; });
  $$("[data-city]").forEach(function (el) { el.textContent = cfg.city; });
  $$("[data-areas]").forEach(function (el) { el.textContent = (cfg.serviceAreas || []).join(", "); });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Podaci za Google (strukturirani podaci) ---------- */
  var ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: cfg.bandName,
    url: location.origin + "/",
    image: location.origin + "/img/og-image.jpg",
    logo: location.origin + "/icon-512.png",
    description: "Bend za svadbe, krštenja, rođendane, ispraćaje i proslave. Muzika uživo.",
    telephone: "+" + cfg.phone,
    genre: ["Narodna muzika", "Starogradska muzika", "Zabavna muzika", "Pop"],
    areaServed: (cfg.serviceAreas || []).map(function (a) { return { "@type": "Place", name: a }; }),
    sameAs: [cfg.instagram],
    member: $$(".member").map(function (m) {
      return { "@type": "Person", name: $("h3", m).textContent, roleName: $("p", m).textContent };
    })
  });
  document.head.appendChild(ld);

  /* ---------- Navigacija ---------- */
  var nav = $("#nav"), toggle = $("#navToggle"), links = $("#navLinks");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    links.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 900) setMenu(false); });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Video / Instagram ---------- */
  var videos = $("#videos");
  if (cfg.youtubeVideos && cfg.youtubeVideos.length) {
    videos.innerHTML = cfg.youtubeVideos.map(function (id) {
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '" title="Nastup" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    }).join("");
  } else {
    // Dok nema YouTube snimaka, upućujemo na Instagram profil
    var handle = "@" + cfg.instagram.replace(/\/+$/, "").split("/").pop();
    videos.innerHTML = '<a class="ig-box" href="' + cfg.instagram + '" target="_blank" rel="noopener">' +
      '<img src="img/dragan.jpg" alt="" loading="lazy"><img src="img/radovan.jpg" alt="" loading="lazy"><img src="img/uros.jpg" alt="" loading="lazy">' +
      '<span><strong>' + handle + '</strong>Snimke sa svadbi i proslava redovno kačimo na Instagram.</span></a>';
  }

  /* ---------- Kalendar ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var selected = null;
  var busyCache = {};   // "2026-11" -> Set datuma
  var useGoogle = !!(cfg.googleCalendarId && cfg.googleApiKey);
  var calDays = $("#calDays"), calTitle = $("#calTitle"), calNote = $("#calNote");
  var prevBtn = $("#calPrev"), nextBtn = $("#calNext");

  calNote.textContent = useGoogle
    ? "Kalendar ažuriramo redovno, a svaki termin potvrđujemo i porukom."
    : "Primer: zauzeti datumi su izmišljeni dok se ne poveže pravi kalendar.";

  function monthKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); }

  function demoBusy(y, m) {
    var prefix = y + "-" + pad(m + 1);
    return new Set((cfg.demoBusyDates || []).filter(function (k) { return k.indexOf(prefix) === 0; }));
  }

  // Datumi se računaju po beogradskom vremenu, da bi i posetioci iz inostranstva videli iste dane.
  var belgradeFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Belgrade", year: "numeric", month: "2-digit", day: "2-digit" });
  function belgradeKey(ms) { return belgradeFmt.format(new Date(ms)); }
  var DAY_MS = 864e5;

  // Čita samo slobodno/zauzeto (freeBusy), pa detalji svirki ostaju privatni.
  // Celodnevni događaj zauzima sve dane koje pokriva; svirka sa satnicom (npr. 20h–04h) zauzima samo dan početka.
  function fetchGoogleBusy(y, m) {
    var body = {
      timeMin: new Date(y, m, 1).toISOString(),
      timeMax: new Date(y, m + 1, 1).toISOString(),
      timeZone: "Europe/Belgrade",
      items: [{ id: cfg.googleCalendarId }]
    };
    return fetch("https://www.googleapis.com/calendar/v3/freeBusy?key=" + encodeURIComponent(cfg.googleApiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error("Google Calendar " + r.status);
      return r.json();
    }).then(function (data) {
      var cal = (data.calendars || {})[cfg.googleCalendarId] || {};
      if (cal.errors && cal.errors.length) throw new Error("Google Calendar: " + cal.errors[0].reason);
      var set = new Set();
      (cal.busy || []).forEach(function (b) {
        var start = Date.parse(b.start), end = Date.parse(b.end);
        if (end - start >= 20 * 3600e3) {
          var days = Math.round((end - start) / DAY_MS);
          for (var i = 0; i < days; i++) set.add(belgradeKey(start + i * DAY_MS + 12 * 3600e3));
        } else {
          set.add(belgradeKey(start));
        }
      });
      return set;
    });
  }

  function getBusy(y, m) {
    var key = y + "-" + pad(m + 1);
    if (busyCache[key]) return Promise.resolve(busyCache[key]);
    var p = useGoogle
      ? fetchGoogleBusy(y, m).catch(function (err) {
          console.warn(err);
          calNote.textContent = "Kalendar trenutno nije dostupan. Pošaljite upit i potvrdićemo da li je datum slobodan.";
          return new Set();
        })
      : Promise.resolve(demoBusy(y, m));
    return p.then(function (set) { busyCache[key] = set; return set; });
  }

  function render() {
    var y = view.getFullYear(), m = view.getMonth();
    calTitle.textContent = MONTHS[m] + " " + y;
    var maxView = new Date(today.getFullYear(), today.getMonth() + MAX_MONTHS_AHEAD, 1);
    prevBtn.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    nextBtn.disabled = view >= maxView;

    var renderedKey = monthKey(view);
    calDays.parentElement.classList.add("cal-loading");
    drawDays(y, m, busyCache[renderedKey] || new Set());
    getBusy(y, m).then(function (busy) {
      if (monthKey(view) !== renderedKey) return; // korisnik je u međuvremenu promenio mesec
      calDays.parentElement.classList.remove("cal-loading");
      drawDays(y, m, busy);
    });
  }

  function drawDays(y, m, busy) {
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7; // ponedeljak je prvi dan
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var html = "";
    for (var i = 0; i < offset; i++) html += '<span class="day empty"></span>';
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(y, m, d), key = dateKey(date), cls = "day", label = formatLong(date), disabled = "";
      if (date < today) { cls += " past"; disabled = " disabled"; }
      else if (busy.has(key)) { cls += " busy"; label += " (zauzeto)"; disabled = ' aria-disabled="true"'; }
      else label += " (slobodno)";
      if (date.getTime() === today.getTime()) cls += " today";
      if (selected && key === dateKey(selected)) cls += " selected";
      html += '<button type="button" class="' + cls + '" data-date="' + key + '" aria-label="' + label + '"' + disabled + ">" + d + "</button>";
    }
    calDays.innerHTML = html;
  }

  calDays.addEventListener("click", function (e) {
    var btn = e.target.closest(".day");
    if (!btn || btn.disabled || btn.classList.contains("past")) return;
    if (btn.classList.contains("busy")) {
      showError("Taj dan smo već zauzeti. Izaberite drugi datum ili nas pozovite.");
      return;
    }
    var parts = btn.dataset.date.split("-");
    selected = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    $$(".day.selected", calDays).forEach(function (b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
    var box = $("#selectedDate");
    $("strong", box).textContent = formatLong(selected);
    box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
    showError("");
    if (window.innerWidth <= 900) $("#bookingForm").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  prevBtn.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  nextBtn.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
  render();

  /* ---------- Forma za upit ---------- */
  var form = $("#bookingForm"), errorEl = $("#formError");
  function showError(msg) { errorEl.textContent = msg; }

  function buildMessage() {
    var f = form.elements;
    var lines = [
      "Zdravo! Šaljem upit sa sajta " + cfg.bandName + ":",
      "",
      "📅 Datum: " + formatLong(selected),
      "🎉 Proslava: " + f.type.value
    ];
    if (f.place.value.trim()) lines.push("📍 Mesto: " + f.place.value.trim());
    if (f.guests.value.trim()) lines.push("👥 Broj gostiju: " + f.guests.value.trim());
    lines.push("👤 Ime: " + f.name.value.trim());
    lines.push("📞 Telefon: " + f.phone.value.trim());
    if (f.note.value.trim()) lines.push("📝 Napomena: " + f.note.value.trim());
    return lines.join("\n");
  }

  function validate() {
    var f = form.elements, ok = true;
    [f.name, f.phone].forEach(function (input) {
      var bad = !input.value.trim();
      input.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!selected) { showError("Izaberite slobodan datum u kalendaru."); return false; }
    if (!ok) { showError("Unesite ime i broj telefona da bismo mogli da vas kontaktiramo."); return false; }
    showError("");
    return true;
  }

  $$("[data-send]", form).forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!validate()) return;
      var text = buildMessage();
      if (btn.dataset.send === "viber") {
        // Pojedine verzije Vibera ignorišu tekst iz linka, pa poruku kopiramo i u clipboard.
        if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
        window.location.href = viberUrl(text);
      } else {
        window.open(whatsappUrl(text), "_blank", "noopener");
      }
    });
  });
  $$("input", form).forEach(function (input) {
    input.addEventListener("input", function () { input.classList.remove("invalid"); });
  });
})();
