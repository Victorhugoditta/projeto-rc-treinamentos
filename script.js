document.getElementById('year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-contact]').forEach(link => {
  link.addEventListener('click', () => {
    const detail = { channel: link.dataset.contact, location: window.location.pathname };
    window.dispatchEvent(new CustomEvent('rc:contact', { detail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'contact_click', ...detail });
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('main-nav');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 651px)').addEventListener('change', closeMenu);

const revealElements = document.querySelectorAll('.hero > div:not(.hero-aura), .section-heading, .area-list article, .about-grid > div, .process > h2, .steps article, .contact');
let observer;
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach((element, index) => {
    element.style.setProperty('--delay', `${(index % 3) * 70}ms`);
    element.classList.add('reveal');
    observer.observe(element);
  });
}
reducedMotion.addEventListener('change', event => {
  if (event.matches) {
    observer?.disconnect();
    revealElements.forEach(element => element.classList.add('visible'));
  }
});

const header = document.querySelector('header');
const progress = document.querySelector('.reading-progress');
const backTop = document.querySelector('.back-top');
let scrollFrame = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0;
  progress.style.transform = `scaleX(${ratio})`;
  header.classList.toggle('scrolled', window.scrollY > 30);
  backTop.classList.toggle('shown', window.scrollY > 500);
  scrollFrame = false;
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) {
    scrollFrame = true;
    window.requestAnimationFrame(updateScroll);
  }
}, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();

document.querySelectorAll('.area-list article').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--y', `${event.clientY - bounds.top}px`);
  });
});

const serviceFilters = document.querySelectorAll('[data-filter]');
const serviceCards = document.querySelectorAll('[data-theme]');
function selectService(theme, label) {
  const apply = () => {
    serviceFilters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === theme)));
    let visible = 0;
    serviceCards.forEach(card => {
      card.hidden = theme !== 'all' && card.dataset.theme !== theme;
      if (!card.hidden) visible++;
    });
    document.querySelector('.service-grid').classList.toggle('filtered', theme !== 'all');
    document.getElementById('filter-status').textContent = theme === 'all' ? `${visible} temas disponíveis` : `Exibindo: ${label}`;
    updateScroll();
  };
  if (document.startViewTransition && !reducedMotion.matches && !document.documentElement.classList.contains('no-motion')) {
    const transition = document.startViewTransition(apply);
    transition.ready.catch(() => {});
  } else apply();
}
serviceFilters.forEach(button => button.addEventListener('click', () => selectService(button.dataset.filter, button.textContent)));

const solutions = {
  educacao: ['Educação e treinamentos', 'Treinamentos em NRs e palestra sobre Segurança 360°.'],
  engenharia: ['Engenharia e obras', 'Engenharia Civil, Arquitetura e Urbanismo, construção, reformas e manutenção.'],
  sst: ['Saúde e segurança ocupacional', 'Engenharia de Segurança do Trabalho e serviços de saúde e segurança ocupacional.'],
  privada: ['Segurança privada', 'Gestão de Segurança Privada, Formação de Vigilantes e Instrução de Armamento e Tiro.'],
  incendio: ['Segurança contra incêndio', 'Formação de BC e BVI e treinamentos em Segurança Contra Incêndio.']
};
const needSelect = document.getElementById('need-select');
needSelect.addEventListener('change', () => {
  const [title, description] = solutions[needSelect.value];
  document.getElementById('finder-title').textContent = title;
  document.getElementById('finder-description').textContent = description;
});
document.getElementById('finder-link').addEventListener('click', () => selectService(needSelect.value, solutions[needSelect.value][0]));

const motionToggle = document.getElementById('motion-toggle');
motionToggle.addEventListener('click', () => {
  const active = motionToggle.getAttribute('aria-pressed') !== 'true';
  motionToggle.setAttribute('aria-pressed', String(active));
  motionToggle.textContent = active ? 'Restaurar efeitos' : 'Reduzir efeitos';
  document.documentElement.classList.toggle('no-motion', active);
});
const portrait = document.querySelector('[data-depth]');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let depthFrame;
portrait.addEventListener('pointermove', event => {
  if (!finePointer.matches || reducedMotion.matches || document.documentElement.classList.contains('no-motion')) return;
  const rect = portrait.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
  const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
  cancelAnimationFrame(depthFrame);
  depthFrame = requestAnimationFrame(() => {
    portrait.style.setProperty('--rx', `${-y * 2}deg`);
    portrait.style.setProperty('--ry', `${x * 2}deg`);
  });
});
portrait.addEventListener('pointerleave', () => {
  cancelAnimationFrame(depthFrame);
  portrait.style.setProperty('--rx', '0deg');
  portrait.style.setProperty('--ry', '0deg');
});
