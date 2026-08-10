// ── Mobile nav ────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ── Active nav link on scroll ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });

// ── Smooth scroll for all anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 64, behavior: 'smooth' });
    }
  });
});

// ── Reveal on scroll ──────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .project-card, .ach-card, .research-card').forEach((el, i) => {
  el.dataset.delay = (i % 4) * 80;
  revealObserver.observe(el);
});

// ── CV modal ──────────────────────────────────────────────
const cvBtn    = document.getElementById('cv-btn');
const modal    = document.getElementById('cv-modal');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close');
const iframe   = document.getElementById('cv-iframe');

function openModal()  { iframe.src = 'cv.pdf#zoom=75'; modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeModal() { modal.setAttribute('aria-hidden', 'true'); iframe.src = ''; document.body.style.overflow = ''; }

cvBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Email copy ────────────────────────────────────────────
const emailLink = document.getElementById('email-link');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

if (emailLink) {
  emailLink.addEventListener('click', e => {
    e.preventDefault();
    const email = 'raresanghel2008@gmail.com';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard'));
    }
  });
}

// ── Image error fallback ──────────────────────────────────
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => { img.style.display = 'none'; });
});

// ── Ledger count-up ────────────────────────────────────────
const ledger = document.getElementById('hero-ledger');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString('en-US') + '+';
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString('en-US') + (p >= 1 ? '+' : '');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (ledger) {
  const ledgerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ledger.querySelectorAll('.ledger-num').forEach(animateCount);
        ledgerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  ledgerObserver.observe(ledger);
}

// ── Stagger children of grids ─────────────────────────────
document.querySelectorAll('.projects-grid, .projects-featured, .ach-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.dataset.delay = i * 90;
  });
});