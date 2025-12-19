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
    <a href="/product.html?id=${product.id}" class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200">
      <div class="aspect-square bg-gray-100 overflow-hidden">
        <img 
          src="${product.card_image}" 
          alt="${product.name}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onerror="this.src='/img/box.png'"
        >
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
          ${product.name}
        </h3>
        <p class="text-sm text-gray-600 mb-3">${product.sku}</p>
        <p class="text-[var(--color-text)] text-sm leading-relaxed">
          ${product.short_description}
        </p>
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">${product.size}</p>
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

