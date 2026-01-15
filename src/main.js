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
  
  // Initialize mobile products dropdown
  const mobileProductsButton = document.getElementById('mobile-products-button');
  const mobileProductsDropdown = document.getElementById('mobile-products-dropdown');
  const mobileProductsArrow = document.getElementById('mobile-products-arrow');
  
  if (mobileProductsButton && mobileProductsDropdown && mobileProductsArrow) {
    mobileProductsButton.addEventListener('click', (e) => {
      e.preventDefault();
      mobileProductsDropdown.classList.toggle('hidden');
      mobileProductsArrow.classList.toggle('rotate-180');
    });
  }
}

async function loadCategoriesDropdown() {
  try {
    const response = await fetch('/categories.json');
    if (!response.ok) {
      console.warn('Failed to load categories for dropdown');
      return;
    }
    
    const categoriesData = await response.json();
    
    // Populate desktop dropdown
    const desktopDropdown = document.getElementById('products-dropdown-content');
    if (desktopDropdown) {
      let html = '<a href="/products.html" class="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors font-semibold">View All</a>';
      html += '<div class="border-t border-gray-200 my-1"></div>';
      
      Object.keys(categoriesData).forEach(slug => {
        const category = categoriesData[slug];
        html += `<a href="/category.html?name=${slug}" class="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors">${category.name}</a>`;
      });
      
      desktopDropdown.innerHTML = html;
    }
    
    // Populate mobile dropdown
    const mobileDropdown = document.getElementById('mobile-products-dropdown-content');
    const mobileProductsDropdown = document.getElementById('mobile-products-dropdown');
    const mobileProductsArrow = document.getElementById('mobile-products-arrow');
    
    if (mobileDropdown) {
      let html = '<a href="/products.html" class="block py-2 px-6 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] font-semibold bg-gray-100">View All</a>';
      
      Object.keys(categoriesData).forEach(slug => {
        const category = categoriesData[slug];
        html += `<a href="/category.html?name=${slug}" class="block py-2 px-6 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)]">${category.name}</a>`;
      });
      
      mobileDropdown.innerHTML = html;
      
      // Close dropdown when clicking on a link (after content is loaded)
      if (mobileProductsDropdown && mobileProductsArrow) {
        const mobileDropdownLinks = mobileProductsDropdown.querySelectorAll('a');
        mobileDropdownLinks.forEach(link => {
          link.addEventListener('click', () => {
            mobileProductsDropdown.classList.add('hidden');
            mobileProductsArrow.classList.remove('rotate-180');
          });
        });
      }
    }
  } catch (error) {
    console.error('Error loading categories dropdown:', error);
  }
}

loadPartials().then(() => {
  initializeMobileMenu();
  loadCategoriesDropdown();
});