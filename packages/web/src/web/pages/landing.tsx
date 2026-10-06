import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Anchor,
  Castle,
  ChevronDown,
  Diamond,
  Dice5,
  Expand,
  Menu,
  RotateCw,
  Shield,
  Swords,
  X,
} from "lucide-react";
import { factions, battleSteps, gods, cycle } from "../lib/game";
import { OrderForm } from "../components/order-form";

const links = [
  ["#world", "Мир игры"],
  ["#factions", "Фракции"],
  ["#battle", "Как играть"],
  ["#rules", "Правила"],
];

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="section-label">
      <span>{number}</span>
      <i />
      <span>{children}</span>
    </p>
  );
}

function ArtBand({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="art-band">
      <img src={image} alt={title} loading="lazy" />
      <div className="art-band-shade" />
      <div className="wrap art-band-caption">
        <span className="eyebrow">Из мира Вельд’Эран</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function ZoomImage({
  source,
  label,
  close,
}: {
  source: string;
  label: string;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog className="image-dialog" ref={dialog} onCancel={close}>
      <div className="image-dialog-bar">
        <span>{label}</span>
        <button onClick={close} aria-label="Закрыть изображение">
          <X size={24} />
        </button>
      </div>
      <div className="image-dialog-scroll">
        <img src={source} alt={label} />
      </div>
    </dialog>
  );
}

function CombatCard({ value }: { value: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="combat-item">
      <button
        className={`combat-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
        aria-pressed={flipped}
        aria-label={`Перевернуть боевую карту ${value}`}
      >
        <span className="combat-inner">
          <span className="combat-face">
            <img
              src={`/images/v2-${value + 13}.png`}
              alt={`Боевая карта, номинал ${value}`}
              loading="lazy"
            />
          </span>
          <span className="combat-face combat-back">
            <img
              src="/images/card-back.jpg"
              alt="Рубашка боевой карты"
              loading="lazy"
            />
          </span>
        </span>
      </button>
      <span className="card-caption">
        Номинал <b>{value}</b>
      </span>
    </div>
  );
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState<{ source: string; label: string } | null>(
    null,
  );
  const [progress, setProgress] = useState(0);
  const faction = factions[selected];
  const factionArt = faction.art;

  useEffect(() => {
    const update = () =>
      setProgress(
        window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
      );
    window.addEventListener("scroll", update, { passive: true });
    update();
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="landing">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <nav className="navigation" aria-label="Главная навигация">
        <div className="wrap nav-inner">
          <a
            href="https://trioz.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="brand"
          >
            <img src="/images/trioz-emblem.png" alt="TrioZ" />
            <span>
              TRIOZ<span>ENTERTAINMENT</span>
            </span>
          </a>
          <span className="nav-divider" />
          <a className="nav-project" href="#top">
            Перо Измерений
          </a>
          <div className="nav-links">
            {links.map(([href, label]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
          <a href="#order" className="nav-cta">
            Заказать игру
            <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <div className="mobile-nav">
            {links.map(([href, label]) => (
              <a href={href} key={href} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight size={17} />
              </a>
            ))}
            <a href="#order" onClick={() => setMenu(false)}>
              Заказать игру
              <ArrowUpRight size={17} />
            </a>
          </div>
        )}
      </nav>

      <main>
        <header className="hero" id="top" tabIndex={-1}>
          <div className="hero-background" />
          <div className="hero-grain" />
          <div className="wrap hero-content">
            <div className="hero-copy">
              <div className="eyebrow hero-kicker">
                <span className="tiny-star">✧</span> Настольная стратегия ·
                TZ.System
              </div>
              <h1>
                Перо
                <br />
                <span>Измерений</span>
              </h1>
              <p className="hero-world">
                <span />
                Мир Вельд’Эран
              </p>
              <p className="hero-description">
                Десять фракций. Один мир. Ваша история.
                <br />
                Ведите армии, раскрывайте блеф соперников
                <br className="desktop-break" /> и призывайте богов на свою
                сторону.
              </p>
              <div className="hero-buttons">
                <a className="button primary" href="#order">
                  Оставить заявку
                  <ArrowUpRight size={18} />
                </a>
                <a href="#world" className="button text-button">
                  Открыть мир игры
                  <ArrowDown size={16} />
                </a>
              </div>
              <div className="hero-facts">
                <div>
                  <strong>2–10</strong>
                  <span>игроков</span>
                </div>
                <div>
                  <strong>14+</strong>
                  <span>возраст</span>
                </div>
                <div>
                  <strong>10</strong>
                  <span>фракций</span>
                </div>
                <div>
                  <Swords size={25} />
                  <span>дуэли на блефе</span>
                </div>
              </div>
            </div>
            <div className="hero-product">
              <div className="product-orbit orbit-one" />
              <div className="product-orbit orbit-two" />
              <span className="orbit-label">
                ВЕЛЬД’ЭРАН · МИР, КОТОРЫЙ ВЫ СОЗДАЁТЕ
              </span>
              <img
                className="game-box"
                src="/images/game-box.png"
                alt="Оригинальная коробка настольной игры Перо Измерений: Вельд’Эран"
              />
              <div className="product-caption">
                <span className="status-dot" />
                <span>Стратегия о борьбе десяти фракций</span>
                <span className="product-mark">TZ.01</span>
              </div>
            </div>
          </div>
          <div className="wrap hero-bottom">
            <a href="#world">
              <span className="mouse-outline" />
              Начните путешествие
              <ArrowDown size={14} />
            </a>
            <span>Создано TrioZ Entertainment</span>
          </div>
        </header>

        <div className="promise-strip">
          <div className="wrap">
            <span>
              <Castle size={16} /> Контроль территорий
            </span>
            <i>✧</i>
            <span>
              <Swords size={16} /> Сражения без кубиков
            </span>
            <i>✧</i>
            <span>
              <Diamond size={16} /> Помощь богов
            </span>
            <i>✧</i>
            <span>
              <Shield size={16} /> Своя фракция — своя история
            </span>
          </div>
        </div>

        <section id="world" className="world-section wrap section-space">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="01">Мир игры</SectionLabel>
              <h2>
                Целый мир.
                <br />
                <em>На вашем столе.</em>
              </h2>
            </div>
            <p className="section-intro">
              Главный компонент игры — карта мира. Материки соединены дорогами и
              морскими путями, а каждая точка на карте — это точка хода со
              своими правилами. Контроль городов, бонусных точек и святилищ
              решает исход войны.
            </p>
          </div>
          <button
            className="world-map reveal"
            onClick={() =>
              setZoom({
                source: "/images/v2-2.jpg",
                label: "Карта мира Вельд’Эран",
              })
            }
            aria-label="Увеличить карту мира Вельд’Эран"
          >
            <img
              src="/images/v2-2.jpg"
              alt="Карта мира Вельд’Эран с городами, дорогами, морскими путями и святилищами"
              loading="lazy"
            />
            <span className="map-tag">
              <span>ВЕЛЬД’ЭРАН</span>
              <span>
                <Expand size={16} /> Изучить карту
              </span>
            </span>
          </button>
          <div className="map-legend reveal">
            <article>
              <Castle />
              <h3>Города и дороги</h3>
              <p>
                Круг с цветом фракции — стартовый город и источник новых фишек.
                Дороги соединяют ключевые места материков.
              </p>
            </article>
            <article>
              <Diamond />
              <h3>Святилища</h3>
              <p>
                Алмазы на карте — точки, где гвардии призывают богов. Их помощь
                может изменить исход войны.
              </p>
            </article>
            <article>
              <Anchor />
              <h3>Особые локации</h3>
              <p>
                Храм Призраков, Лагерь Шейбанидов, Контрабандисты и Пираты —
                каждая точка меняет правила.
              </p>
            </article>
          </div>
        </section>

        <ArtBand
          image="/images/v2-1.jpg"
          title="Здесь даже легенды идут в бой."
          subtitle="Гиганты фьордов ступают по Вельд’Эрану."
        />

        <section id="factions" className="wrap section-space factions-section">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="02">Стороны конфликта</SectionLabel>
              <h2>
                За кем пойдёте <em>вы?</em>
              </h2>
            </div>
            <p className="section-intro">
              10 фракций — 10 цветов. От выбора зависят стартовые города,
              расстановка армий и цвет фишек. Две одинаковые фракции выбрать
              нельзя.
            </p>
          </div>
          <div className="faction-layout reveal">
            <div className="faction-list" role="tablist" aria-label="Фракции">
              {factions.map((item, i) => (
                <button
                  role="tab"
                  aria-label={item.name}
                  aria-selected={selected === i}
                  aria-controls="faction-panel"
                  id={`faction-tab-${i}`}
                  className={selected === i ? "selected" : ""}
                  key={item.name}
                  onClick={() => setSelected(i)}
                  style={{ "--faction-color": item.color } as CSSProperties}
                >
                  <span className="faction-dot" />
                  <span>{item.name}</span>
                  <span className="faction-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {selected === i && <ArrowUpRight size={18} />}
                </button>
              ))}
            </div>
            <article
              id="faction-panel"
              role="tabpanel"
              aria-labelledby={`faction-tab-${selected}`}
              className="faction-detail"
              style={{ "--faction-color": faction.color } as CSSProperties}
            >
              <img
                className="faction-art"
                src={factionArt}
                alt={`Стилизированная иллюстрация фракции «${faction.name}»`}
                loading="lazy"
              />
              <div className="faction-shade" />
              <div className="faction-detail-content">
                <span className="eyebrow">
                  Фракция {String(selected + 1).padStart(2, "0")} / 10
                </span>
                <img
                  className="faction-shield"
                  src={faction.image}
                  alt={`Щит фракции ${faction.name}`}
                />
                <h3>{faction.name}</h3>
                <p>{faction.text}</p>
                <span className="faction-color-label">
                  <span />
                  {faction.label} · цвет фишек
                </span>
              </div>
            </article>
          </div>
        </section>

        <section id="battle" className="battle-section section-space">
          <div className="wrap">
            <div className="battle-heading reveal">
              <SectionLabel number="03">Ключевая механика</SectionLabel>
              <h2>
                Не удача.
                <br />
                <em>Умение читать соперника.</em>
              </h2>
              <p>
                Никаких кубиков в бою: исход решают боевые карты номиналом от 1
                до 5.
                <br className="desktop-break" /> Каждому игроку в начале партии
                раздаётся 5 карт втайне от остальных.
              </p>
            </div>
            <div className="combat-hand reveal">
              {[1, 2, 3, 4, 5].map((value) => (
                <CombatCard value={value} key={value} />
              ))}
            </div>
            <p className="card-instruction">
              <RotateCw size={14} />
              Нажмите на карту, чтобы перевернуть её
            </p>
            <div className="battle-steps reveal">
              {battleSteps.map(([title, text], i) => (
                <article key={title}>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className="battle-note">
              <Diamond size={18} />
              <p>
                Против пиратов, призраков и Шейбанидов игрок выкладывает верхнюю
                карту общей колоды — не подсматривая её номинал. Использованные
                карты уходят в «бито», а потраченные — добираются из общей
                колоды.
              </p>
            </div>
          </div>
        </section>

        <section id="armies" className="wrap section-space">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="04">Ваши армии</SectionLabel>
              <h2>
                Каждая фишка
                <br />
                <em>имеет значение.</em>
              </h2>
            </div>
            <p className="section-intro">
              Каждая фракция получает 11 фишек своего цвета: 8 простых щитов —
              отряды — и 3 фишки с мечами — гвардии.
            </p>
          </div>
          <div className="army-layout reveal">
            <article>
              <div className="army-art">
                <img
                  src="/images/v2-4.png"
                  alt="Простой щит — фишка отряда"
                  loading="lazy"
                />
                <span>08</span>
              </div>
              <div>
                <p className="eyebrow">Два хода за круг</p>
                <h3>Отряды</h3>
                <p>
                  Рабочие лошадки армии. Расставляются по своим городам, из
                  запаса выходят по 2 фишки за круг.
                </p>
              </div>
            </article>
            <article>
              <div className="army-art">
                <img
                  src="/images/v2-21.png"
                  alt="Щит с мечами — фишка гвардии"
                  loading="lazy"
                />
                <Swords className="guard-swords" aria-hidden="true" />
                <span>03</span>
              </div>
              <div>
                <p className="eyebrow">Один ход за круг</p>
                <h3>Гвардии</h3>
                <p>
                  Только гвардии могут призывать богов на святилищах. Сражаются
                  по общим правилам.
                </p>
              </div>
            </article>
          </div>
        </section>

        <ArtBand
          image="/images/v2-3.jpg"
          title="Леса помнят тех, кто выбрал свою сторону."
          subtitle="Высшие и низшие эльфы делят леса Алвинда и Алдесвинда."
        />

        <section id="gods" className="wrap section-space">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="05">Святилища</SectionLabel>
              <h2>
                Когда в игру
                <br />
                <em>вступают боги.</em>
              </h2>
            </div>
            <div className="section-intro">
              <Dice5 className="gods-icon" size={30} />
              <p>
                Гвардия на святилище бросает два кубика. Сумма определяет, какой
                бог придёт на помощь. Не более двух бросков на одно святилище.
              </p>
            </div>
          </div>
          <div className="gods-grid reveal">
            {gods.map(([sum, name, text]) => (
              <details className="god-row" key={sum}>
                <summary>
                  <span className="god-sum">{sum}</span>
                  <h3>{name}</h3>
                  <ChevronDown size={16} />
                </summary>
                <p>{text}</p>
              </details>
            ))}
          </div>
          <p className="quiet-note">
            Откройте имя божества, чтобы узнать его способность.
          </p>
        </section>

        <section id="play" className="play-section section-space">
          <div className="wrap">
            <SectionLabel number="06">Ход партии</SectionLabel>
            <h2 className="reveal">
              От первого хода <em>до победы.</em>
            </h2>
            <div className="cycle-grid reveal">
              {cycle.map((item, i) => (
                <article key={item.title}>
                  <span className="cycle-number">0{i + 1}</span>
                  <span className="eyebrow">{item.tag}</span>
                  <h3>{item.title}</h3>
                  {item.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="rules" className="wrap rules-section section-space">
          <div className="rules-heading reveal">
            <div>
              <SectionLabel number="07">Полные правила</SectionLabel>
              <h2>
                Все детали — <em>в свитке.</em>
              </h2>
              <p>
                Оригинальные листы правил V.1 от 31.10.21.
                <br />
                Раскройте сканы, чтобы изучить игру подробнее.
              </p>
            </div>
            <span className="rules-version">
              V.1<span>31 / 10 / 21</span>
            </span>
          </div>
          <details className="rules-accordion">
            <summary>
              <span>
                <Shield size={20} /> Оригинальные листы правил
              </span>
              <span>
                2 листа
                <ChevronDown size={19} />
              </span>
            </summary>
            <div className="rules-scans">
              {[34, 35].map((n, i) => (
                <button
                  key={n}
                  aria-label={`Увеличить правила, лист ${i + 1}`}
                  onClick={() =>
                    setZoom({
                      source: `/images/v2-${n}.jpg`,
                      label: `Правила, лист ${i + 1} · V.1 31.10.21`,
                    })
                  }
                >
                  <img
                    src={`/images/v2-${n}.jpg`}
                    alt={`Оригинальные правила, лист ${i + 1}`}
                    loading="lazy"
                  />
                  <span>
                    Лист 0{i + 1}
                    <Expand size={16} />
                  </span>
                </button>
              ))}
            </div>
          </details>
        </section>

        <section id="order" className="order-section section-space">
          <div className="wrap order-layout">
            <div className="order-copy reveal">
              <SectionLabel number="08">Ваша история начинается</SectionLabel>
              <h2>
                Откройте коробку.
                <br />
                <em>Измените мир.</em>
              </h2>
              <p>
                Оставьте заявку на «Перо Измерений: Вельд’Эран». Команда TrioZ
                расскажет о возможности заказа, стоимости и условиях получения
                игры.
              </p>
              <a className="email-link" href="mailto:sales@trioz.ru">
                <MailIcon />
                sales@trioz.ru
                <ArrowUpRight size={16} />
              </a>
              <img
                className="order-box"
                src="/images/game-box.png"
                alt="Коробка Перо Измерений"
                loading="lazy"
              />
            </div>
            <OrderForm />
          </div>
        </section>

        <section
          id="ecosystem"
          className="wrap ecosystem-section section-space"
        >
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="09">Экосистема TrioZ</SectionLabel>
              <h2>
                Больше, чем <em>одна игра.</em>
              </h2>
            </div>
            <p className="section-intro">
              «Перо Измерений» — часть большой вселенной TZ.System и экосистемы
              проектов TrioZ.
            </p>
          </div>
          <div className="ecosystem-links reveal">
            <a
              href="https://trioz.ru/library"
              aria-label="Открыть библиотеку TZ.System на trioz.ru"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/library.jpg" alt="" loading="lazy" />
              <div>
                <span className="eyebrow">Лор · Вики · История</span>
                <h3>Библиотека TZ.System</h3>
                <p>
                  История народов, хроники Эрании и Ноутии,
                  <br />
                  сказания о богах и полубогах.
                </p>
                <span className="eco-action">
                  Открыть библиотеку
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </a>
            <a
              href="https://trioz.ru/"
              aria-label="Перейти к экосистеме проектов TrioZ"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/feather.jpg" alt="" loading="lazy" />
              <div>
                <span className="eyebrow">Проекты · Новости · Вселенная</span>
                <h3>Откройте TrioZ</h3>
                <p>
                  Другие проекты, новости разработчика
                  <br />и материалы по вселенной.
                </p>
                <span className="eco-action">
                  Перейти на trioz.ru
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </a>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap footer-top">
          <a
            className="brand"
            href="https://trioz.ru/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/images/trioz-emblem.png" alt="TrioZ" />
            <span>
              TRIOZ<span>ENTERTAINMENT</span>
            </span>
          </a>
          <div>
            Перо Измерений<span>Мир Вельд’Эран · TZ.System</span>
          </div>
          <a href="#top">
            Вернуться наверх
            <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} TrioZ Entertainment</span>
          <span>Все права защищены</span>
          <a href="https://trioz.ru/" target="_blank" rel="noopener noreferrer">
            trioz.ru
            <ArrowRight size={12} />
          </a>
        </div>
      </footer>
      {zoom && (
        <ZoomImage
          source={zoom.source}
          label={zoom.label}
          close={() => setZoom(null)}
        />
      )}
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}
