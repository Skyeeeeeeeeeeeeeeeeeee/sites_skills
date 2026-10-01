/* «Каретный» - site script. Plain JS, works from file:// without a build step. */
(function () {
  "use strict";

  var K = window.KARETNY;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEP = 15;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function icon(name) { return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; }
  function pad(n) { return String(n).padStart(2, "0"); }

  function rub(n) { return Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ") + " ₽"; }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  function hoursWord(n) { return n + " " + plural(n, "час", "часа", "часов"); }
  function daysWord(n) { return n + " " + plural(n, "сутки", "суток", "суток"); }

  function store(action, key, value) {
    try {
      if (action === "get") return JSON.parse(window.localStorage.getItem(key));
      if (action === "set") window.localStorage.setItem(key, JSON.stringify(value));
      if (action === "remove") window.localStorage.removeItem(key);
    } catch (e) { return null; }
    return null;
  }

  function carById(id) {
    for (var i = 0; i < K.fleet.length; i++) if (K.fleet[i].id === id) return K.fleet[i];
    return null;
  }

  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseIso(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(iso, n) { var d = parseIso(iso); d.setDate(d.getDate() + n); return isoDate(d); }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fromMin(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function humanDate(iso) {
    var today = isoDate(new Date());
    if (iso === today) return "сегодня";
    if (iso === addDays(today, 1)) return "завтра";
    return parseIso(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
  }

  /* Earliest pickup: now + lead time, rounded up to the next quarter hour. */
  function earliest() {
    var d = new Date(Date.now() + K.leadMinutes * 60000);
    var m = d.getHours() * 60 + d.getMinutes();
    var r = Math.ceil(m / STEP) * STEP;
    if (r >= 1440) { d.setDate(d.getDate() + 1); r = 0; }
    return { date: isoDate(d), time: fromMin(r) };
  }
  function isTooEarly(date, time) {
    var e = earliest();
    if (date < e.date) return true;
    if (date === e.date && toMin(time) < toMin(e.time)) return true;
    return false;
  }

  /* Price model */
  function isNight(time) { return toMin(time) < 360; }
  function quote(car, mode, amount, time) {
    if (!car) return null;
    if (mode === "self" || car.selfDriveOnly) {
      var days = Math.max(1, amount || 1);
      return { total: car.perDay * days, unit: daysWord(days), rate: rub(car.perDay) + " / сутки", night: false };
    }
    var hours = Math.max(car.minHours, amount || car.minHours);
    var night = time ? isNight(time) : false;
    var total = car.perHour * hours * (night ? 1 + K.nightSurcharge : 1);
    return { total: total, unit: hoursWord(hours), rate: rub(car.perHour) + " / час", night: night };
  }
  function fromPrice(car) {
    return car.selfDriveOnly ? "от " + rub(car.perDay) + " / сутки" : "от " + rub(car.perHour) + " / час";
  }

  /* Shared selection carried between pages */
  function loadSel() {
    var s = store("get", "karetny-sel") || {};
    var e = earliest();
    var car = carById(s.car) || carById("g63");
    var mode = s.mode === "self" || car.selfDriveOnly ? "self" : "driver";
    var date = s.date && s.date >= e.date ? s.date : e.date;
    var time = s.time || "22:30";
    if (isTooEarly(date, time)) time = e.time;
    return { car: car.id, mode: mode, date: date, time: time, amount: s.amount || null };
  }
  function saveSel(sel) { store("set", "karetny-sel", sel); }
  function bookingHref(sel) {
    var p = new URLSearchParams({ car: sel.car, mode: sel.mode, date: sel.date, time: sel.time });
    if (sel.amount) p.set("amount", sel.amount);
    return "booking.html?" + p.toString();
  }

  function toast(text) {
    var el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("is-visible");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("is-visible"); }, 2800);
  }

  function flash(el) {
    if (!el || reduceMotion) return;
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }
  function setText(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    flash(el);
  }

  /* ---------- Header and menu ---------- */
  function initHeader() {
    var toggle = $(".menu-toggle");
    var menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = icon(open ? "x" : "list") + '<span class="visually-hidden">' + (open ? "Закрыть меню" : "Открыть меню") + "</span>";
      menu.classList.toggle("is-open", open);
      if (open) menu.removeAttribute("inert"); else menu.setAttribute("inert", "");
      document.body.style.overflow = open ? "hidden" : "";
    }
    setOpen(false);
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) { if (e.matches) setOpen(false); });
  }

  function fillContacts() {
    $$("[data-phone]").forEach(function (a) { a.href = K.phoneHref; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function setTint(color) { document.documentElement.style.setProperty("--tint", color); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* Garage doors: reveal boxes as they scroll into view */
  function initDoors(root) {
    var doors = $$(".gbox--toggle:not(.is-open)", root);
    if (!doors.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) { doors.forEach(function (d) { d.classList.add("is-open"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-open"); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    doors.forEach(function (d) { io.observe(d); });
  }

  /* Evening: the times light up one after another when the paragraph is read */
  function initEvening() {
    var text = $(".evening__text");
    if (!text) return;
    $$("time", text).forEach(function (t, i) { t.style.setProperty("--i", i); });
    if (!("IntersectionObserver" in window)) { text.classList.add("is-lit"); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { text.classList.add("is-lit"); io.disconnect(); }
    }, { threshold: 0.45 });
    io.observe(text);
  }

  /* ---------- Garage box markup ---------- */
  function boxNo(car) { return K.fleet.indexOf(car) + 1; }
  function gboxHTML(c, opts) {
    opts = opts || {};
    var tag = opts.tag || "a";
    var href = tag === "a" ? ' href="car.html?id=' + c.id + '"' : "";
    return "<" + tag + ' class="gbox ' + (opts.cls || "") + '"' + href + ' style="--tint:' + c.tint + '" data-car="' + c.id + '"' + (opts.label ? ' aria-label="' + opts.label + '"' : "") + ">" +
      '<span class="gbox__bay"><img src="assets/cars/' + c.photo + '" alt="' + (opts.alt ? c.name : "") + '" loading="' + (opts.eager ? "eager" : "lazy") + '" decoding="async" width="1920" height="1200" style="object-position:' + c.pos + '"></span>' +
      '<span class="gbox__shade"></span>' +
      '<span class="gbox__body">' +
        '<span class="gbox__label">Бокс ' + boxNo(c) + "</span>" +
        '<span class="gbox__name">' + c.name + "</span>" +
        '<span class="gbox__price">' + fromPrice(c) + "</span>" +
        '<span class="gbox__light">' + cap(c.tintName) + "</span>" +
        (c.selfDriveOnly ? '<span class="gbox__flag">Только без водителя</span>' : "") +
      "</span>" +
      '<span class="gbox__door" aria-hidden="true"><span class="gbox__no">' + boxNo(c) + '</span><span class="gbox__handle"></span></span>' +
      "</" + tag + ">";
  }

  /* ---------- Dock: picks up the car in front of you ---------- */
  var dock = null;
  function initDock(startCar) {
    var el = $("#dock");
    if (!el || !$("#dock-day")) return null;
    var sel = loadSel();
    if (startCar) { sel.car = startCar.id; if (startCar.selfDriveOnly) sel.mode = "self"; }
    var daySel = $("#dock-day"), timeOut = $("#dock-time");
    var driver = $('input[name="dock-mode"][value="driver"]', el), self = $('input[name="dock-mode"][value="self"]', el);

    function fillDays() {
      var e = earliest(), opts = [];
      for (var i = 0; i < 14; i++) {
        var iso = addDays(e.date, i);
        var label = humanDate(iso);
        if (label.indexOf(",") > -1 || label.length > 10) label = parseIso(iso).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });
        opts.push('<option value="' + iso + '">' + cap(label) + "</option>");
      }
      daySel.innerHTML = opts.join("");
    }
    function render(changed) {
      var car = carById(sel.car);
      if (car.selfDriveOnly) sel.mode = "self";
      if (isTooEarly(sel.date, sel.time)) { var e = earliest(); sel.date = e.date; sel.time = e.time; }
      driver.disabled = !!car.selfDriveOnly;
      driver.checked = sel.mode === "driver"; self.checked = sel.mode === "self";
      daySel.value = sel.date;
      setText(timeOut, sel.time);
      var q = quote(car, sel.mode, null, sel.time);
      setText($("#dock-name"), car.short);
      $("#dock-label").textContent = "Бокс " + boxNo(car) + ", перед вами";
      setText($("#dock-total"), rub(q.total));
      $("#dock-unit").textContent = (sel.mode === "self" ? "за сутки" : "за " + q.unit) + (q.night ? ", ночной тариф" : "");
      $("#dock-go").href = bookingHref(sel);
      setTint(car.tint);
      $$("[data-t]").forEach(function (t) { t.textContent = fromMin(toMin(sel.time) + +t.getAttribute("data-t")); });
      saveSel(sel);
      if (changed && !reduceMotion) flash($("#dock-total"));
    }
    function shift(d) {
      var m = toMin(sel.time) + d;
      if (m >= 1440) { m -= 1440; sel.date = addDays(sel.date, 1); }
      if (m < 0) { var prev = addDays(sel.date, -1); if (prev >= earliest().date) { m += 1440; sel.date = prev; } else m = toMin(earliest().time); }
      sel.time = fromMin(m);
      render(true);
    }
    $("#dock-minus").addEventListener("click", function () { shift(-STEP); });
    $("#dock-plus").addEventListener("click", function () { shift(STEP); });
    daySel.addEventListener("change", function () { sel.date = daySel.value; render(true); });
    [driver, self].forEach(function (r) { r.addEventListener("change", function () { sel.mode = r.value; render(true); }); });
    fillDays();
    render(false);
    return {
      setCar: function (car) {
        if (sel.car === car.id) return;
        var prev = carById(sel.car);
        sel.car = car.id;
        if (!car.selfDriveOnly && prev && prev.selfDriveOnly) sel.mode = "driver";
        render(true);
      }
    };
  }

  /* One primary action per viewport: tuck the dock while the form's own submit is visible */
  function initDockTuck() {
    var d = $("#dock"), own = $(".form-actions .btn");
    if (!d || !own || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (en) { d.classList.toggle("is-tucked", en[0].isIntersecting); }).observe(own);
  }

  /* ---------- Home: the street ---------- */
  function initStreet() {
    var street = $("#street");
    if (!street) return;
    var track = $("#street-track");
    var end = $(".street__end", track);
    var html = "";
    K.fleet.forEach(function (c, i) {
      html += '<span class="street__lamp" aria-hidden="true"></span>' + gboxHTML(c, { eager: i < 2 });
    });
    end.insertAdjacentHTML("beforebegin", html + '<span class="street__lamp" aria-hidden="true"></span>');
    var boxes = $$(".gbox", track);
    dock = initDock();
    initEvening();

    var stack = reduceMotion || window.matchMedia("(max-width: 900px)").matches;
    if (stack) {
      street.classList.add("street--stack");
      boxes.forEach(function (b) { b.classList.add("gbox--toggle"); });
      if (reduceMotion) boxes.forEach(function (b) { b.classList.add("is-open"); });
      else initDoors(track);
      // the box nearest the middle of the screen is the one the dock picks up
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting && dock) dock.setCar(carById(en.target.getAttribute("data-car"))); });
        }, { rootMargin: "-45% 0px -45% 0px" });
        boxes.forEach(function (b) { io.observe(b); });
      }
      return;
    }

    // Desktop: vertical scroll walks the street sideways. The page height gives the walk its length.
    var sticky = $(".street__sticky", street);
    var bar = $(".street__progress span", street);
    var distance = 0, raf = 0, running = false, current = null, firstOpen = 0;
    function measure() {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      street.style.height = (window.innerHeight + distance) + "px";
    }
    function frame(now) {
      var r = street.getBoundingClientRect();
      var p = distance ? Math.min(1, Math.max(0, -r.top / distance)) : 0;
      track.style.transform = "translate3d(" + (-p * distance).toFixed(1) + "px,0,0)";
      bar.style.setProperty("--p", p.toFixed(4));
      var vw = window.innerWidth, best = null, bestD = 1e9;
      boxes.forEach(function (b, i) {
        var br = b.getBoundingClientRect();
        var center = br.left + br.width / 2;
        // a door opens as its box walks in from the right edge towards the middle of the street
        var open = Math.min(1, Math.max(0, (vw * 0.98 - br.left) / (vw * 0.5)));
        if (i === 0) open = Math.max(open, firstOpen);
        b.style.setProperty("--open", open.toFixed(3));
        var d = Math.abs(center - vw * 0.55);
        if (open > 0.6 && d < bestD) { bestD = d; best = b; }
      });
      if (best && best !== current) { current = best; if (dock) dock.setCar(carById(best.getAttribute("data-car"))); }
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    measure();
    window.addEventListener("resize", function () { clearTimeout(measure._t); measure._t = setTimeout(function () { measure(); }, 120); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); else { frame(0); stop(); } }).observe(street);
    } else start();

    // First animation: the first box's door rolls up and its light comes on
    var t0 = null;
    function openFirst(now) {
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0 - 450) / 1600);
      if (k < 0) k = 0;
      firstOpen = 1 - Math.pow(1 - k, 3);
      if (!running) frame(now);
      if (k < 1) requestAnimationFrame(openFirst);
    }
    requestAnimationFrame(openFirst);
  }

  /* ---------- Garage page: floor plan ---------- */
  function initFloor() {
    var floor = $("#floor");
    if (!floor) return;
    floor.innerHTML = K.fleet.map(function (c) { return gboxHTML(c, { cls: "gbox--toggle", label: "Бокс " + boxNo(c) + ": " + c.name + ", " + fromPrice(c) }); }).join("");
    $$(".gbox", floor).forEach(function (b, i) { b.style.setProperty("--i", i); });
    initDoors(floor);
    var form = $("#filters");
    var preset = new URLSearchParams(location.search).get("class");
    if (preset && $('input[value="' + preset + '"]', form)) $('input[value="' + preset + '"]', form).checked = true;
    function apply() {
      var cls = $('input[name="cls"]:checked', form).value, n = 0;
      $$(".gbox", floor).forEach(function (b) {
        var on = cls === "all" || carById(b.getAttribute("data-car")).cls === cls;
        b.classList.toggle("is-dim", !on);
        if (on) { n++; b.removeAttribute("tabindex"); b.removeAttribute("aria-hidden"); } else { b.setAttribute("tabindex", "-1"); b.setAttribute("aria-hidden", "true"); }
      });
      $("#floor-count").textContent = "Показано " + n + " " + plural(n, "бокс", "бокса", "боксов");
    }
    form.addEventListener("change", function () {
      apply();
      var cls = $('input[name="cls"]:checked', form).value;
      var u = new URL(location.href);
      if (cls === "all") u.searchParams.delete("class"); else u.searchParams.set("class", cls);
      history.replaceState(null, "", u);
    });
    apply();
  }

  /* ---------- Car page: the box opens on arrival ---------- */
  function initCar() {
    var root = $("#car-page");
    if (!root) return;
    var car = carById(new URLSearchParams(location.search).get("id"));
    if (!car) {
      root.innerHTML = '<div class="container page-head"><h1 class="display">Такого бокса нет</h1><p class="lead">Возможно, ссылка устарела. Все машины на схеме гаража.</p><p><a class="btn" href="fleet.html">Схема гаража ' + icon("arrow-right") + "</a></p></div>";
      var d = $("#dock"); if (d) d.hidden = true;
      return;
    }
    document.title = car.name + ", бокс " + boxNo(car) + " | Каретный";
    var desc = $('meta[name="description"]');
    if (desc) desc.content = car.name + ": аренда " + (car.selfDriveOnly ? "без водителя" : "с водителем и без") + " в Москве, " + fromPrice(car) + ".";
    var box = $("#carbox");
    box.style.setProperty("--tint", car.tint);
    var img = $("#car-img");
    img.src = "assets/cars/" + car.photo; img.alt = car.name + ", " + car.color; img.style.objectPosition = car.pos;
    $("[data-car-no]").textContent = boxNo(car);
    $("[data-car-name]").textContent = car.name;
    $("[data-car-crumb]").textContent = "Бокс " + boxNo(car);
    $("[data-car-meta]").innerHTML = "<span>Бокс " + boxNo(car) + "</span><span>" + K.classes[car.cls] + "</span><span>" + car.year + "</span><span>" + car.color + "</span>";
    $("[data-car-summary]").textContent = car.summary;
    $("#car-specs").innerHTML =
      "<div><dt>Мощность</dt><dd>" + car.power + " л.с.<small>" + car.engine + "</small></dd></div>" +
      "<div><dt>До 100 км/ч</dt><dd>" + car.accel + "</dd></div>" +
      "<div><dt>Пассажиров</dt><dd>" + car.seats + "<small>" + plural(car.seats, "место", "места", "мест") + " в салоне</small></dd></div>" +
      "<div><dt>Багажник</dt><dd>" + car.luggage + "</dd></div>" +
      "<div><dt>С водителем</dt><dd>" + (car.selfDriveOnly ? "не подаём" : rub(car.perHour) + "<small>в час, от " + hoursWord(car.minHours) + "</small>") + "</dd></div>" +
      "<div><dt>Без водителя</dt><dd>" + rub(car.perDay) + "<small>в сутки, депозит " + rub(car.deposit) + "</small></dd></div>";
    $("#car-features").innerHTML = car.features.concat(["Вода, зарядки и плед в салоне", "Подача и возврат по Москве"]).map(function (f) { return "<li>" + f + "</li>"; }).join("");
    var i = K.fleet.indexOf(car);
    var prev = K.fleet[(i - 1 + K.fleet.length) % K.fleet.length], next = K.fleet[(i + 1) % K.fleet.length];
    $("#neighbours").innerHTML =
      '<a class="neighbour" href="car.html?id=' + prev.id + '"><span class="neighbour__dir">' + icon("arrow-left") + " Бокс " + boxNo(prev) + '</span><span class="neighbour__name">' + prev.name + "</span></a>" +
      '<a class="neighbour" href="car.html?id=' + next.id + '"><span class="neighbour__dir">Бокс ' + boxNo(next) + " " + icon("arrow-right") + '</span><span class="neighbour__name">' + next.name + "</span></a>";
    dock = initDock(car);
    // The door rolls up once the photo is ready
    function open() { requestAnimationFrame(function () { box.classList.add("is-open"); }); }
    if (reduceMotion) box.classList.add("is-open");
    else if (img.complete) setTimeout(open, 250); else { img.addEventListener("load", function () { setTimeout(open, 150); }, { once: true }); setTimeout(open, 1500); }
  }

  /* ---------- Booking ---------- */
  function initBooking() {
    var form = $("#booking-form");
    if (!form) return;
    var params = new URLSearchParams(location.search);
    var saved = loadSel();
    var draft = store("get", "karetny-draft") || {};
    var summary = $("#summary");

    var carSel = $("#b-car");
    carSel.innerHTML = K.fleet.map(function (c) { return '<option value="' + c.id + '">Бокс ' + boxNo(c) + ": " + c.name + "</option>"; }).join("");
    var date = $("#b-date"), time = $("#b-time"), amount = $("#b-amount");
    date.min = earliest().date;

    carSel.value = carById(params.get("car")) ? params.get("car") : saved.car;
    var mode = params.get("mode") || saved.mode;
    $('input[name="mode"][value="' + (mode === "self" ? "self" : "driver") + '"]', form).checked = true;
    date.value = params.get("date") || saved.date;
    time.value = params.get("time") || saved.time;
    var initialAmount = params.get("amount") || saved.amount;
    ["address", "name", "phone", "pname", "pphone", "comment"].forEach(function (k) { if (draft[k]) $("#b-" + k).value = draft[k]; });
    if (draft.who === "other") $('input[name="who"][value="other"]', form).checked = true;
    if (draft.contact && $('input[name="contact"][value="' + draft.contact + '"]', form)) $('input[name="contact"][value="' + draft.contact + '"]', form).checked = true;

    var lastKey = null;
    function car() { return carById(carSel.value); }
    function currentMode() { return $('input[name="mode"]:checked', form).value; }
    function other() { return $('input[name="who"]:checked', form).value === "other"; }

    function fillAmount(c, m) {
      var key = c.id + m;
      if (key === lastKey) return;
      var prev = +amount.value || +initialAmount || 0;
      var opts = [];
      if (m === "self") for (var d = 1; d <= 14; d++) opts.push([d, daysWord(d)]);
      else for (var h = c.minHours; h <= 12; h++) opts.push([h, hoursWord(h)]);
      amount.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("");
      if (prev && $('option[value="' + prev + '"]', amount)) amount.value = String(prev);
      $("[data-amount-label]", form).textContent = m === "self" ? "Срок аренды" : "Продолжительность";
      lastKey = key;
      initialAmount = null;
    }

    function update() {
      var c = car();
      $('input[name="mode"][value="driver"]', form).disabled = !!c.selfDriveOnly;
      if (c.selfDriveOnly) $('input[name="mode"][value="self"]', form).checked = true;
      var m = currentMode();
      $("[data-driver-note]").hidden = !c.selfDriveOnly;
      $("[data-self-block]").hidden = m !== "self";
      $("[data-other-block]").hidden = !other();
      fillAmount(c, m);
      var bbox = $("#booking-box"), bimg = $("#booking-img");
      if (bbox.getAttribute("data-car") !== c.id) {
        bbox.setAttribute("data-car", c.id);
        bbox.style.setProperty("--tint", c.tint);
        bbox.classList.remove("is-open");
        bimg.src = "assets/cars/" + c.photo; bimg.alt = c.name; bimg.style.objectPosition = c.pos;
        $("#booking-no").textContent = "Бокс " + boxNo(c);
        $("#booking-name").textContent = c.name;
        $("#booking-door-no").textContent = boxNo(c);
        if (reduceMotion) bbox.classList.add("is-open");
        else setTimeout(function () { bbox.classList.add("is-open"); }, 120);
      }
      setTint(c.tint);
      var q = quote(c, m, +amount.value, time.value);
      setText($("[data-line=car]", summary), c.name);
      setText($("[data-line=mode]", summary), m === "self" ? "без водителя" : "с водителем");
      setText($("[data-line=when]", summary), date.value ? humanDate(date.value) + (time.value ? ", " + time.value : "") : "-");
      setText($("[data-line=amount]", summary), q.unit);
      setText($("[data-line=address]", summary), $("#b-address").value.trim() || "укажите в форме");
      setText($("[data-line=deposit]", summary), m === "self" ? rub(c.deposit) : "не нужен");
      setText($("[data-total]", summary), rub(q.total));
      $("[data-night]", summary).hidden = !q.night;
      setText($("#dock-name"), c.short);
      $("#dock-label").textContent = "Бокс " + boxNo(c) + ", ваша подача";
      $("#dock-when").textContent = date.value && time.value ? cap(humanDate(date.value)) + " в " + time.value : "";
      setText($("#dock-total"), rub(q.total));
      $("#dock-unit").textContent = q.unit;

      saveSel({ car: c.id, mode: m, date: date.value, time: time.value, amount: +amount.value });
      store("set", "karetny-draft", {
        address: $("#b-address").value, name: $("#b-name").value, phone: $("#b-phone").value,
        pname: $("#b-pname").value, pphone: $("#b-pphone").value, comment: $("#b-comment").value,
        who: other() ? "other" : "self", contact: $('input[name="contact"]:checked', form).value
      });
    }

    function maskPhone(input) {
      input.addEventListener("input", function () {
        var digits = input.value.replace(/\D/g, "");
        if (digits.charAt(0) === "8") digits = "7" + digits.slice(1);
        if (digits && digits.charAt(0) !== "7") digits = "7" + digits;
        digits = digits.slice(0, 11);
        var out = "";
        if (digits.length > 0) out = "+7";
        if (digits.length > 1) out += " (" + digits.slice(1, 4);
        if (digits.length >= 4) out += ")";
        if (digits.length > 4) out += " " + digits.slice(4, 7);
        if (digits.length > 7) out += "-" + digits.slice(7, 9);
        if (digits.length > 9) out += "-" + digits.slice(9, 11);
        input.value = out;
      });
    }
    maskPhone($("#b-phone"));
    maskPhone($("#b-pphone"));
    function phoneOk(v) { return v.replace(/\D/g, "").length === 11; }

    var rules = {
      date: function () { return date.value && date.value >= earliest().date ? "" : "Выберите дату не раньше, чем " + humanDate(earliest().date) + "."; },
      time: function () {
        if (!time.value) return "Укажите время подачи.";
        return isTooEarly(date.value, time.value) ? "Нужно минимум 90 минут на подготовку. Ближайшая подача " + humanDate(earliest().date) + " в " + earliest().time + "." : "";
      },
      address: function () { return $("#b-address").value.trim().length >= 5 ? "" : "Напишите адрес подачи: улица и дом, аэропорт или вокзал."; },
      license: function () { return currentMode() !== "self" || $("#b-license").checked ? "" : "Подтвердите возраст и стаж для аренды без водителя."; },
      pname: function () { return !other() || $("#b-pname").value.trim().length >= 2 ? "" : "Как зовут пассажира?"; },
      pphone: function () { return !other() || phoneOk($("#b-pphone").value) ? "" : "Телефон пассажира: 11 цифр, например +7 (916) 204-55-18."; },
      name: function () { return $("#b-name").value.trim().length >= 2 ? "" : "Как к вам обращаться?"; },
      phone: function () { return phoneOk($("#b-phone").value) ? "" : "Нужен номер из 11 цифр, например +7 (916) 204-55-18."; },
      consent: function () { return $("#b-consent").checked ? "" : "Без согласия мы не сможем перезвонить."; }
    };

    function check(name, show) {
      var msg = rules[name]();
      var field = $('[data-field="' + name + '"]');
      if (field && show) {
        field.classList.toggle("is-invalid", !!msg);
        var errEl = $(".field__error", field);
        if (errEl) { errEl.textContent = msg; errEl.id = "err-" + name; }
        $$("input, select, textarea", field).forEach(function (el) {
          if (el.type === "radio") return;
          el.setAttribute("aria-invalid", msg ? "true" : "false");
          if (msg) el.setAttribute("aria-describedby", "err-" + name); else el.removeAttribute("aria-describedby");
        });
      }
      return msg;
    }

    form.addEventListener("input", update);
    $("#b-consent").addEventListener("change", function () { if ($('[data-field="consent"]').classList.contains("is-invalid")) check("consent", true); });
    form.addEventListener("change", function (ev) {
      update();
      var f = ev.target.closest("[data-field]");
      if (f && f.classList.contains("is-invalid")) check(f.dataset.field, true);
    });
    $$("[data-field]").forEach(function (f) {
      f.addEventListener("focusout", function () { if (f.dataset.touched || f.classList.contains("is-invalid")) check(f.dataset.field, true); });
      f.addEventListener("input", function () { f.dataset.touched = "1"; });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var errors = Object.keys(rules).map(function (k) { return [k, check(k, true)]; }).filter(function (x) { return x[1]; });
      var box = $(".form-error-summary", form);
      if (errors.length) {
        box.textContent = "Проверьте " + errors.length + " " + plural(errors.length, "поле", "поля", "полей") + ". " + errors.map(function (x) { return x[1]; }).join(" ");
        box.classList.add("is-visible");
        var f = $('[data-field="' + errors[0][0] + '"]');
        var first = f && $("input:not([type=radio]), select, textarea", f);
        if (first) first.focus();
        return;
      }
      box.classList.remove("is-visible");
      $$('button[type="submit"]').forEach(function (b) { b.disabled = true; b.textContent = "Отправляем"; });
      setTimeout(done, reduceMotion ? 0 : 700);
    });

    function done() {
      var c = car();
      var m = currentMode();
      var q = quote(c, m, +amount.value, time.value);
      var d = parseIso(date.value);
      var no = "К-" + pad(d.getDate()) + pad(d.getMonth() + 1) + "-" + time.value.replace(":", "") + "-" + String(Math.floor(100 + Math.random() * 900));
      var rows = [
        ["Автомобиль", c.name + (m === "self" ? ", без водителя" : ", с водителем")],
        ["Подача", humanDate(date.value) + " в " + time.value + ", " + $("#b-address").value.trim()],
        ["Срок", q.unit],
        ["Пассажир", other() ? $("#b-pname").value.trim() + ", " + $("#b-pphone").value : $("#b-name").value.trim()],
        ["Итого", rub(q.total) + (q.night ? " (ночной тариф)" : "")]
      ];
      var text = "Заявка " + no + " в «Каретный»\n" + rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n") + "\nТелефон гаража: " + K.phone;
      var ok = $("#done");
      flap($("[data-done-no]", ok), no);
      $("[data-done-rows]", ok).innerHTML = rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1].replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</dd>"; }).join("");
      $("[data-done-phone]", ok).textContent = $("#b-phone").value;
      $("#share-tg").href = "https://t.me/share/url?url=" + encodeURIComponent("https://karetny.ru") + "&text=" + encodeURIComponent(text);
      $("#copy-summary").onclick = function () {
        function fallback() {
          var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); toast("Заявка скопирована"); } catch (e2) { toast("Не удалось скопировать, выделите текст вручную"); }
          ta.remove();
        }
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast("Заявка скопирована"); }, fallback);
        else fallback();
      };
      form.hidden = true;
      var dk = $("#dock"); if (dk) dk.hidden = true;
      document.body.classList.remove("has-dock");
      $$("[data-before-submit]").forEach(function (x) { x.hidden = true; });
      ok.hidden = false;
      ok.focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      store("remove", "karetny-draft");
      store("set", "karetny-last", { no: no, text: text });
    }

    update();
  }

  /* Split-flap reveal for the request number */
  function flap(el, text) {
    if (reduceMotion) { el.textContent = text; return; }
    var pool = "0123456789КАРЕТНЫЙ";
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split("").map(function (ch) { return '<span aria-hidden="true">' + ch + "</span>"; }).join("");
    $$("span", el).forEach(function (s, i) {
      var target = s.textContent;
      if (target === "-") return;
      var n = 0, stop = 6 + i * 2;
      s.classList.add("is-flipping");
      var t = setInterval(function () {
        n++;
        if (n >= stop) { s.textContent = target; s.classList.remove("is-flipping"); clearInterval(t); return; }
        s.textContent = pool.charAt(Math.floor(Math.random() * pool.length));
      }, 45);
    });
  }

  /* ---------- Terms: active section ---------- */
  function initTerms() {
    var nav = $(".terms-nav");
    if (!nav || !("IntersectionObserver" in window)) return;
    var links = $$("a", nav);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    links.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) io.observe(s); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillContacts();
    initHeader();
    initStreet();
    initFloor();
    initCar();
    initBooking();
    initTerms();
    initDockTuck();
  });
})();
