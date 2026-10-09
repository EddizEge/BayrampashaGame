// Bayrampaşa sitesi: son sürüm adı / başlatıcı boyutu ve sürüm notları GitHub'dan canlı (api.github.com CORS'a açık).
// Ulaşılamazsa sayfadaki gömülü yedek liste. İzleme / çerez yok.
(function () {
  "use strict";
  var DEPO = "EddizEge/BayrampashaGame";
  var API = "https://api.github.com/repos/" + DEPO + "/releases?per_page=20";

  function mb(bayt) { return (bayt / 1048576).toFixed(bayt < 10485760 ? 1 : 0).replace(".", ",") + " MB"; }
  function tarih(iso) {
    try { return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return iso.slice(0, 10); }
  }
  function el(ad, sinif, yazi) { var e = document.createElement(ad); if (sinif) e.className = sinif; if (yazi != null) e.textContent = yazi; return e; }

  function surumleriYaz(liste, canli) {
    var kap = document.getElementById("surum-listesi");
    if (!kap) return;
    kap.textContent = "";
    liste.filter(function (r) { return !r.draft && !r.prerelease; }).forEach(function (r, i) {
      var k = el("article", "surum");
      var bas = el("div", "surum-bas");
      bas.appendChild(el("span", "surum-ad", r.name || r.tag_name));
      if (r.published_at) bas.appendChild(el("span", "surum-tarih", tarih(r.published_at)));
      if (i === 0) bas.appendChild(el("span", "surum-son", "SON SÜRÜM"));
      k.appendChild(bas);
      k.appendChild(el("p", null, (r.body || "").trim() || "Not yok."));   // (textContent: HTML yorumlanmaz)
      kap.appendChild(k);
    });
    var kaynak = document.getElementById("surum-kaynak");
    if (kaynak) kaynak.textContent = canli ? "Liste GitHub'dan canlı okunuyor." : "GitHub'a şu an ulaşılamadı; kayıtlı liste gösteriliyor.";
  }

  function sonSurum(r) {
    document.querySelectorAll("[data-surum]").forEach(function (e) { e.textContent = r.name || r.tag_name; });
    var exe = (r.assets || []).filter(function (a) { return a.name === "Bayrampasa.exe"; })[0];
    if (exe) document.querySelectorAll("[data-exe-boyut]").forEach(function (e) { e.textContent = mb(exe.size); });
  }

  var yedek = [];
  try { yedek = JSON.parse(document.getElementById("yedek-surumler").textContent); } catch (e) {}
  surumleriYaz(yedek, false);
  if (window.fetch) {
    var iptal = window.AbortController ? new AbortController() : null;
    var sure = setTimeout(function () { if (iptal) iptal.abort(); }, 8000);
    fetch(API, { headers: { Accept: "application/vnd.github+json" }, signal: iptal ? iptal.signal : undefined })
      .then(function (y) { if (!y.ok) throw new Error(y.status); return y.json(); })
      .then(function (liste) {
        clearTimeout(sure);
        if (!Array.isArray(liste) || !liste.length) return;
        var yayinda = liste.filter(function (r) { return !r.draft && !r.prerelease; });
        if (yayinda.length) { sonSurum(yayinda[0]); surumleriYaz(yayinda, true); }
      })
      .catch(function () { /* yedek liste kalır */ });
  }

  // galeri: büyütme (dialog), ok tuşları ve kaydırma
  var dlg = document.getElementById("buyut");
  var linkler = Array.prototype.slice.call(document.querySelectorAll(".galeri a"));
  if (dlg && dlg.showModal && linkler.length) {
    var img = dlg.querySelector("img"), sira = 0;
    function goster(i) { sira = (i + linkler.length) % linkler.length; var a = linkler[sira]; img.src = a.href; img.alt = a.querySelector("img").alt; }
    linkler.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); goster(i); dlg.showModal(); }); });
    dlg.querySelector(".buyut-kapat").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".sol").addEventListener("click", function () { goster(sira - 1); });
    dlg.querySelector(".sag").addEventListener("click", function () { goster(sira + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    document.addEventListener("keydown", function (e) {
      if (!dlg.open) return;
      if (e.key === "ArrowLeft") goster(sira - 1);
      if (e.key === "ArrowRight") goster(sira + 1);
    });
    var x0 = null;
    dlg.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(d) > 40) goster(sira + (d < 0 ? 1 : -1));
    });
  }
})();
