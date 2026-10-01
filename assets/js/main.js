/* «Каретный»: catalogue, filters, price calculator, booking and lead forms. Vanilla JS, works from file://. */
(function () {
  "use strict";

  var K = window.KARETNY;
  var DAY = 864e5;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function icon(name, cls) { return '<svg class="' + (cls || "icon") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function rub(n) { return num(n) + " ₽"; }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  /* Query parameters; when a viewer drops the query string, fall back to the one saved on the last internal click. */
  function pageName(path) { return (path.split("/").pop() || "index.html").split("?")[0].split("#")[0] || "index.html"; }
  function params() {
    var search = location.search;
    if (!search) {
      try {
        var nav = JSON.parse(sessionStorage.getItem("karetny-nav") || "null");
        if (nav && nav.page === pageName(location.pathname)) search = nav.q;
      } catch (e) { /* storage unavailable */ }
    }
    var o = {}; new URLSearchParams(search).forEach(function (v, k) { o[k] = v; }); return o;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var href = a.getAttribute("href");
    if (/^[a-z]+\.html\?/.test(href)) {
      try { sessionStorage.setItem("karetny-nav", JSON.stringify({ page: href.split("?")[0], q: "?" + href.split("?")[1].split("#")[0] })); } catch (err) { /* storage unavailable */ }
    } else if (/^[a-z]+\.html(#|$)/.test(href)) {
      try { sessionStorage.removeItem("karetny-nav"); } catch (err) { /* storage unavailable */ }
    }
  }, true);
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  function carById(id) { for (var i = 0; i < K.fleet.length; i++) if (K.fleet[i].id === id) return K.fleet[i]; return null; }
  function round500(n) { return Math.round(n / 500) * 500; }
  function tierFor(days) { for (var i = 0; i < K.tiers.length; i++) if (days >= K.tiers[i].from && days <= K.tiers[i].to) return K.tiers[i]; return K.tiers[K.tiers.length - 1]; }
  function dayPrice(car, days) { return round500(car.perDay * tierFor(days).k); }
  function fromPrice(car) { return dayPrice(car, 99); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseDate(s, t) { if (!s) return null; var p = s.split("-"), h = (t || "12:00").split(":"); return new Date(+p[0], +p[1] - 1, +p[2], +h[0] || 0, +h[1] || 0); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function daysBetween(a, b) { if (!a || !b) return 1; return Math.max(1, Math.ceil((b - a) / DAY - 0.01)); }
  function fmtDate(d) { return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }); }
  function popRank(c) { return c.badges.indexOf("hit") >= 0 ? 0 : c.badges.indexOf("new") >= 0 ? 1 : 2; }
  function byPop(list) { return list.map(function (c, i) { return [c, i]; }).sort(function (a, b) { return popRank(a[0]) - popRank(b[0]) || a[1] - b[1]; }).map(function (x) { return x[0]; }); }

  /* Quote: rental days, per-day price, driver shift, delivery. */
  function quote(car, from, to, mode, delivery) {
    var days = daysBetween(from, to);
    var perDay = dayPrice(car, days);
    var driver = mode === "driver" && car.driver;
    var total = days * perDay + (driver ? days * K.driverPerDay : 0) + (delivery || 0);
    return { days: days, perDay: perDay, total: total, driver: driver, deposit: driver ? 0 : car.deposit, tier: tierFor(days) };
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-shown");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-shown"); }, 3200);
  }
  function waLink(text) { return K.whatsapp + "?text=" + encodeURIComponent(text); }
  function bookHref(car, extra) {
    var q = new URLSearchParams({ car: car.id });
    if (extra) Object.keys(extra).forEach(function (k) { if (extra[k]) q.set(k, extra[k]); });
    return "booking.html?" + q.toString();
  }

  /* ---------- Reveal ---------- */
  var io = ("IntersectionObserver" in window && !reduceMotion) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function reveal(root) {
    $$(".reveal:not(.is-in)", root).forEach(function (el) { if (io) io.observe(el); else el.classList.add("is-in"); });
  }

  /* ---------- Header, drawer, counts ---------- */
  function initHeader() {
    $$("[data-drop]").forEach(function (drop) {
      var btn = $("button", drop);
      function set(open) { drop.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open ? "true" : "false"); }
      btn.addEventListener("click", function (e) { e.stopPropagation(); set(!drop.classList.contains("is-open")); });
      drop.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) set(true); });
      drop.addEventListener("mouseleave", function () { if (window.matchMedia("(hover: hover)").matches) set(false); });
      document.addEventListener("click", function () { set(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    });

    var drawer = $("#drawer"), opener = $("[data-open-drawer]");
    if (drawer && opener) {
      var setDrawer = function (open) {
        drawer.classList.toggle("is-open", open);
        drawer.setAttribute("aria-hidden", open ? "false" : "true");
        opener.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("is-locked", open);
        if (open) { var f = $(".drawer__panel button", drawer); if (f) f.focus(); } else opener.focus();
      };
      opener.addEventListener("click", function () { setDrawer(true); });
      $$("[data-close-drawer]", drawer).forEach(function (b) { b.addEventListener("click", function () { setDrawer(false); }); });
      $$(".drawer__nav a", drawer).forEach(function (a) { a.addEventListener("click", function () { if (drawer.classList.contains("is-open")) setDrawer(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false); });
    }

    var counts = { all: K.fleet.length };
    K.fleet.forEach(function (c) { counts[c.cls] = (counts[c.cls] || 0) + 1; });
    $$("[data-count]").forEach(function (el) { el.textContent = counts[el.getAttribute("data-count")] || ""; });
  }

  /* ---------- Car card (grid) and row (list) ---------- */
  function badgesHTML(c) {
    var map = { hit: ["hit", "Хит"], new: ["new", "Новинка"], sale: ["sale", "Скидка"] };
    var out = c.badges.map(function (b) { return '<span class="badge badge--' + map[b][0] + '">' + map[b][1] + "</span>"; });
    return out.length ? '<div class="badges">' + out.join("") + "</div>" : "";
  }
  function chipsHTML(c, full) {
    var chips = [
      '<span class="chip">' + icon("gauge") + c.power + " л.с.</span>",
      '<span class="chip">' + icon("timer") + String(c.accel).replace(".", ",") + " с до 100</span>",
      '<span class="chip">' + icon("users") + c.seats + " " + plural(c.seats, "место", "места", "мест") + "</span>"
    ];
    if (full) chips.unshift('<span class="chip">' + icon("engine") + esc(c.engine) + "</span>");
    chips.push(c.driver ? '<span class="chip">' + icon("steering-wheel") + "С водителем</span>" : '<span class="chip">' + icon("key") + "Только без водителя</span>");
    return '<div class="specs-row">' + chips.join("") + "</div>";
  }
  function priceHTML(c) {
    var old = c.oldPerDay ? "<s>" + rub(round500(c.oldPerDay * K.tiers[K.tiers.length - 1].k)) + "</s>" : "";
    return '<div class="price">' + old + "<b>от " + rub(fromPrice(c)) + "</b><span>/ сутки</span></div>";
  }
  function cardHTML(c, i) {
    var href = "car.html?id=" + c.id;
    return '<article class="card reveal" style="--i:' + (i % 3) + '">' +
      '<div class="card__media">' + badgesHTML(c) + '<img src="assets/cars/' + c.photo + '" alt="' + esc(c.name) + '" loading="lazy" decoding="async" style="object-position:' + c.pos + '"></div>' +
      '<div class="card__body">' +
        '<div><h3 class="card__title"><a href="' + href + '">' + esc(c.name) + '</a></h3><p class="card__meta">' + c.year + " · " + esc(K.classes[c.cls]) + "</p></div>" +
        priceHTML(c) + chipsHTML(c) +
        '<div class="card__actions"><a class="btn" href="' + bookHref(c) + '">Забронировать</a>' +
        '<a class="ibtn ibtn--wa" href="' + waLink("Здравствуйте! Хочу арендовать " + c.name) + '" target="_blank" rel="noopener" aria-label="Спросить про ' + esc(c.name) + ' в WhatsApp">' + icon("whatsapp-logo") + "</a></div>" +
      "</div></article>";
  }
  function rowHTML(c) {
    var href = "car.html?id=" + c.id;
    var range = rub(fromPrice(c)).replace(" ₽", "") + " – " + rub(c.perDay);
    return '<article class="row reveal">' +
      '<div class="card__media">' + badgesHTML(c) + '<img src="assets/cars/' + c.photo + '" alt="' + esc(c.name) + '" loading="lazy" decoding="async" style="object-position:' + c.pos + '"></div>' +
      '<div class="row__body">' +
        '<div><h3 class="card__title"><a href="' + href + '">' + esc(c.name) + '</a></h3><p class="card__meta">' + c.year + " · " + esc(c.color) + "</p></div>" +
        '<p class="row__desc">' + esc(c.summary) + "</p>" + chipsHTML(c, true) +
        '<div class="row__price">' + (c.oldPerDay ? '<s class="muted">' + rub(c.oldPerDay) + "</s>" : "") + "<b>" + range + "</b><span>/ сутки</span></div>" +
        (c.perHour ? '<p class="note">С водителем от ' + rub(c.perHour) + " в час, минимум 3 часа</p>" : "") +
        '<div class="row__actions"><a class="btn" href="' + bookHref(c) + '">Забронировать</a>' +
        '<a class="ibtn ibtn--wa" href="' + waLink("Здравствуйте! Хочу арендовать " + c.name) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + icon("whatsapp-logo") + "</a>" +
        '<a class="ibtn ibtn--tg" href="' + K.telegram + '" target="_blank" rel="noopener" aria-label="Telegram">' + icon("telegram-logo") + "</a>" +
        '<a class="ibtn" href="' + K.phoneHref + '" aria-label="Позвонить">' + icon("phone") + "</a></div>" +
      "</div></article>";
  }

  function tabsHTML(active) {
    var counts = {};
    K.fleet.forEach(function (c) { counts[c.cls] = (counts[c.cls] || 0) + 1; });
    var out = ['<button class="tab" type="button" data-cls="" aria-pressed="' + (!active) + '">Все <span>' + K.fleet.length + "</span></button>"];
    Object.keys(K.classes).forEach(function (k) {
      out.push('<button class="tab" type="button" data-cls="' + k + '" aria-pressed="' + (active === k) + '">' + K.classes[k] + " <span>" + counts[k] + "</span></button>");
    });
    return out.join("");
  }

  /* ---------- Home ---------- */
  function initHome() {
    var grid = $("#home-cards"), tabs = $("#home-tabs"), more = $("#home-more");
    if (!grid) return;
    var LIMIT = 9;
    function render(cls) {
      tabs.innerHTML = tabsHTML(cls);
      var list = byPop(K.fleet.filter(function (c) { return !cls || c.cls === cls; }));
      grid.innerHTML = list.slice(0, LIMIT).map(cardHTML).join("");
      var rest = list.length - LIMIT;
      more.href = "fleet.html" + (cls ? "?cls=" + cls : "");
      more.innerHTML = (rest > 0 ? "Ещё " + rest + " " + plural(rest, "автомобиль", "автомобиля", "автомобилей") : "Каталог с фильтрами") + " " + icon("arrow-right", "icon icon--go");
      reveal(grid);
    }
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".tab"); if (!b) return;
      render(b.getAttribute("data-cls"));
    });
    render("");
  }

  /* ---------- Fleet catalogue ---------- */
  function initFleet() {
    var rows = $("#fleet-rows"); if (!rows) return;
    var p = params();
    var state = {
      cls: p.cls ? p.cls.split(",") : [],
      brand: p.brand ? p.brand.split(",") : [],
      min: p.min ? +p.min : 0, max: p.max ? +p.max : 0,
      seats: 0, driver: p.driver === "1", sale: false, sort: "pop"
    };
    var brands = [];
    K.fleet.forEach(function (c) { if (brands.indexOf(c.brand) < 0) brands.push(c.brand); });
    brands.sort();
    function countBy(key, val) { return K.fleet.filter(function (c) { return c[key] === val; }).length; }

    $("#f-cls").innerHTML = Object.keys(K.classes).map(function (k) {
      return '<label class="check"><input type="checkbox" value="' + k + '"' + (state.cls.indexOf(k) >= 0 ? " checked" : "") + ">" + K.classes[k] + "<span>" + countBy("cls", k) + "</span></label>";
    }).join("");
    $("#f-brand").innerHTML = brands.map(function (b) {
      return '<label class="check"><input type="checkbox" value="' + esc(b) + '"' + (state.brand.indexOf(b) >= 0 ? " checked" : "") + ">" + esc(b) + "<span>" + countBy("brand", b) + "</span></label>";
    }).join("");
    var prices = K.fleet.map(fromPrice);
    $("#f-min").placeholder = "от " + num(Math.min.apply(null, prices));
    $("#f-max").placeholder = "до " + num(Math.max.apply(null, K.fleet.map(function (c) { return c.perDay; })));
    if (state.min) $("#f-min").value = state.min;
    if (state.max) $("#f-max").value = state.max;
    $("#f-driver").checked = state.driver;

    function apply() {
      var list = K.fleet.filter(function (c) {
        if (state.cls.length && state.cls.indexOf(c.cls) < 0) return false;
        if (state.brand.length && state.brand.indexOf(c.brand) < 0) return false;
        var fp = fromPrice(c);
        if (state.min && c.perDay < state.min) return false;
        if (state.max && fp > state.max) return false;
        if (state.seats === 2 && c.seats !== 2) return false;
        if (state.seats === 4 && c.seats < 4) return false;
        if (state.seats === 5 && c.seats < 5) return false;
        if (state.driver && !c.driver) return false;
        if (state.sale && !c.oldPerDay) return false;
        return true;
      });
      if (state.sort === "pop") list = byPop(list);
      if (state.sort === "cheap") list.sort(function (a, b) { return fromPrice(a) - fromPrice(b); });
      if (state.sort === "dear") list.sort(function (a, b) { return fromPrice(b) - fromPrice(a); });
      if (state.sort === "power") list.sort(function (a, b) { return b.power - a.power; });
      if (state.sort === "new") list.sort(function (a, b) { return b.year - a.year; });

      $("#fleet-tabs").innerHTML = tabsHTML(state.cls.length === 1 ? state.cls[0] : (state.cls.length ? "-" : ""));
      $("#fleet-count").innerHTML = "Найдено <b>" + list.length + "</b> " + plural(list.length, "автомобиль", "автомобиля", "автомобилей");
      var applyBtn = $("#f-apply"); if (applyBtn) applyBtn.textContent = "Показать " + list.length;
      rows.innerHTML = list.length ? list.map(rowHTML).join("") :
        '<div class="empty"><b>Под эти фильтры машин нет</b><span>Попробуйте убрать марку или расширить цену. Или позвоните: подберём похожую.</span><button class="btn btn--ghost btn--sm" type="button" data-reset>Сбросить фильтры</button></div>';
      reveal(rows);

      var title = $("#fleet-title");
      if (state.cls.length === 1) title.textContent = K.classes[state.cls[0]] + " в аренду";
      else if (state.brand.length === 1) title.textContent = "Аренда " + state.brand[0] + " в Москве";
      else if (state.driver) title.textContent = "Аренда с водителем";
      else title.textContent = "Автопарк премиум-класса";

      var q = new URLSearchParams();
      if (state.cls.length) q.set("cls", state.cls.join(","));
      if (state.brand.length) q.set("brand", state.brand.join(","));
      if (state.min) q.set("min", state.min);
      if (state.max) q.set("max", state.max);
      if (state.driver) q.set("driver", "1");
      try { history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q.toString() : "")); } catch (e) { /* file:// may refuse */ }
    }

    function syncChecks() {
      $$("#f-cls input").forEach(function (i) { i.checked = state.cls.indexOf(i.value) >= 0; });
      $$("#f-brand input").forEach(function (i) { i.checked = state.brand.indexOf(i.value) >= 0; });
    }
    $("#f-cls").addEventListener("change", function () { state.cls = $$("#f-cls input:checked").map(function (i) { return i.value; }); apply(); });
    $("#f-brand").addEventListener("change", function () { state.brand = $$("#f-brand input:checked").map(function (i) { return i.value; }); apply(); });
    $("#f-min").addEventListener("input", function () { state.min = +this.value || 0; apply(); });
    $("#f-max").addEventListener("input", function () { state.max = +this.value || 0; apply(); });
    $("#f-seats").addEventListener("change", function (e) { state.seats = +e.target.value; apply(); });
    $("#f-driver").addEventListener("change", function () { state.driver = this.checked; apply(); });
    $("#f-sale").addEventListener("change", function () { state.sale = this.checked; apply(); });
    $("#f-sort").addEventListener("change", function () { state.sort = this.value; apply(); });
    $("#fleet-tabs").addEventListener("click", function (e) {
      var b = e.target.closest(".tab"); if (!b) return;
      var k = b.getAttribute("data-cls"); state.cls = k ? [k] : []; syncChecks(); apply();
    });
    function reset() {
      state.cls = []; state.brand = []; state.min = 0; state.max = 0; state.seats = 0; state.driver = false; state.sale = false;
      syncChecks(); $("#f-min").value = ""; $("#f-max").value = ""; $("#f-driver").checked = false; $("#f-sale").checked = false;
      $("#f-seats input[value='0']").checked = true; apply();
    }
    $("#f-reset").addEventListener("click", reset);
    rows.addEventListener("click", function (e) { if (e.target.closest("[data-reset]")) reset(); });

    var filters = $("#filters"), scrim = $("#scrim"), opener = $("#filters-open");
    function setFilters(open) {
      filters.classList.toggle("is-open", open); scrim.classList.toggle("is-shown", open);
      document.body.classList.toggle("is-locked", open); opener.setAttribute("aria-expanded", open ? "true" : "false");
    }
    opener.addEventListener("click", function () { setFilters(true); });
    scrim.addEventListener("click", function () { setFilters(false); });
    $$("[data-close-filters]").forEach(function (b) { b.addEventListener("click", function () { setFilters(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && filters.classList.contains("is-open")) setFilters(false); });

    apply();
  }

  /* ---------- Car page ---------- */
  function specHTML(ic, label, val) { return '<div class="spec"><small>' + icon(ic) + label + "</small><b>" + val + "</b></div>"; }
  function initCar() {
    var gallery = $("#car-gallery"); if (!gallery) return;
    var p = params();
    var c = carById(p.id) || K.fleet[0];
    document.title = "Аренда " + c.name + " в Москве | Каретный";
    $("#car-crumb").textContent = c.name;
    $("#car-title").textContent = "Аренда " + c.name;
    $("#car-from").innerHTML = "от <b>" + rub(fromPrice(c)) + "</b> в сутки" + (c.perHour ? " · с водителем от " + rub(c.perHour) + " в час" : "");
    gallery.innerHTML = badgesHTML(c) + '<img src="assets/cars/' + c.photo + '" alt="' + esc(c.name) + '" style="object-position:' + c.pos + '">';
    $("#car-specs").innerHTML = [
      specHTML("engine", "Двигатель", esc(c.engine)), specHTML("gauge", "Мощность", c.power + " л.с."),
      specHTML("timer", "0–100 км/ч", String(c.accel).replace(".", ",") + " с"), specHTML("road-horizon", "Макс. скорость", c.top + " км/ч"),
      specHTML("car", "Привод", c.drive), specHTML("calendar-blank", "Год", c.year),
      specHTML("users", "Мест", c.seats), specHTML("tag", "Цвет", esc(c.color))
    ].join("");
    $("#car-tariffs").innerHTML = K.tiers.map(function (t, i) {
      return '<div data-tier="' + i + '"><dt>' + t.label + "</dt><dd>" + rub(round500(c.perDay * t.k)) + "</dd></div>";
    }).join("") + (c.perHour ? '<div><dt>С водителем, час</dt><dd>' + rub(c.perHour) + " <small>от 3 ч</small></dd></div>" : "");
    $("#car-facts").innerHTML =
      "<div><dt>Залог без водителя</dt><dd>" + rub(c.deposit) + "</dd></div>" +
      "<div><dt>Включённый пробег</dt><dd>" + K.mileagePerDay + " км/сутки</dd></div>" +
      "<div><dt>Сверх лимита</dt><dd>" + (c.power >= 700 ? 150 : K.overMileage) + " ₽/км</dd></div>" +
      "<div><dt>Требования</dt><dd>" + (c.deposit >= 500000 ? "от 30 лет, стаж от 8 лет" : "от 23 лет, стаж от 3 лет") + "</dd></div>";
    $("#car-about").textContent = c.about;
    $("#car-features").innerHTML = c.features.map(function (f) { return "<li>" + icon("check") + esc(f) + "</li>"; }).join("");

    var from = $("#c-from"), to = $("#c-to");
    var t0 = today();
    from.min = isoDate(t0); to.min = isoDate(addDays(t0, 1));
    from.value = isoDate(t0); to.value = isoDate(addDays(t0, 1));
    var driverInput = $("#c-mode input[value='driver']");
    if (!c.driver) { driverInput.disabled = true; driverInput.closest("label").title = "Эта машина выдаётся только без водителя"; }

    function calc() {
      var a = parseDate(from.value), b = parseDate(to.value);
      if (a && b && b <= a) { b = addDays(a, 1); to.value = isoDate(b); }
      to.min = isoDate(addDays(a || t0, 1));
      var mode = ($("#c-mode input:checked") || {}).value;
      var q = quote(c, a, b, mode, 0);
      $("#c-days").textContent = q.days + " " + plural(q.days, "сутки", "суток", "суток") + " × " + rub(q.perDay) + (q.driver ? " + водитель" : "");
      $("#c-total").textContent = rub(q.total);
      $("#c-deposit").textContent = q.deposit ? "+ залог " + rub(q.deposit) + ", вернём" : "без залога";
      $$("#car-tariffs [data-tier]").forEach(function (row) { row.classList.toggle("is-active", K.tiers[+row.getAttribute("data-tier")] === q.tier); });
      $("#c-note").textContent = q.driver ? "Смена водителя до 10 часов: " + rub(K.driverPerDay) + " в сутки. Почасово от " + rub(c.perHour) + ", минимум 3 часа." :
        (c.driver ? "Бесплатная подача в пределах Садового кольца. Страховка КАСКО включена." : "Только без водителя. Бесплатная подача в пределах Садового кольца.");
      var href = bookHref(c, { from: from.value, to: to.value, mode: q.driver ? "driver" : "" });
      $("#c-book").href = href;
      var mb = $("[data-mbar-book]"); if (mb) mb.href = href;
      $("#c-wa").href = waLink("Здравствуйте! Хочу арендовать " + c.name + " с " + fmtDate(a) + " по " + fmtDate(b) + ".");
    }
    from.addEventListener("change", calc); to.addEventListener("change", calc);
    $("#c-mode").addEventListener("change", calc);
    calc();

    var similar = K.fleet.filter(function (x) { return x.cls === c.cls && x.id !== c.id; });
    K.fleet.forEach(function (x) { if (similar.length < 3 && x.id !== c.id && similar.indexOf(x) < 0) similar.push(x); });
    similar.sort(function (a, b) { return Math.abs(a.perDay - c.perDay) - Math.abs(b.perDay - c.perDay); });
    $("#car-similar").innerHTML = similar.slice(0, 3).map(cardHTML).join("");
    reveal($("#car-similar"));
  }

  /* ---------- Phone mask & validation ---------- */
  function digits(v) { var d = v.replace(/\D/g, ""); if (d[0] === "8") d = "7" + d.slice(1); if (d[0] !== "7") d = "7" + d; return d.slice(0, 11); }
  function maskPhone(input) {
    input.addEventListener("focus", function () { if (!input.value) input.value = "+7 "; });
    input.addEventListener("input", function () {
      var d = digits(input.value).slice(1), out = "+7";
      if (d.length) out += " (" + d.slice(0, 3);
      if (d.length >= 3) out += ") " + d.slice(3, 6);
      if (d.length >= 6) out += "-" + d.slice(6, 8);
      if (d.length >= 8) out += "-" + d.slice(8, 10);
      input.value = out;
    });
    input.addEventListener("blur", function () { if (input.value.replace(/\D/g, "").length <= 1) input.value = ""; });
  }
  function phoneOk(v) { return v.replace(/\D/g, "").length === 11; }
  function setInvalid(field, bad) { if (field) field.classList.toggle("is-invalid", !!bad); }
  function requestNo() { return "К-" + String(Date.now()).slice(-6); }

  function initLeadForms() {
    $$("[data-phone-mask]").forEach(maskPhone);
    $$(".js-lead").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = form.elements.name, phone = form.elements.phone, agree = form.elements.agree;
        var badName = !name.value.trim(), badPhone = !phoneOk(phone.value), badAgree = !agree.checked;
        setInvalid(name.closest(".field"), badName); setInvalid(phone.closest(".field"), badPhone);
        agree.closest(".check").classList.toggle("is-invalid", badAgree);
        if (badName) { name.focus(); return; }
        if (badPhone) { phone.focus(); return; }
        if (badAgree) { toast("Нужно согласие на обработку данных"); return; }
        var no = requestNo();
        $$(".field, .check, button[type=submit]", form).forEach(function (el) { el.hidden = true; });
        var done = $(".done", form); $("code", done).textContent = no; done.classList.add("is-shown");
        store.set("karetny-lead", { no: no, at: Date.now() });
      });
    });
  }

  /* ---------- Booking ---------- */
  var DELIVERY = { office: 0, garden: 0, mkad: 3000, airport: 5000 };
  function initBooking() {
    var form = $("#booking-form"); if (!form) return;
    var p = params();
    var sel = $("#b-car");
    sel.innerHTML = Object.keys(K.classes).map(function (k) {
      return '<optgroup label="' + K.classes[k] + '">' + K.fleet.filter(function (c) { return c.cls === k; }).map(function (c) {
        return '<option value="' + c.id + '">' + esc(c.name) + " · от " + rub(fromPrice(c)) + "</option>";
      }).join("") + "</optgroup>";
    }).join("");
    var draft = store.get("karetny-draft") || {};
    sel.value = carById(p.car) ? p.car : (carById(draft.car) ? draft.car : "g63");

    var from = $("#b-from"), to = $("#b-to"), place = $("#b-place");
    var t0 = today();
    from.min = isoDate(t0);
    from.value = p.from && parseDate(p.from) >= t0 ? p.from : isoDate(t0);
    to.value = p.to && parseDate(p.to) > parseDate(from.value) ? p.to : isoDate(addDays(parseDate(from.value), 1));
    if (p.mode === "driver" || p.driver === "1") $("#b-mode input[value='driver']").checked = true;
    ["name", "phone", "comment"].forEach(function (k) { if (draft[k] && form.elements[k]) form.elements[k].value = draft[k]; });

    function car() { return carById(sel.value); }
    function calc() {
      var c = car();
      var drv = $("#b-mode input[value='driver']");
      drv.disabled = !c.driver;
      if (!c.driver && drv.checked) { $("#b-mode input[value='self']").checked = true; }
      var a = parseDate(from.value, $("#b-from-time").value), b = parseDate(to.value, $("#b-to-time").value);
      to.min = from.value;
      var mode = ($("#b-mode input:checked") || {}).value;
      var q = quote(c, a, b, mode, DELIVERY[place.value]);
      $("#b-address-field").hidden = place.value === "office";
      $("#s-media").innerHTML = '<img src="assets/cars/' + c.photo + '" alt="' + esc(c.name) + '" style="object-position:' + c.pos + '">';
      $("#s-name").textContent = c.name;
      $("#s-facts").innerHTML =
        "<div><dt>Получение</dt><dd>" + (a ? fmtDate(a) + ", " + $("#b-from-time").value : "—") + "</dd></div>" +
        "<div><dt>Возврат</dt><dd>" + (b ? fmtDate(b) + ", " + $("#b-to-time").value : "—") + "</dd></div>" +
        "<div><dt>Тариф</dt><dd>" + rub(q.perDay) + " × " + q.days + "</dd></div>" +
        (q.driver ? "<div><dt>Водитель</dt><dd>" + rub(K.driverPerDay) + " × " + q.days + "</dd></div>" : "") +
        "<div><dt>Доставка</dt><dd>" + (DELIVERY[place.value] ? rub(DELIVERY[place.value]) : "бесплатно") + "</dd></div>" +
        "<div><dt>Включённый пробег</dt><dd>" + num(K.mileagePerDay * q.days) + " км</dd></div>";
      $("#s-days").textContent = "Итого за " + q.days + " " + plural(q.days, "сутки", "суток", "суток");
      $("#s-total").textContent = rub(q.total);
      $("#s-deposit").textContent = q.deposit ? "+ залог " + rub(q.deposit) + ", возвращается" : "без залога";
      store.set("karetny-draft", { car: c.id, name: form.elements.name.value, phone: form.elements.phone.value, comment: form.elements.comment.value });
      return q;
    }
    form.addEventListener("input", calc);
    form.addEventListener("change", calc);
    calc();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errs = [];
      var a = parseDate(from.value), b = parseDate(to.value, $("#b-to-time").value), aT = parseDate(from.value, $("#b-from-time").value);
      function check(id, bad, msg) { var el = $("#" + id); setInvalid(el.closest(".field"), bad); if (bad) errs.push([id, msg]); }
      check("b-from", !a || a < t0, "Дата получения");
      check("b-to", !b || !aT || b <= aT, "Дата возврата");
      check("b-address", place.value !== "office" && !$("#b-address").value.trim(), "Адрес доставки");
      check("b-name", !form.elements.name.value.trim(), "Имя");
      check("b-phone", !phoneOk(form.elements.phone.value), "Телефон");
      var agree = $("#b-agree");
      $("#b-agree-wrap").classList.toggle("is-invalid", !agree.checked);
      if (!agree.checked) errs.push(["b-agree", "Согласие на обработку данных"]);
      var box = $("#form-errors");
      if (errs.length) {
        box.innerHTML = "Проверьте поля:<ul>" + errs.map(function (x) { return '<li><a href="#' + x[0] + '">' + x[1] + "</a></li>"; }).join("") + "</ul>";
        box.classList.add("is-shown"); box.focus();
        return;
      }
      box.classList.remove("is-shown");
      var q = calc(), c = car(), no = requestNo();
      form.hidden = true;
      $("#done-no").textContent = no;
      $("#done-text").textContent = c.name + ", " + fmtDate(a) + " – " + fmtDate(b) + ", " + rub(q.total) + (q.deposit ? " + залог " + rub(q.deposit) : "") + ".";
      var done = $("#booking-done"); done.classList.add("is-shown"); done.focus();
      store.set("karetny-last", { no: no, car: c.id, at: Date.now() });
      store.set("karetny-draft", null);
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    $("#form-errors").addEventListener("click", function (e) {
      var a = e.target.closest("a"); if (!a) return;
      e.preventDefault(); var el = $(a.getAttribute("href")); if (el) el.focus();
    });

    var bar = $("#mbar"); if (bar) bar.hidden = true;
  }

  /* ---------- Mobile bar tuck: hide while the page's own booking button is visible ---------- */
  function initBarTuck() {
    var bar = $("#mbar"), target = $("#c-book") || $(".lead-band form");
    if (!bar || !target || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { bar.classList.toggle("is-tucked", e.isIntersecting); });
    }).observe(target);
  }

  initHeader();
  initHome();
  initFleet();
  initCar();
  initBooking();
  initLeadForms();
  initBarTuck();
  reveal(document);
})();
