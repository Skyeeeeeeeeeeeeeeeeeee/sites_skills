/* «Каретный» fleet data.
   Demo content: models, prices and terms are illustrative. Photos are Unsplash stock of the same models
   (see assets/cars/SOURCES.md); replace with the real fleet before launch. */
window.KARETNY = {
  phone: "+7 (495) 182-47-19",
  phoneHref: "tel:+74951824719",
  telegram: "https://t.me/karetny_garage",
  whatsapp: "https://wa.me/74951824719",
  email: "garage@karetny.ru",
  address: "Москва, Каретный Ряд, 5/10, стр. 2",
  hours: "Выдача и приём 24/7",

  leadMinutes: 90,
  driverPerDay: 15000,
  mileagePerDay: 250,
  overMileage: 60,

  /* Price ladder by rental length, share of the base daily price. */
  tiers: [
    { from: 1, to: 2, label: "1–2 суток", k: 1 },
    { from: 3, to: 6, label: "3–6 суток", k: 0.92 },
    { from: 7, to: 14, label: "7–14 суток", k: 0.85 },
    { from: 15, to: 999, label: "от 15 суток", k: 0.78 }
  ],

  classes: {
    executive: "Представительские",
    suv: "Внедорожники",
    sport: "Спорткары",
    open: "Кабриолеты"
  },

  fleet: [
    {
      id: "wraith", brand: "Rolls-Royce", name: "Rolls-Royce Wraith", cls: "executive",
      year: 2022, color: "Arctic White / Black", seats: 4, power: 632, engine: "6,6 л V12", accel: 4.6, drive: "Задний", top: 250,
      perDay: 120000, perHour: 12500, deposit: 400000, driver: true, badges: ["hit"],
      photo: "wraith.jpg", pos: "50% 60%",
      summary: "Двухцветное купе с дверями против хода и звёздным небом в потолке.",
      about: "Wraith берут на вечер, когда важно появление: юбилей, премьера, встреча в ресторане. Двери открываются против хода, в потолке 1340 светодиодов, в каждой двери зонт. С водителем в костюме или за рулём сами.",
      features: ["Звёздное небо в потолке", "Зонт в каждой двери", "Аудио Bespoke", "Ночное видение"]
    },
    {
      id: "bentley", brand: "Bentley", name: "Bentley Flying Spur", cls: "executive",
      year: 2022, color: "Onyx Grey", seats: 5, power: 635, engine: "6,0 л W12", accel: 3.8, drive: "Полный", top: 333,
      perDay: 85000, perHour: 9500, deposit: 300000, driver: true, badges: ["new"],
      photo: "bentley.jpg", pos: "70% 55%",
      summary: "Седан W12 с вращающейся панелью и креслами с массажем.",
      about: "Flying Spur одинаково хорош сзади с водителем и за рулём. Тихий салон, кресла с вентиляцией и массажем, вращающаяся панель с тремя гранями.",
      features: ["Вращающаяся панель", "Массаж задних кресел", "Аудио Naim", "Полный привод"]
    },
    {
      id: "m760li", brand: "BMW", name: "BMW M760Li xDrive", cls: "executive",
      year: 2022, color: "Dravit Grey", seats: 4, power: 585, engine: "6,6 л V12", accel: 3.8, drive: "Полный", top: 250,
      perDay: 45000, perHour: 6900, deposit: 200000, driver: true, badges: [],
      photo: "m760li.jpg", pos: "50% 60%",
      summary: "Длинная база и кресло Executive Lounge сзади справа.",
      about: "Рабочая машина для деловых дней: тихо, быстро, без лишнего внимания. Сзади справа кресло Executive Lounge с подставкой для ног и планшетом.",
      features: ["Кресло Executive Lounge", "Планшет управления сзади", "Шторки на всех окнах", "Аудио Bowers & Wilkins"]
    },
    {
      id: "panamera", brand: "Porsche", name: "Porsche Panamera Turbo S", cls: "executive",
      year: 2023, color: "Jet Black", seats: 4, power: 630, engine: "4,0 л V8", accel: 3.1, drive: "Полный", top: 315,
      perDay: 48000, perHour: 7400, deposit: 200000, driver: true, badges: [],
      photo: "panamera.jpg", pos: "50% 60%",
      summary: "Седан, который едет как спорткар, с местом для троих пассажиров.",
      about: "Для тех, кто хочет вести сам, но не готов отказываться от задних мест. Чёрный, без хрома, пневмоподвеска и четыре отдельных кресла.",
      features: ["Пневмоподвеска", "Четыре отдельных кресла", "Аудио Burmester", "Подруливающая задняя ось"]
    },
    {
      id: "g63", brand: "Mercedes-Benz", name: "Mercedes-AMG G 63", cls: "suv",
      year: 2023, color: "Designo Platinum Magno", seats: 5, power: 585, engine: "4,0 л V8", accel: 4.5, drive: "Полный", top: 220,
      perDay: 50000, perHour: 6900, deposit: 200000, driver: true, badges: ["hit"],
      photo: "g63.jpg", pos: "45% 60%",
      summary: "Матовый «Гелендваген» для города и загородных домов.",
      about: "Понятный выбор, когда дорога неизвестна заранее: три блокировки, высокая посадка, V8 с двумя турбинами. В городе выглядит так же уместно, как на грунтовке к даче.",
      features: ["Три блокировки дифференциала", "Матовая окраска", "Аудио Burmester", "Массаж передних кресел"]
    },
    {
      id: "range-rover", brand: "Land Rover", name: "Range Rover Autobiography LWB", cls: "suv",
      year: 2022, color: "Santorini Black", seats: 5, power: 530, engine: "4,4 л V8", accel: 4.6, drive: "Полный", top: 250,
      perDay: 55000, perHour: 7900, deposit: 200000, driver: true, badges: [],
      photo: "range-rover.jpg", pos: "60% 60%",
      summary: "Длинная база, массаж сзади и самый большой багажник в парке.",
      about: "Для трансферов в аэропорт с чемоданами и поездок всей семьёй. Задние кресла с массажем и откидными столиками, холодильник в подлокотнике.",
      features: ["Длинная база", "Задние кресла с массажем", "Холодильник в подлокотнике", "Пневмоподвеска"]
    },
    {
      id: "rr-sport", brand: "Land Rover", name: "Range Rover Sport", cls: "suv",
      year: 2021, color: "Santorini Black", seats: 5, power: 400, engine: "3,0 л I6", accel: 5.9, drive: "Полный", top: 242,
      perDay: 30000, oldPerDay: 34000, perHour: 5500, deposit: 100000, driver: true, badges: ["sale"],
      photo: "rr-sport.jpg", pos: "50% 55%",
      summary: "Компактнее Autobiography, но с той же посадкой и пневмоподвеской.",
      about: "Самый доступный внедорожник в парке. Удобен в старом центре, где длинная база мешает парковаться, и на трассе за город.",
      features: ["Пневмоподвеска", "Панорамная крыша", "Аудио Meridian", "Подогрев всех кресел"]
    },
    {
      id: "bmw-m5", brand: "BMW", name: "BMW M5 Competition", cls: "sport",
      year: 2021, color: "Frozen Brilliant White", seats: 5, power: 625, engine: "4,4 л V8", accel: 3.3, drive: "Полный", top: 305,
      perDay: 40000, perHour: 0, deposit: 150000, driver: false, badges: ["hit"],
      photo: "bmw-m5.jpg", pos: "55% 55%",
      summary: "Бизнес-седан с характером спорткара и задним приводом по кнопке.",
      about: "Пять мест, большой багажник и 625 сил. Полный привод можно отключить кнопкой 2WD, если хочется почувствовать машину по-настоящему.",
      features: ["Режим 2WD", "Карбоновая крыша", "Аудио Bowers & Wilkins", "Вентиляция кресел"]
    },
    {
      id: "audi-rs7", brand: "Audi", name: "Audi RS 7 Sportback", cls: "sport",
      year: 2023, color: "Nardo Grey", seats: 5, power: 600, engine: "4,0 л V8", accel: 3.6, drive: "Полный", top: 305,
      perDay: 42000, perHour: 0, deposit: 150000, driver: false, badges: ["new"],
      photo: "audi-rs7.jpg", pos: "55% 55%",
      summary: "Пятидверный фастбэк в сером Nardo, лазерные фары.",
      about: "Самая практичная из быстрых машин парка: пять дверей, большой багажник, полный привод и подвеска, которую можно сделать мягкой.",
      features: ["Лазерные фары", "Полноуправляемое шасси", "Аудио Bang & Olufsen", "Массаж передних кресел"]
    },
    {
      id: "audi-rs6", brand: "Audi", name: "Audi RS 6 Avant", cls: "sport",
      year: 2020, color: "Mythos Black", seats: 5, power: 600, engine: "4,0 л V8", accel: 3.6, drive: "Полный", top: 305,
      perDay: 38000, oldPerDay: 44000, perHour: 0, deposit: 150000, driver: false, badges: ["sale"],
      photo: "audi-rs6.jpg", pos: "50% 50%",
      summary: "Универсал на 600 сил: собака, лыжи и 3,6 секунды до сотни.",
      about: "Когда нужна быстрая машина, но с багажником на 565 литров. На выходные за город с вещами.",
      features: ["Багажник 565 л", "Пневмоподвеска", "Рейлинги и багажник на крышу", "Аудио Bang & Olufsen"]
    },
    {
      id: "amg-gt", brand: "Mercedes-Benz", name: "Mercedes-AMG GT R", cls: "sport",
      year: 2020, color: "Designo Selenite Grey Magno", seats: 2, power: 585, engine: "4,0 л V8", accel: 3.6, drive: "Задний", top: 318,
      perDay: 60000, perHour: 0, deposit: 300000, driver: false, badges: [],
      photo: "amg-gt.jpg", pos: "50% 60%",
      summary: "Двухместное купе с вертикальной решёткой Panamericana.",
      about: "Длинный капот, посадка у задней оси и V8 с сухим картером. Для трека и для пустой дороги ранним утром.",
      features: ["Решётка Panamericana", "Подруливающая задняя ось", "Карбон-керамика", "Ковшеобразные кресла"]
    },
    {
      id: "bmw-m4", brand: "BMW", name: "BMW M4 Competition xDrive", cls: "sport",
      year: 2022, color: "Toronto Red", seats: 4, power: 510, engine: "3,0 л I6", accel: 3.5, drive: "Полный", top: 290,
      perDay: 32000, perHour: 0, deposit: 150000, driver: false, badges: ["new"],
      photo: "bmw-m4.jpg", pos: "45% 55%",
      summary: "Красное купе с большими ноздрями, полный привод.",
      about: "Самый доступный способ прокатиться на машине с 500+ силами. Четыре места, нормальный багажник, полный привод на каждый день.",
      features: ["Карбоновые ковши", "Режим 2WD", "Лазерные фары", "Аудио Harman Kardon"]
    },
    {
      id: "911-gt3", brand: "Porsche", name: "Porsche 911 GT3", cls: "sport",
      year: 2019, color: "Carrara White", seats: 2, power: 500, engine: "4,0 л оппозитный 6", accel: 3.4, drive: "Задний", top: 318,
      perDay: 65000, perHour: 0, deposit: 300000, driver: false, badges: [],
      photo: "911-gt3.jpg", pos: "50% 65%",
      summary: "Атмосферный оппозитник до 9000 оборотов.",
      about: "Для пустой дороги через Подмосковье ранним утром. Выдаётся только без водителя, опытным водителям.",
      features: ["Атмосферный двигатель", "Подруливающие задние колёса", "Ковшеобразные кресла", "Клетка безопасности"]
    },
    {
      id: "audi-r8", brand: "Audi", name: "Audi R8 V10 Performance", cls: "sport",
      year: 2021, color: "Daytona Grey", seats: 2, power: 620, engine: "5,2 л V10", accel: 3.1, drive: "Полный", top: 331,
      perDay: 55000, perHour: 0, deposit: 300000, driver: false, badges: [],
      photo: "audi-r8.jpg", pos: "50% 55%",
      summary: "Среднемоторный суперкар с атмосферным V10 и полным приводом.",
      about: "Самый спокойный суперкар в парке: полный привод, понятный характер и звук атмосферного V10 за спиной.",
      features: ["Атмосферный V10", "Полный привод quattro", "Карбон-керамика", "Виртуальная приборная панель"]
    },
    {
      id: "mclaren-720s", brand: "McLaren", name: "McLaren 720S", cls: "sport",
      year: 2020, color: "Silica White", seats: 2, power: 720, engine: "4,0 л V8", accel: 2.9, drive: "Задний", top: 341,
      perDay: 130000, perHour: 0, deposit: 600000, driver: false, badges: ["new"],
      photo: "mclaren-720s.jpg", pos: "50% 62%",
      summary: "Двери-крылья, карбоновый монокок и 720 сил.",
      about: "Самая быстрая машина в парке по разгону до 200 км/ч. Выдаётся водителям от 30 лет со стажем от 8 лет.",
      features: ["Двери-крылья", "Карбоновый монокок", "Складывающаяся приборная панель", "Подъём передней оси"]
    },
    {
      id: "ferrari-f8", brand: "Ferrari", name: "Ferrari F8 Tributo", cls: "sport",
      year: 2021, color: "Rosso Corsa", seats: 2, power: 720, engine: "3,9 л V8", accel: 2.9, drive: "Задний", top: 340,
      perDay: 140000, perHour: 0, deposit: 600000, driver: false, badges: ["hit"],
      photo: "ferrari-f8.jpg", pos: "55% 60%",
      summary: "Красная Ferrari, как её рисуют в детстве.",
      about: "V8 мощностью 720 сил и электроника, которая прощает. Выдаётся водителям от 30 лет со стажем от 8 лет.",
      features: ["Манеттино на руле", "Система Side Slip Control", "Подъём передней оси", "Карбоновые детали салона"]
    },
    {
      id: "aventador", brand: "Lamborghini", name: "Lamborghini Aventador S", cls: "sport",
      year: 2019, color: "Blu Cepheus", seats: 2, power: 740, engine: "6,5 л V12", accel: 2.9, drive: "Полный", top: 350,
      perDay: 160000, perHour: 0, deposit: 700000, driver: false, badges: [],
      photo: "aventador.jpg", pos: "55% 60%",
      summary: "Атмосферный V12 и двери вверх. Флагман парка.",
      about: "Последнее поколение Lamborghini с чистым атмосферным V12. Для съёмок, свадеб и одного очень громкого вечера.",
      features: ["Атмосферный V12", "Двери вверх", "Полноуправляемое шасси", "Подъём передней оси"]
    },
    {
      id: "huracan-evo", brand: "Lamborghini", name: "Lamborghini Huracán EVO Spyder", cls: "open",
      year: 2021, color: "Arancio Xanto", seats: 2, power: 640, engine: "5,2 л V10", accel: 3.1, drive: "Полный", top: 325,
      perDay: 120000, perHour: 0, deposit: 500000, driver: false, badges: [],
      photo: "huracan-evo.jpg", pos: "40% 65%",
      summary: "Оранжевый кабриолет с атмосферным V10.",
      about: "Верх складывается за 17 секунд на ходу до 50 км/ч. Летом это самая востребованная машина парка, бронируйте заранее.",
      features: ["Мягкий верх за 17 секунд", "Атмосферный V10", "Подъём передней оси", "Аудио Sensonum"]
    },
    {
      id: "huracan", brand: "Lamborghini", name: "Lamborghini Huracán Performante Spyder", cls: "open",
      year: 2020, color: "Bianco Monocerus", seats: 2, power: 640, engine: "5,2 л V10", accel: 3.1, drive: "Полный", top: 325,
      perDay: 135000, perHour: 0, deposit: 600000, driver: false, badges: [],
      photo: "huracan.jpg", pos: "60% 65%",
      summary: "Белая Performante на красных дисках, активная аэродинамика ALA.",
      about: "Самая резкая версия Huracán: кованый карбон, активная аэродинамика и выхлоп, который слышно за квартал.",
      features: ["Активная аэродинамика ALA", "Кованый карбон", "Керамические тормоза", "Красные диски"]
    },
    {
      id: "ferrari-488", brand: "Ferrari", name: "Ferrari 488 Spider", cls: "open",
      year: 2019, color: "Rosso Corsa", seats: 2, power: 670, engine: "3,9 л V8", accel: 3.0, drive: "Задний", top: 325,
      perDay: 110000, oldPerDay: 125000, perHour: 0, deposit: 500000, driver: false, badges: ["sale"],
      photo: "ferrari-488.jpg", pos: "50% 60%",
      summary: "Красный кабриолет с жёстким складным верхом.",
      about: "Жёсткий верх складывается за 14 секунд. Для летних вечеров по набережным и загородных поездок вдвоём.",
      features: ["Жёсткий складной верх", "Манеттино на руле", "Карбоновые детали", "Подъём передней оси"]
    },
    {
      id: "dawn", brand: "Rolls-Royce", name: "Rolls-Royce Dawn", cls: "open",
      year: 2021, color: "Jubilee Silver / Black", seats: 4, power: 571, engine: "6,6 л V12", accel: 4.9, drive: "Задний", top: 250,
      perDay: 125000, perHour: 13500, deposit: 400000, driver: true, badges: [],
      photo: "dawn.jpg", pos: "50% 45%",
      summary: "Четырёхместный кабриолет с салоном цвета Mandarin.",
      about: "Чаще всего едет на свадьбы и летние ужины за городом. Верх складывается за 22 секунды, четыре полноценных места.",
      features: ["Мягкий верх за 22 секунды", "Подогрев шеи", "Четыре полноценных места", "Водитель в перчатках по запросу"]
    },
    {
      id: "porsche-718", brand: "Porsche", name: "Porsche 718 Boxster Spyder", cls: "open",
      year: 2021, color: "Racing Yellow", seats: 2, power: 420, engine: "4,0 л оппозитный 6", accel: 4.4, drive: "Задний", top: 301,
      perDay: 28000, perHour: 0, deposit: 100000, driver: false, badges: [],
      photo: "porsche-718.jpg", pos: "45% 60%",
      summary: "Лёгкий родстер с механикой и атмосферным двигателем.",
      about: "Самый доступный кабриолет парка и самый честный по ощущениям: шесть ступеней механики и мотор за спиной.",
      features: ["Механическая коробка", "Атмосферный двигатель", "Ручной мягкий верх", "Спортивный выхлоп"]
    }
  ]
};
