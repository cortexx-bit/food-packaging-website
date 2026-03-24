import './style.css';

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

function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.setAttribute(
      'aria-expanded',
      mobileMenu.classList.contains('hidden') ? 'false' : 'true'
    );

    mobileMenuButton.addEventListener('click', () => {
      const isNowHidden = mobileMenu.classList.toggle('hidden');
      mobileMenuButton.setAttribute('aria-expanded', isNowHidden ? 'false' : 'true');
    });
  }

  const mobileProductsButton = document.getElementById('mobile-products-button');
  const mobileProductsDropdown = document.getElementById('mobile-products-dropdown');
  const mobileProductsArrow = document.getElementById('mobile-products-arrow');

  if (mobileProductsButton && mobileProductsDropdown && mobileProductsArrow) {
    mobileProductsButton.setAttribute(
      'aria-expanded',
      mobileProductsDropdown.classList.contains('hidden') ? 'false' : 'true'
    );

    mobileProductsButton.addEventListener('click', (e) => {
      e.preventDefault();

      const isNowHidden = mobileProductsDropdown.classList.toggle('hidden');
      mobileProductsArrow.classList.toggle('rotate-180', !isNowHidden);
      mobileProductsButton.setAttribute('aria-expanded', isNowHidden ? 'false' : 'true');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenuButton && mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
      }

      if (
        mobileProductsButton &&
        mobileProductsDropdown &&
        mobileProductsArrow &&
        !mobileProductsDropdown.classList.contains('hidden')
      ) {
        mobileProductsDropdown.classList.add('hidden');
        mobileProductsArrow.classList.remove('rotate-180');
        mobileProductsButton.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

async function loadCategoriesDropdown() {
  try {
    const response = await fetch('/categories.json');

    if (!response.ok) {
      console.warn('Failed to load categories for dropdown');
      return;
    }

    const categoriesJson = await response.json();
    const categories = categoriesJson.categories ?? [];

    const desktopDropdown = document.getElementById('products-dropdown-content');
    if (desktopDropdown) {
      let html =
        '<a href="/products.html" class="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors font-semibold">View All</a>';
      html += '<div class="border-t border-gray-200 my-1"></div>';

      categories.forEach((category) => {
        html += `<a href="/category.html?name=${category.slug}" class="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors">${category.name}</a>`;
      });

      desktopDropdown.innerHTML = html;
    }

    const mobileDropdownContent = document.getElementById('mobile-products-dropdown-content');
    const mobileProductsDropdown = document.getElementById('mobile-products-dropdown');
    const mobileProductsArrow = document.getElementById('mobile-products-arrow');
    const mobileProductsButton = document.getElementById('mobile-products-button');

    if (mobileDropdownContent) {
      let html =
        '<a href="/products.html" class="block py-2 px-6 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] font-semibold bg-gray-100">View All</a>';

      categories.forEach((category) => {
        html += `<a href="/category.html?name=${category.slug}" class="block py-2 px-6 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)]">${category.name}</a>`;
      });

      mobileDropdownContent.innerHTML = html;

      if (mobileProductsDropdown && mobileProductsArrow && mobileProductsButton) {
        const mobileDropdownLinks = mobileProductsDropdown.querySelectorAll('a');

        mobileDropdownLinks.forEach((link) => {
          link.addEventListener('click', () => {
            mobileProductsDropdown.classList.add('hidden');
            mobileProductsArrow.classList.remove('rotate-180');
            mobileProductsButton.setAttribute('aria-expanded', 'false');
          });
        });
      }
    }
  } catch (error) {
    console.error('Error loading categories dropdown:', error);
  }
}

async function initializeSite() {
  await loadPartials();
  initializeMobileMenu();
  await loadCategoriesDropdown();
}

initializeSite();