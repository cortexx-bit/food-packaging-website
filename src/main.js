import './style.css'


// Injecting header and footer partials
const loadHtml = async (selector, url) => {
  const element = document.querySelector(selector);
  if (element) {
    const response = await fetch(url);
    if (response.ok) {
      const text = await response.text();
      element.innerHTML = text;

      if (selector === '#header-placeholder') {
        initializeMobileMenu();
      }
    }
  }
};

// Load Header and Footer
document.addEventListener("DOMContentLoaded", () => {
  loadHtml("#header-placeholder", "/partials/_header.html");
  loadHtml("#footer-placeholder", "/partials/_footer.html");
});

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

const initializeMobileMenu = () => {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
};