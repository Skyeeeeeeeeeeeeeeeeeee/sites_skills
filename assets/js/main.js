/* «Каретный» - site script. Plain JS, works from file:// without a build step. */
(function () {
  "use strict";

  var K = window.KARETNY;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function rub(n) {
    return n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₽";
  }

  function icon(name, cls) {
    return '<svg class="icon ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function carById(id) {
    for (var i = 0; i < K.fleet.length; i++) if (K.fleet[i].id === id) return K.fleet[i];
    return null;
  }

  function frame(car, idx, opts) {
    opts = opts || {};
    var file = car.photos[idx || 0];
    var alt = opts.alt != null ? opts.alt : car.name + ", " + car.color.toLowerCase();
    return '<div class="frame ' + (opts.cls || "") + '" data-label="' + car.name + '">' +
      '<img src="assets/cars/' + file + '" alt="' + alt + '" width="1600" height="1000"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></div>';
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function storage(action, key, value) {
    try {
      if (action === "get") return JSON.parse(window.localStorage.getItem(key));
      if (action === "set") window.localStorage.setItem(key, JSON.stringify(value));
      if (action === "remove") window.localStorage.removeItem(key);
    } catch (e) { return null; }
    return null;
  }

  function isoDate(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function humanDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
  }

  function tomorrow() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return isoDate(d);
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
    el._t = setTimeout(function () { el.classList.remove("is-visible"); }, 3200);
  }

  /* ---------- Images: graceful fallback when a photo is missing ---------- */
  function watchImages(root) {
    $$(".frame img", root).forEach(function (img) {
      function fail() { img.closest(".frame").classList.add("is-missing"); }
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
      img.addEventListener("error", fail, { once: true });
    });
  }

  /* ---------- Header ---------- */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;";
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-stuck", !entries[0].isIntersecting);
    }).observe(sentinel);

    var toggle = $(".menu-toggle");
    var menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = icon(open ? "x" : "list", "icon--lg") + '<span class="visually-hidden">' + (open ? "Закрыть меню" : "Открыть меню") + "</span>";
      menu.classList.toggle("is-open", open);
      menu.toggleAttribute("inert", !open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    setOpen(false);
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) { if (e.matches) setOpen(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal(root) {
    var items = $$(".reveal:not(.is-in)", root);
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Footer contacts ---------- */
  function fillContacts() {
    $$("[data-phone]").forEach(function (a) { a.href = K.phoneHref; if (!a.children.length) a.textContent = K.phone; });
    $$("[data-telegram]").forEach(function (a) { a.href = K.telegram; });
    $$("[data-whatsapp]").forEach(function (a) { a.href = K.whatsapp; });
    $$("[data-email]").forEach(function (a) { a.href = "mailto:" + K.email; a.textContent = K.email; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Price model ---------- */
  function quote(car, mode, amount) {
    if (!car) return null;
    if (mode === "self") {
      var days = Math.max(1, amount || 1);
      return { total: car.perDay * days, unit: days + " " + plural(days, "сутки", "суток", "суток"), rate: rub(car.perDay) + " / сутки" };
    }
    var hours = Math.max(car.minHours, amount || car.minHours);
    return { total: car.perHour * hours, unit: hours + " " + plural(hours, "час", "часа", "часов"), rate: rub(car.perHour) + " / час" };
  }

  function slipNumber() {
    var n = storage("get", "karetny-slip-no");
    if (!n) { n = 400 + Math.floor(Math.random() * 500); storage("set", "karetny-slip-no", n); }
    return "№ " + String(n).padStart(4, "0");
  }

  function setLine(el, value) {
    if (!el) return;
    var out = el.querySelector("span:last-child");
    if (out.textContent === value) return;
    out.textContent = value;
    el.classList.toggle("is-filled", value !== "не выбрано" && value !== "-");
    if (!reduceMotion) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
  }

  /* ---------- Hero slip (home) ---------- */
  function initHeroSlip() {
    var slip = $("#hero-slip");
    if (!slip) return;
    var carSel = $("#hs-car", slip);
    var date = $("#hs-date", slip);
    var time = $("#hs-time", slip);
    var total = $("[data-total]", slip);
    var note = $("[data-note]", slip);
    var go = $("[data-go]", slip);
    $("[data-slip-no]", slip).textContent = slipNumber();

    K.fleet.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.id; o.textContent = c.name;
      carSel.appendChild(o);
    });
    carSel.value = "dawn"; // matches the hero photograph
    date.min = isoDate(new Date());
    date.value = tomorrow();

    function update() {
      var car = carById(carSel.value);
      var modeInput = $('input[name="hs-mode"]:checked', slip);
      var selfOnly = car && car.selfDriveOnly;
      var driverRadio = $('input[name="hs-mode"][value="driver"]', slip);
      driverRadio.disabled = !!selfOnly;
      if (selfOnly && modeInput.value === "driver") { $('input[name="hs-mode"][value="self"]', slip).checked = true; modeInput = $('input[name="hs-mode"]:checked', slip); }
      var mode = modeInput.value;
      var q = quote(car, mode);
      setLine($("[data-line=car]", slip), car ? car.name : "не выбрано");
      setLine($("[data-line=when]", slip), date.value ? humanDate(date.value) + ", " + (time.value || "-") : "-");
      setLine($("[data-line=mode]", slip), mode === "self" ? "без водителя, " + q.unit : "с водителем, от " + q.unit);
      total.textContent = rub(q.total);
      note.textContent = selfOnly
        ? "Этот автомобиль выдаётся только без водителя."
        : mode === "self"
          ? "Депозит " + rub(car.deposit) + " возвращается в день сдачи."
          : "Минимальный заказ " + car.minHours + " " + plural(car.minHours, "час", "часа", "часов") + ". Подача по Москве включена.";
      var params = new URLSearchParams({ car: car.id, mode: mode, date: date.value, time: time.value });
      go.href = "booking.html?" + params.toString();
    }

    slip.addEventListener("change", update);
    slip.addEventListener("input", update);
    update();
  }

  /* ---------- Home fleet bento ---------- */
  function initHomeFleet() {
    var grid = $("#home-fleet");
    if (!grid) return;
    var picks = ["wraith", "m760li", "g63", "dawn", "huracan"];
    var layout = ["bento__cell--hero", "", "", "bento__cell--wide", "bento__cell--wide"];
    grid.innerHTML = picks.map(function (id, i) {
      var c = carById(id);
      return '<div class="bento__cell ' + layout[i] + ' reveal" style="--i:' + i + '">' + carCard(c, i === 0) + "</div>";
    }).join("");
    watchImages(grid);
    initReveal(grid);
  }

  function carCard(c, hero, mode) {
    var price = mode === "self"
      ? rub(c.perDay) + " <small>/ сутки</small>"
      : c.selfDriveOnly
        ? rub(c.perDay) + " <small>/ сутки</small>"
        : rub(c.perHour) + " <small>/ час</small>";
    return '<a class="car-card ' + (hero ? "car-card--hero" : "") + '" href="car.html?id=' + c.id + '">' +
      frame(c, 0, { alt: "" }) +
      '<div class="car-card__body">' +
        '<div class="car-card__top"><h3 class="car-card__name">' + c.name + "</h3>" +
        '<span class="car-card__go">' + icon("arrow-up-right") + "</span></div>" +
        '<div class="car-card__top"><span class="car-card__meta">' + K.classes[c.cls] + ", " + c.seats + " " + plural(c.seats, "место", "места", "мест") + "</span>" +
        '<span class="car-card__price">от ' + price + "</span></div>" +
      "</div></a>";
  }

  /* ---------- Fleet page ---------- */
  function initFleetPage() {
    var grid = $("#fleet-grid");
    if (!grid) return;
    var form = $("#fleet-filters");
    var count = $("#fleet-count");
    var params = new URLSearchParams(location.search);
    if (params.get("class") && $('input[name="cls"][value="' + params.get("class") + '"]', form)) {
      $('input[name="cls"][value="' + params.get("class") + '"]', form).checked = true;
    }

    function render() {
      var cls = $('input[name="cls"]:checked', form).value;
      var mode = $('input[name="fmode"]:checked', form).value;
      var sort = $("#fleet-sort", form).value;
      var list = K.fleet.filter(function (c) {
        if (cls !== "all" && c.cls !== cls) return false;
        if (mode === "driver" && c.selfDriveOnly) return false;
        return true;
      });
      var key = mode === "self" ? "perDay" : "perHour";
      if (sort === "asc") list.sort(function (a, b) { return a[key] - b[key]; });
      if (sort === "desc") list.sort(function (a, b) { return b[key] - a[key]; });
      count.textContent = list.length + " " + plural(list.length, "автомобиль", "автомобиля", "автомобилей");
      if (!list.length) {
        grid.innerHTML = '<div class="empty"><h2>В этом сочетании машин нет</h2>' +
          "<p>Сбросьте фильтр или позвоните, подберём замену.</p>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-reset>Показать весь автопарк</button></div>';
        return;
      }
      grid.innerHTML = list.map(function (c, i) {
        return carCard(c, false, mode).replace('class="car-card ', 'style="--i:' + (i % 3) + '" class="reveal car-card ');
      }).join("");
      watchImages(grid);
      initReveal(grid);
    }

    form.addEventListener("change", function () {
      render();
      var cls = $('input[name="cls"]:checked', form).value;
      var u = new URL(location.href);
      if (cls === "all") u.searchParams.delete("class"); else u.searchParams.set("class", cls);
      history.replaceState(null, "", u);
    });
    grid.addEventListener("click", function (e) {
      if (e.target.closest("[data-reset]")) {
        form.reset();
        render();
      }
    });
    render();
  }

  /* ---------- Car page ---------- */
  function initCarPage() {
    var root = $("#car-page");
    if (!root) return;
    var id = new URLSearchParams(location.search).get("id");
    var car = carById(id);
    if (!car) {
      root.innerHTML = '<div class="container"><div class="empty" style="margin-top:64px"><h2>Такой машины нет в гараже</h2>' +
        "<p>Возможно, ссылка устарела. Весь автопарк на одной странице.</p>" +
        '<a class="btn btn--ghost btn--sm" href="fleet.html">Автопарк</a></div></div>';
      return;
    }
    document.title = car.name + " в аренду | Каретный";
    var desc = $('meta[name="description"]');
    if (desc) desc.content = car.name + ": аренда " + (car.selfDriveOnly ? "без водителя" : "с водителем и без") + " в Москве, от " + rub(car.selfDriveOnly ? car.perDay : car.perHour) + ".";

    $("[data-car-crumb]").textContent = car.name;
    $("[data-car-name]").textContent = car.name;
    $("[data-car-summary]").textContent = car.summary;
    $("[data-car-tags]").innerHTML = '<span class="tag">' + K.classes[car.cls] + '</span><span class="tag">' + car.year + '</span><span class="tag">' + car.color + "</span>" +
      (car.selfDriveOnly ? '<span class="tag tag--accent">Только без водителя</span>' : "");

    var main = $("#car-main");
    main.innerHTML = frame(car, 0, { eager: true, cls: "car-gallery__main" });
    var thumbs = $("#car-thumbs");
    thumbs.hidden = car.photos.length < 2;
    thumbs.innerHTML = car.photos.map(function (p, i) {
      return '<button type="button" aria-pressed="' + (i === 0) + '" aria-label="Фото ' + (i + 1) + ' из ' + car.photos.length + '" data-idx="' + i + '">' + frame(car, i, { alt: "" }) + "</button>";
    }).join("");
    thumbs.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      $$("button", thumbs).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      main.innerHTML = frame(car, +b.dataset.idx, { cls: "car-gallery__main", eager: true });
      watchImages(main);
    });

    $("#car-specs").innerHTML =
      '<div class="spec-group"><h3>' + icon("engine") + "Двигатель</h3>" +
        '<div class="spec"><span class="spec__value">' + car.power + ' л.с.</span><span class="spec__label">' + car.engine + "</span></div>" +
        '<div class="spec"><span class="spec__value">' + car.accel + '</span><span class="spec__label">до 100 км/ч</span></div></div>' +
      '<div class="spec-group"><h3>' + icon("seat") + "Салон</h3>" +
        '<div class="spec"><span class="spec__value">' + car.seats + " " + plural(car.seats, "место", "места", "мест") + '</span><span class="spec__label">для пассажиров</span></div>' +
        '<div class="spec"><span class="spec__value">' + car.luggage + '</span><span class="spec__label">багажник</span></div></div>' +
      '<div class="spec-group"><h3>' + icon("shield-check") + "Условия</h3>" +
        '<div class="spec"><span class="spec__value">' + (car.selfDriveOnly ? "-" : "от " + car.minHours + " ч") + '</span><span class="spec__label">заказ с водителем</span></div>' +
        '<div class="spec"><span class="spec__value">' + rub(car.deposit) + '</span><span class="spec__label">депозит без водителя</span></div></div>';

    $("#car-features").innerHTML = car.features.concat(["Вода, зарядки для телефонов, плед", "Подача и возврат по Москве"]).map(function (f) { return "<li>" + icon("check") + "<span>" + f + "</span></li>"; }).join("");

    // Aside slip
    var slip = $("#car-slip");
    $("[data-slip-no]", slip).textContent = slipNumber();
    var driver = $('input[name="cs-mode"][value="driver"]', slip);
    if (car.selfDriveOnly) { driver.disabled = true; $('input[name="cs-mode"][value="self"]', slip).checked = true; }
    var amount = $("#cs-amount", slip);
    var amountLabel = $("[data-amount-label]", slip);
    var date = $("#cs-date", slip);
    date.min = isoDate(new Date());
    date.value = tomorrow();

    function fillAmount(mode) {
      var opts = [];
      if (mode === "self") { for (var d = 1; d <= 14; d++) opts.push([d, d + " " + plural(d, "сутки", "суток", "суток")]); }
      else { for (var h = car.minHours; h <= 12; h++) opts.push([h, h + " " + plural(h, "час", "часа", "часов")]); }
      amount.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("");
      amountLabel.textContent = mode === "self" ? "Срок" : "Продолжительность";
    }
    var lastMode = null;
    function update() {
      var mode = $('input[name="cs-mode"]:checked', slip).value;
      if (mode !== lastMode) { fillAmount(mode); lastMode = mode; }
      var q = quote(car, mode, +amount.value);
      setLine($("[data-line=rate]", slip), q.rate);
      setLine($("[data-line=amount]", slip), q.unit);
      setLine($("[data-line=deposit]", slip), mode === "self" ? rub(car.deposit) : "не нужен");
      $("[data-total]", slip).textContent = rub(q.total);
      $("[data-go]", slip).href = "booking.html?" + new URLSearchParams({ car: car.id, mode: mode, amount: amount.value, date: date.value }).toString();
    }
    slip.addEventListener("change", update);
    update();

    // More cars
    var more = K.fleet.filter(function (c) { return c.id !== car.id && c.cls === car.cls; });
    if (more.length < 3) more = more.concat(K.fleet.filter(function (c) { return c.id !== car.id && c.cls !== car.cls; }));
    $("#more-cars").innerHTML = more.slice(0, 3).map(function (c, i) {
      return carCard(c).replace('class="car-card ', 'style="--i:' + i + '" class="reveal car-card ');
    }).join("");

    watchImages(root);
    initReveal(root);
  }

  /* ---------- Booking page ---------- */
  function initBooking() {
    var form = $("#booking-form");
    if (!form) return;
    var slip = $("#booking-slip");
    var picker = $("#car-picker");
    var params = new URLSearchParams(location.search);
    var draft = storage("get", "karetny-draft") || {};
    $("[data-slip-no]", slip).textContent = slipNumber();

    picker.innerHTML = K.fleet.map(function (c) {
      return '<label class="car-option"><input type="radio" name="car" value="' + c.id + '" required>' +
        '<span class="car-option__box">' + frame(c, 0, { alt: "" }) +
        '<span><span class="car-option__name">' + c.name + '</span><br><span class="car-option__price">' +
        (c.selfDriveOnly ? "от " + rub(c.perDay) + " / сутки" : "от " + rub(c.perHour) + " / час") + "</span></span></span></label>";
    }).join("");
    watchImages(picker);

    var date = $("#b-date");
    date.min = isoDate(new Date());

    // Restore: URL params win over a saved draft
    var initial = {
      car: params.get("car") || draft.car,
      mode: params.get("mode") || draft.mode || "driver",
      date: params.get("date") || draft.date || tomorrow(),
      time: params.get("time") || draft.time || "10:00",
      amount: params.get("amount") || draft.amount,
      address: draft.address || "",
      name: draft.name || "",
      phone: draft.phone || "",
      comment: draft.comment || "",
      contact: draft.contact || "phone"
    };
    if (initial.car && $('input[name="car"][value="' + initial.car + '"]', form)) $('input[name="car"][value="' + initial.car + '"]', form).checked = true;
    if ($('input[name="mode"][value="' + initial.mode + '"]', form)) $('input[name="mode"][value="' + initial.mode + '"]', form).checked = true;
    if ($('input[name="contact"][value="' + initial.contact + '"]', form)) $('input[name="contact"][value="' + initial.contact + '"]', form).checked = true;
    date.value = initial.date >= date.min ? initial.date : tomorrow();
    $("#b-time").value = initial.time;
    $("#b-address").value = initial.address;
    $("#b-name").value = initial.name;
    $("#b-phone").value = initial.phone;
    $("#b-comment").value = initial.comment;

    var amount = $("#b-amount");
    var amountLabel = $("[data-amount-label]", form);
    var lastKey = null;

    function current() {
      var carInput = $('input[name="car"]:checked', form);
      return {
        car: carInput ? carById(carInput.value) : null,
        mode: $('input[name="mode"]:checked', form).value
      };
    }

    function fillAmount(car, mode) {
      var key = (car ? car.id : "none") + mode;
      if (key === lastKey) return;
      var prev = +amount.value || +initial.amount || 0;
      var opts = [];
      if (mode === "self") { for (var d = 1; d <= 14; d++) opts.push([d, d + " " + plural(d, "сутки", "суток", "суток")]); }
      else { var min = car ? car.minHours : 3; for (var h = min; h <= 12; h++) opts.push([h, h + " " + plural(h, "час", "часа", "часов")]); }
      amount.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("");
      if (prev && $('option[value="' + prev + '"]', amount)) amount.value = String(prev);
      amountLabel.textContent = mode === "self" ? "Срок аренды" : "Продолжительность";
      lastKey = key;
      initial.amount = null;
    }

    function update() {
      var s = current();
      var driverRadio = $('input[name="mode"][value="driver"]', form);
      driverRadio.disabled = !!(s.car && s.car.selfDriveOnly);
      $("[data-driver-note]").hidden = !(s.car && s.car.selfDriveOnly);
      if (s.car && s.car.selfDriveOnly && s.mode === "driver") { $('input[name="mode"][value="self"]', form).checked = true; s.mode = "self"; }
      $("[data-self-block]").hidden = s.mode !== "self";
      fillAmount(s.car, s.mode);
      var q = s.car ? quote(s.car, s.mode, +amount.value) : null;
      setLine($("[data-line=car]", slip), s.car ? s.car.name : "не выбрано");
      setLine($("[data-line=mode]", slip), s.mode === "self" ? "без водителя" : "с водителем");
      setLine($("[data-line=when]", slip), date.value ? humanDate(date.value) + ", " + ($("#b-time").value || "-") : "-");
      setLine($("[data-line=amount]", slip), q ? q.unit : "-");
      setLine($("[data-line=address]", slip), $("#b-address").value.trim() || "-");
      setLine($("[data-line=deposit]", slip), s.car && s.mode === "self" ? rub(s.car.deposit) : "не нужен");
      $("[data-total]", slip).textContent = q ? rub(q.total) : "-";

      storage("set", "karetny-draft", {
        car: s.car ? s.car.id : null, mode: s.mode, date: date.value, time: $("#b-time").value, amount: amount.value,
        address: $("#b-address").value, name: $("#b-name").value, phone: $("#b-phone").value,
        comment: $("#b-comment").value, contact: $('input[name="contact"]:checked', form).value
      });
    }

    // Phone mask: +7 (XXX) XXX-XX-XX
    var phone = $("#b-phone");
    phone.addEventListener("input", function () {
      var digits = phone.value.replace(/\D/g, "");
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
      phone.value = out;
    });

    var rules = {
      car: function () { return $('input[name="car"]:checked', form) ? "" : "Выберите автомобиль."; },
      date: function () { return date.value && date.value >= date.min ? "" : "Укажите дату не раньше сегодняшней."; },
      time: function () { return $("#b-time").value ? "" : "Укажите время подачи."; },
      address: function () { return $("#b-address").value.trim().length >= 5 ? "" : "Напишите адрес подачи: улица и дом."; },
      name: function () { return $("#b-name").value.trim().length >= 2 ? "" : "Как к вам обращаться?"; },
      phone: function () { return $("#b-phone").value.replace(/\D/g, "").length === 11 ? "" : "Нужен номер из 11 цифр, например +7 (916) 204-55-18."; },
      license: function () {
        if (current().mode !== "self") return "";
        return $("#b-license").checked ? "" : "Подтвердите стаж и возраст для аренды без водителя.";
      },
      consent: function () { return $("#b-consent").checked ? "" : "Без согласия мы не сможем перезвонить."; }
    };

    function check(name, show) {
      var msg = rules[name]();
      var field = $('[data-field="' + name + '"]', form);
      if (field && show) {
        field.classList.toggle("is-invalid", !!msg);
        var err = $(".field__error", field);
        if (err) { err.textContent = msg; err.id = "err-" + name; }
        $$("input, select, textarea", field).forEach(function (el) {
          if (el.type === "radio") return;
          el.setAttribute("aria-invalid", msg ? "true" : "false");
          if (msg) el.setAttribute("aria-describedby", "err-" + name); else el.removeAttribute("aria-describedby");
        });
      }
      return msg;
    }

    form.addEventListener("input", update);
    form.addEventListener("change", function (e) {
      update();
      var f = e.target.closest("[data-field]");
      if (f && f.classList.contains("is-invalid")) check(f.dataset.field, true);
    });
    $$("[data-field]", form).forEach(function (f) {
      f.addEventListener("focusout", function () {
        if (f.dataset.touched || f.classList.contains("is-invalid")) check(f.dataset.field, true);
      });
      f.addEventListener("input", function () { f.dataset.touched = "1"; });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = Object.keys(rules).map(function (k) { return [k, check(k, true)]; }).filter(function (x) { return x[1]; });
      var summary = $(".form-error-summary", form);
      if (errors.length) {
        summary.textContent = "Проверьте " + errors.length + " " + plural(errors.length, "поле", "поля", "полей") + ": " + errors.map(function (x) { return x[1]; }).join(" ");
        summary.classList.add("is-visible");
        var first = $('[data-field="' + errors[0][0] + '"] input, [data-field="' + errors[0][0] + '"] select, [data-field="' + errors[0][0] + '"] textarea', form);
        if (first) first.focus({ preventScroll: false });
        return;
      }
      summary.classList.remove("is-visible");
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.innerHTML = "Отправляем заявку";
      // No backend in this build: simulate the request round-trip.
      setTimeout(function () {
        slip.classList.add("is-stamped");
        form.hidden = true;
        var ok = $("#booking-success");
        var s = current();
        $("[data-success-car]", ok).textContent = s.car.name;
        $("[data-success-when]", ok).textContent = humanDate(date.value) + ", " + $("#b-time").value;
        $("[data-success-phone]", ok).textContent = $("#b-phone").value;
        ok.classList.add("is-visible");
        ok.setAttribute("tabindex", "-1");
        ok.focus();
        storage("remove", "karetny-draft");
        storage("remove", "karetny-slip-no");
      }, reduceMotion ? 0 : 900);
    });

    update();
  }

  /* ---------- Terms page: active section in side nav ---------- */
  function initTermsNav() {
    var nav = $(".terms-nav");
    if (!nav || !("IntersectionObserver" in window)) return;
    var links = $$("a", nav);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach(function (a) {
      var s = $(a.getAttribute("href"));
      if (s) io.observe(s);
    });
  }

  /* ---------- Reviews ---------- */
  function initReviews() {
    var box = $("#reviews");
    if (!box) return;
    box.innerHTML = K.reviews.map(function (r, i) {
      return '<figure class="review reveal" style="--i:' + i + '"><blockquote class="review__text">«' + r.text + "»</blockquote>" +
        '<figcaption class="review__meta"><strong>' + r.name + "</strong>" + r.role + "</figcaption></figure>";
    }).join("");
    initReveal(box);
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    fillContacts();
    initHeader();
    initHeroSlip();
    initHomeFleet();
    initFleetPage();
    initCarPage();
    initBooking();
    initTermsNav();
    initReviews();
    watchImages(document);
    initReveal(document);
  });
})();
