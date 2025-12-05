import './style.css'

async function loadPartials() {
  const includeEls = document.querySelectorAll('[data-include]');

  for (const el of includeEls) {
    const src = el.getAttribute('data-include');
    try {
      const res = await fetch(src);
      if (!res.ok) {
        console.error(`Failed to load partial ${src}:`, res.status);
        continue;
      }
      const html = await res.text();
      el.outerHTML = html;
    } catch (err) {
      console.error(`Error loading partial ${src}:`, err);
    }
  }
}


// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

loadPartials().then(() => {
  initializeMobileMenu();
});