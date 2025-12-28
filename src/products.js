async function loadProducts() {
  try {
    const response = await fetch('/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = '<p class="text-center text-red-600 col-span-full">Failed to load products. Please try again later.</p>';
    }
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<p class="text-center text-[var(--color-text)] col-span-full">No products available.</p>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <a href="/product.html?id=${product.id}" class="group bg-transparent rounded-lg shadow-md hover:shadow-xl hover:bg-[#FFB74D]/10 transition-all duration-300 overflow-hidden border border-gray-200">
      <div class="px-6 pt-6 pb-4">
        <div class="aspect-square bg-gray-100 overflow-hidden rounded-lg">
          <img 
            src="${product.card_image}" 
            alt="${product.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onerror="this.src='/img/box.png'"
          >
        </div>
      </div>
      <div class="p-6 pt-0">
        <p class="text-sm text-gray-600 mb-3">${product.sku}</p>
        <h3 class="text-xl font-bold text-[var(--color-text)] mb-2 transition-colors">
          ${product.name}
        </h3>
        <p class="text-[var(--color-text)] text-sm leading-relaxed mb-3">
          ${product.short_description}
        </p>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 hover:underline">
          <img src="/img/details.png" alt="Details" class="w-5 h-5">
          <span class="text-sm font-semibold text-[var(--color-text)]">Details</span>
        </div>
      </div>
    </a>
  `).join('');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}

