const desktop = matchMedia('(width >= 60rem)');

/* ---------- Menu-overlay ---------- */
const menu = document.querySelector('#menu');
const menuOpen = document.querySelector('[data-menu-open]');
const submenuToggles = menu.querySelectorAll('[data-submenu-toggle]');

const openToggle = () => menu.querySelector('[data-submenu-toggle][aria-expanded="true"]');

function closeSubmenus() {
  submenuToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
}

menuOpen.addEventListener('click', () => {
  menu.showModal();
  menuOpen.setAttribute('aria-expanded', 'true');
});

menu.querySelector('[data-menu-close]').addEventListener('click', () => menu.close());

// Klik op de balk (backdrop-strook) of buiten het paneel sluit het menu
menu.addEventListener('click', (event) => {
  if (event.target === menu || event.target.matches('.menu__bar')) menu.close();
});

menu.addEventListener('close', () => {
  closeSubmenus();
  menuOpen.setAttribute('aria-expanded', 'false');
});

// Esc sluit eerst een open submenu, pas daarna het menu
menu.addEventListener('keydown', (event) => {
  const toggle = openToggle();
  if (event.key !== 'Escape' || !toggle) return;
  event.preventDefault();
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus();
});

submenuToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    clearTimeout(hoverTimer);
    // Muisklik op desktop opent altijd (hover heeft het mogelijk al geopend); toetsenbord togglet
    const mouseOnDesktop = desktop.matches && event.pointerType === 'mouse';
    const willOpen = mouseOnDesktop || toggle.getAttribute('aria-expanded') !== 'true';
    closeSubmenus();
    if (!willOpen) return;
    toggle.setAttribute('aria-expanded', 'true');
    // Mobiel: submenu bedekt het hoofdmenu, dus focus naar "Terug"
    if (!desktop.matches) {
      document.getElementById(toggle.getAttribute('aria-controls')).querySelector('[data-submenu-back]').focus();
    }
  });
});

/*
  Desktop: openen en wisselen gaan direct bij hover. Alleen het sluiten na
  pointerleave loopt via een korte setTimeout, die bij terugkeer (item of
  submenu) wordt geannuleerd. Zo knippert het niet als je op de rand van
  een item zit of even over de grens tussen item en submenu beweegt.
*/
const CLOSE_GRACE = 100;
let hoverTimer;

const isMouseOnDesktop = (event) => event.pointerType === 'mouse' && desktop.matches;

function scheduleClose() {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(closeSubmenus, CLOSE_GRACE);
}

menu.querySelectorAll('.menu__main > li > .menu__item').forEach((item) => {
  item.addEventListener('pointerenter', (event) => {
    if (!isMouseOnDesktop(event)) return;
    clearTimeout(hoverTimer);
    if (openToggle() === item) return;
    closeSubmenus();
    if (item.hasAttribute('data-submenu-toggle')) item.setAttribute('aria-expanded', 'true');
  });
  item.addEventListener('pointerleave', (event) => {
    if (isMouseOnDesktop(event)) scheduleClose();
  });
});

menu.querySelectorAll('.menu__main .submenu').forEach((submenu) => {
  submenu.addEventListener('pointerenter', (event) => {
    if (isMouseOnDesktop(event)) clearTimeout(hoverTimer);
  });
  submenu.addEventListener('pointerleave', (event) => {
    if (isMouseOnDesktop(event)) scheduleClose();
  });
});

menu.addEventListener('close', () => clearTimeout(hoverTimer));

menu.querySelectorAll('[data-submenu-back]').forEach((back) => {
  back.addEventListener('click', () => {
    const toggle = menu.querySelector(`[aria-controls="${back.closest('.submenu').id}"]`);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });
});

// Een submenu dat alleen op mobiel bestaat (taal) mag niet openstaan op desktop
desktop.addEventListener('change', () => {
  const toggle = openToggle();
  if (toggle && !toggle.checkVisibility()) closeSubmenus();
});

/* ---------- Taalkeuze (desktop) ---------- */
const langToggle = document.querySelector('[data-lang-toggle]');
const langItem = langToggle.closest('li');

const setLang = (open) => langToggle.setAttribute('aria-expanded', String(open));

langToggle.addEventListener('click', () => setLang(langToggle.getAttribute('aria-expanded') !== 'true'));
document.querySelector('[data-scrim]').addEventListener('click', () => setLang(false));

langItem.addEventListener('focusout', (event) => {
  if (!langItem.contains(event.relatedTarget)) setLang(false);
});

langItem.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || langToggle.getAttribute('aria-expanded') !== 'true') return;
  setLang(false);
  langToggle.focus();
});
