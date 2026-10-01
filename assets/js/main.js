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

  /* ---------- Mobile bar ---------- */
  /* Tuck the bar away while the page's own primary action is on screen: one primary CTA per viewport. */
  function initBarTuck() {
    var bar = $(".bar");
    var primaries = $$("[data-primary]");
    if (!bar || !primaries.length || !("IntersectionObserver" in window)) return;
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      bar.classList.toggle("is-tucked", visible.size > 0);
    });
    primaries.forEach(function (p) { io.observe(p); });
  }

  function setBar(what, total, href) {
    var bar = $(".bar");
    if (!bar) return;
    setText($(".bar__what", bar), what);
    setText($(".bar__total", bar), total);
    var go = $("[data-bar-go]", bar);
    if (go && href) go.href = href;
  }

  /* ---------- Garage row (horizontal boxes) ---------- */
  function renderRow(row, cars) {
    row.innerHTML = cars.map(function (c) {
      return '<a class="box" href="car.html?id=' + c.id + '">' +
        '<img src="assets/cars/' + c.photo + '" alt="" loading="lazy" decoding="async" width="1920" height="1200" style="object-position:' + c.pos + '">' +
        '<span class="box__body"><span class="box__name">' + c.name + '</span>' +
        '<span class="box__price">' + fromPrice(c) + "</span>" +
        (c.selfDriveOnly ? '<span class="box__flag">только без водителя</span>' : "") +
        "</span></a>";
    }).join("");
  }
  function initRowArrows() {
    $$("[data-row-prev], [data-row-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        var row = document.getElementById(b.getAttribute("aria-controls"));
        var box = $(".box", row);
        var dx = box ? box.getBoundingClientRect().width + 2 : 320;
        row.scrollBy({ left: b.hasAttribute("data-row-prev") ? -dx : dx, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- Home: the scene ---------- */
  function initScene() {
    var scene = $("#scene");
    if (!scene) return;
    var sel = loadSel();
    var media = $(".scene__media", scene);
    var dial = $("#timedial");
    var digits = $$(".timedial__digit", dial);
    var note = $("#pickup-note");
    var dateInput = $("#pickup-date");
    var nameEl = $("#carpick-name");
    var priceEl = $("#carpick-price");
    var cta = $("#scene-cta");
    var modeDriver = $('input[name="scene-mode"][value="driver"]');
    var modeSelf = $('input[name="scene-mode"][value="self"]');

    // Image stack: one img per car, created on demand
    var imgs = {};
    function showCar(car, first) {
      if (!imgs[car.id]) {
        var img = document.createElement("img");
        img.src = "assets/cars/" + car.photo;
        img.alt = car.name + " ночью у подъезда";
        img.width = 1920; img.height = 1200;
        img.decoding = "async";
        if (first) img.setAttribute("fetchpriority", "high");
        img.style.objectPosition = car.pos;
        media.appendChild(img);
        imgs[car.id] = img;
      }
      Object.keys(imgs).forEach(function (id) {
        imgs[id].classList.toggle("is-current", id === car.id);
        if (id === car.id) imgs[id].removeAttribute("aria-hidden"); else imgs[id].setAttribute("aria-hidden", "true");
      });
      var i = K.fleet.indexOf(car);
      [K.fleet[(i + 1) % K.fleet.length], K.fleet[(i - 1 + K.fleet.length) % K.fleet.length]].forEach(function (n) {
        var pre = new Image(); pre.src = "assets/cars/" + n.photo;
      });
    }

    var lastTime = null;
    function renderTime(time) {
      var chars = time.replace(":", "").split("");
      var dir = lastTime && toMin(time) < toMin(lastTime) ? "digit-down" : "digit-up";
      digits.forEach(function (d, i) {
        var span = d.firstElementChild;
        if (span.textContent !== chars[i]) {
          span.textContent = chars[i];
          if (lastTime && !reduceMotion) { span.classList.remove("digit-up", "digit-down"); void span.offsetWidth; span.classList.add(dir); }
        }
      });
      dial.setAttribute("aria-valuenow", String(toMin(time)));
      dial.setAttribute("aria-valuetext", time + ", " + humanDate(sel.date));
      lastTime = time;
    }

    function renderDays() {
      var e = earliest();
      var today = isoDate(new Date());
      var tomorrow = addDays(today, 1);
      var rToday = $('input[name="scene-day"][value="today"]');
      var rTomorrow = $('input[name="scene-day"][value="tomorrow"]');
      rToday.disabled = e.date !== today;
      rToday.closest(".day").hidden = e.date !== today;
      rToday.checked = sel.date === today;
      rTomorrow.checked = sel.date === tomorrow;
      dateInput.min = e.date;
      dateInput.value = sel.date;
      dateInput.classList.toggle("is-active", sel.date !== today && sel.date !== tomorrow);
    }

    function timeline() {
      var t = toMin(sel.time);
      $$("[data-t]").forEach(function (el) { el.textContent = fromMin(t + +el.getAttribute("data-t")); });
    }

    function update(first) {
      var car = carById(sel.car);
      if (car.selfDriveOnly) sel.mode = "self";
      modeDriver.disabled = !!car.selfDriveOnly;
      modeDriver.checked = sel.mode === "driver";
      modeSelf.checked = sel.mode === "self";
      var e = earliest();
      var msg = "";
      if (isTooEarly(sel.date, sel.time)) { sel.time = e.time; sel.date = e.date; msg = "Ближайшая подача " + humanDate(e.date) + " в " + e.time + "."; }
      var q = quote(car, sel.mode, null, sel.time);
      if (!msg && q.night) msg = "Ночной тариф с 00:00 до 06:00: +20% к часу.";
      if (!msg && car.selfDriveOnly) msg = "Эта машина выдаётся только без водителя.";
      note.textContent = msg;

      renderTime(sel.time);
      renderDays();
      showCar(car, first);
      nameEl.innerHTML = '<a href="car.html?id=' + car.id + '">' + car.name + "</a>";
      priceEl.innerHTML = rub(q.total) + " <small>" + (sel.mode === "self" ? "за сутки" : "за " + q.unit) + "</small>";
      if (!first) flash(priceEl);
      cta.href = bookingHref(sel);
      timeline();
      setBar(car.name + ", " + humanDate(sel.date) + " в " + sel.time, rub(q.total), bookingHref(sel));
      saveSel(sel);
    }

    function shiftTime(delta) {
      var m = toMin(sel.time) + delta;
      if (m >= 1440) { m -= 1440; sel.date = addDays(sel.date, 1); }
      if (m < 0) {
        var prev = addDays(sel.date, -1);
        if (prev >= earliest().date) { m += 1440; sel.date = prev; } else { m = toMin(earliest().time); }
      }
      sel.time = fromMin(m);
      if (isTooEarly(sel.date, sel.time)) sel.time = earliest().time;
      update();
    }

    $("#time-minus").addEventListener("click", function () { shiftTime(-STEP); });
    $("#time-plus").addEventListener("click", function () { shiftTime(STEP); });
    dial.addEventListener("keydown", function (e) {
      var map = { ArrowUp: STEP, ArrowRight: STEP, ArrowDown: -STEP, ArrowLeft: -STEP, PageUp: 60, PageDown: -60 };
      if (map[e.key]) { e.preventDefault(); shiftTime(map[e.key]); }
    });

    // Vertical drag on the numerals (mouse and pen; touch keeps page scroll and uses the buttons)
    var dragY = null, acc = 0;
    dial.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      dragY = e.clientY; acc = 0;
      dial.setPointerCapture(e.pointerId);
    });
    dial.addEventListener("pointermove", function (e) {
      if (dragY === null) return;
      acc += dragY - e.clientY; dragY = e.clientY;
      while (Math.abs(acc) >= 22) { shiftTime(acc > 0 ? STEP : -STEP); acc += acc > 0 ? -22 : 22; }
    });
    function endDrag() { dragY = null; }
    dial.addEventListener("pointerup", endDrag);
    dial.addEventListener("pointercancel", endDrag);
    dial.addEventListener("lostpointercapture", endDrag);

    $$('input[name="scene-day"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var today = isoDate(new Date());
        sel.date = r.value === "today" ? today : addDays(today, 1);
        update();
      });
    });
    dateInput.addEventListener("change", function () {
      if (dateInput.value) { sel.date = dateInput.value < dateInput.min ? dateInput.min : dateInput.value; update(); }
    });

    function stepCar(d) {
      var prevCar = carById(sel.car);
      var i = K.fleet.indexOf(prevCar);
      var next = K.fleet[(i + d + K.fleet.length) % K.fleet.length];
      sel.car = next.id;
      if (!next.selfDriveOnly && prevCar.selfDriveOnly) sel.mode = "driver";
      update();
    }
    $("#car-prev").addEventListener("click", function () { stepCar(-1); });
    $("#car-next").addEventListener("click", function () { stepCar(1); });
    [modeDriver, modeSelf].forEach(function (r) {
      r.addEventListener("change", function () { sel.mode = r.value; update(); });
    });

    update(true);

    var row = $("#garage-row");
    if (row) { renderRow(row, K.fleet); initRowArrows(); }
  }

  /* ---------- Fleet page ---------- */
  function initFleet() {
    var lots = $("#lots");
    if (!lots) return;
    var form = $("#filters");
    var count = $("#lots-count");
    var preset = new URLSearchParams(location.search).get("class");
    if (preset && $('input[value="' + preset + '"]', form)) $('input[value="' + preset + '"]', form).checked = true;

    function render() {
      var cls = $('input[name="cls"]:checked', form).value;
      var list = K.fleet.filter(function (c) { return cls === "all" || c.cls === cls; });
      count.textContent = list.length + " " + plural(list.length, "автомобиль", "автомобиля", "автомобилей");
      if (!list.length) {
        lots.innerHTML = '<div class="empty"><p class="h3">В этом разделе сейчас пусто</p><p class="muted">Позвоните, подберём машину через партнёрские гаражи.</p></div>';
        return;
      }
      lots.innerHTML = list.map(function (c) {
        return '<a class="lot" href="car.html?id=' + c.id + '">' +
          '<img src="assets/cars/' + c.photo + '" alt="" loading="lazy" decoding="async" width="1920" height="1200" style="object-position:' + c.pos + '">' +
          '<span class="lot__body"><span><span class="lot__name">' + c.name + '</span><br><span class="lot__class">' + K.classes[c.cls] + ", " + c.seats + " " + plural(c.seats, "место", "места", "мест") + "</span></span>" +
          '<span class="lot__prices">' +
            (c.selfDriveOnly ? "" : "<span><strong>" + rub(c.perHour) + "</strong> / час с водителем</span>") +
            "<span><strong>" + rub(c.perDay) + "</strong> / сутки без водителя</span></span>" +
          (c.selfDriveOnly ? '<span class="box__flag">только без водителя</span>' : "") +
          "</span></a>";
      }).join("");
    }
    form.addEventListener("change", function () {
      render();
      var cls = $('input[name="cls"]:checked', form).value;
      var u = new URL(location.href);
      if (cls === "all") u.searchParams.delete("class"); else u.searchParams.set("class", cls);
      history.replaceState(null, "", u);
    });
    render();
    var sel = loadSel();
    var car = carById(sel.car);
    var q = quote(car, sel.mode, sel.amount, sel.time);
    setBar(car.name + ", " + humanDate(sel.date) + " в " + sel.time, rub(q.total), bookingHref(sel));
  }

  /* ---------- Car page ---------- */
  function initCar() {
    var root = $("#car-page");
    if (!root) return;
    var car = carById(new URLSearchParams(location.search).get("id"));
    if (!car) {
      root.innerHTML = '<div class="container page-head"><h1 class="display">Такой машины нет в гараже</h1><p class="lead">Возможно, ссылка устарела. Весь гараж на одной странице.</p><p><a class="btn" href="fleet.html">Открыть гараж ' + icon("arrow-right") + "</a></p></div>";
      return;
    }
    document.title = car.name + " | Каретный";
    var desc = $('meta[name="description"]');
    if (desc) desc.content = car.name + ": аренда " + (car.selfDriveOnly ? "без водителя" : "с водителем и без") + " в Москве, " + fromPrice(car) + ".";

    var hero = $("#car-hero-img");
    hero.src = "assets/cars/" + car.photo;
    hero.alt = car.name + ", " + car.color;
    hero.style.objectPosition = car.pos;
    $("[data-car-name]").textContent = car.name;
    $("[data-car-crumb]").textContent = car.name;
    $("[data-car-meta]").innerHTML = "<span>" + K.classes[car.cls] + "</span><span>" + car.year + "</span><span>" + car.color + "</span>";
    $("[data-car-summary]").textContent = car.summary;
    $("#car-specs").innerHTML =
      "<div><dt>Мощность</dt><dd>" + car.power + " л.с.<small>" + car.engine + "</small></dd></div>" +
      "<div><dt>До 100 км/ч</dt><dd>" + car.accel + "</dd></div>" +
      "<div><dt>Пассажиров</dt><dd>" + car.seats + "<small>" + plural(car.seats, "место", "места", "мест") + " в салоне</small></dd></div>" +
      "<div><dt>Багажник</dt><dd>" + car.luggage + "</dd></div>" +
      "<div><dt>С водителем</dt><dd>" + (car.selfDriveOnly ? "не подаём" : rub(car.perHour) + "<small>в час, от " + hoursWord(car.minHours) + "</small>") + "</dd></div>" +
      "<div><dt>Без водителя</dt><dd>" + rub(car.perDay) + "<small>в сутки, депозит " + rub(car.deposit) + "</small></dd></div>";
    $("#car-features").innerHTML = car.features.concat(["Вода, зарядки и плед в салоне", "Подача и возврат по Москве"]).map(function (f) { return "<li>" + f + "</li>"; }).join("");

    var sel = loadSel();
    sel.car = car.id;
    if (car.selfDriveOnly) sel.mode = "self";
    var panel = $("#car-panel");
    var driver = $('input[name="cp-mode"][value="driver"]', panel);
    var self = $('input[name="cp-mode"][value="self"]', panel);
    var date = $("#cp-date"), time = $("#cp-time"), amount = $("#cp-amount"), amountLabel = $("[data-amount-label]", panel);
    var err = $("#cp-error");
    driver.disabled = !!car.selfDriveOnly;
    driver.checked = sel.mode === "driver";
    self.checked = sel.mode === "self";
    date.min = earliest().date;
    date.value = sel.date;
    time.value = sel.time;
    var lastMode = null;

    function fillAmount(mode) {
      var opts = [];
      if (mode === "self") for (var d = 1; d <= 14; d++) opts.push([d, daysWord(d)]);
      else for (var h = car.minHours; h <= 12; h++) opts.push([h, hoursWord(h)]);
      var prev = amount.value || sel.amount;
      amount.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("");
      if (prev && $('option[value="' + prev + '"]', amount)) amount.value = String(prev);
      amountLabel.textContent = mode === "self" ? "Срок" : "Продолжительность";
    }
    function update() {
      sel.mode = car.selfDriveOnly || self.checked ? "self" : "driver";
      if (sel.mode !== lastMode) { fillAmount(sel.mode); lastMode = sel.mode; }
      sel.date = date.value || sel.date; sel.time = time.value || sel.time; sel.amount = +amount.value;
      var early = isTooEarly(sel.date, sel.time);
      err.hidden = !early;
      if (early) err.textContent = "Ближайшая подача " + humanDate(earliest().date) + " в " + earliest().time + ".";
      var q = quote(car, sel.mode, sel.amount, sel.time);
      setText($("[data-line=rate]", panel), q.rate + (q.night ? ", ночью +20%" : ""));
      setText($("[data-line=amount]", panel), q.unit);
      setText($("[data-line=deposit]", panel), sel.mode === "self" ? rub(car.deposit) : "не нужен");
      setText($("[data-total]", panel), rub(q.total));
      $("#cp-go").href = bookingHref(sel);
      setBar(car.name + ", " + humanDate(sel.date) + " в " + sel.time, rub(q.total), bookingHref(sel));
      saveSel(sel);
    }
    panel.addEventListener("change", update);
    panel.addEventListener("input", update);
    update();

    var row = $("#garage-row");
    if (row) {
      renderRow(row, K.fleet.filter(function (c) { return c.id !== car.id; }));
      initRowArrows();
    }
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
    carSel.innerHTML = K.fleet.map(function (c) { return '<option value="' + c.id + '">' + c.name + "</option>"; }).join("");
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
      $("#car-preview").innerHTML = '<img src="assets/cars/' + c.photo + '" alt="" style="object-position:' + c.pos + '" width="1920" height="1200">' +
        '<div><p class="h3">' + c.name + '</p><p class="car-preview__price">' + fromPrice(c) + (c.selfDriveOnly ? ", только без водителя" : "") + "</p></div>";
      var q = quote(c, m, +amount.value, time.value);
      setText($("[data-line=car]", summary), c.name);
      setText($("[data-line=mode]", summary), m === "self" ? "без водителя" : "с водителем");
      setText($("[data-line=when]", summary), date.value ? humanDate(date.value) + (time.value ? ", " + time.value : "") : "-");
      setText($("[data-line=amount]", summary), q.unit);
      setText($("[data-line=address]", summary), $("#b-address").value.trim() || "-");
      setText($("[data-line=deposit]", summary), m === "self" ? rub(c.deposit) : "не нужен");
      setText($("[data-total]", summary), rub(q.total));
      $("[data-night]", summary).hidden = !q.night;
      setBar(c.name + (time.value ? ", " + time.value : ""), rub(q.total));

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
      $("[data-done-no]", ok).textContent = no;
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
      var bar = $(".bar"); if (bar) bar.hidden = true;
      $("[data-before-submit]").hidden = true;
      ok.hidden = false;
      ok.focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      store("remove", "karetny-draft");
      store("set", "karetny-last", { no: no, text: text });
    }

    update();
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
    initScene();
    initFleet();
    initCar();
    initBooking();
    initTerms();
    initBarTuck();
  });
})();
