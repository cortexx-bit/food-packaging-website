async function loadProducts() {
  try {
    const response = await fetch('/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const data = await response.json();
    renderProducts(data.products ?? []);
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

  // Filter products to only show those in stock
  const inStockProducts = products.filter(product => product.in_stock === true);

  if (inStockProducts.length === 0) {
    grid.innerHTML = '<p class="text-center text-[var(--color-text)] col-span-full">No products available.</p>';
    return;
  }

  grid.innerHTML = inStockProducts.map(product => {
    const gridImage = product.images?.grid_image;
    const defaultImage = gridImage?.src || `/img/products/${product.sku}/front.webp`;
    const defaultAlt = gridImage?.alt || product.name;

    const firstGalleryImage = product.images?.gallery_images?.[0];
    const hoverImage = firstGalleryImage?.src || `/img/products/${product.sku}/open.webp`;
    const hoverAlt = firstGalleryImage?.alt || `${product.name} - open view`;

    return `
    <a href="/product.html?id=${product.model_number}" class="group bg-transparent rounded-lg shadow-md hover:shadow-xl hover:bg-[#FFB74D]/10 transition-all duration-300 overflow-hidden border border-gray-200">
      <div class="px-6 pt-6 pb-4">
        <div class="aspect-square bg-gray-100 overflow-hidden rounded-lg relative">
          <img 
            src="${defaultImage}" 
            alt="${defaultAlt}" 
            class="product-card-image w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            data-sku="${product.sku}"
            data-hover-src="${hoverImage}"
            data-default-alt="${defaultAlt}"
            data-hover-alt="${hoverAlt}"
            loading="lazy"
            decoding="async"
            onerror="this.src='/img/box.png'"
          >
        </div>
      </div>
      <div class="p-6 pt-0">
        <h3 class="text-xl font-bold text-[var(--color-text)] mb-2 transition-colors">
          ${product.name}
        </h3>
        <p class="text-[var(--color-text)] text-sm leading-relaxed mb-3">
          ${product.short_description}
        </p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 hover:underline">
            <img src="/img/details.png" alt="Details" class="w-5 h-5">
            <span class="text-sm font-semibold text-[var(--color-text)]">Details</span>
          </div>
          <span class="text-xs text-gray-500">${product.sku}</span>
        </div>
      </div>
    </a>
  `;
  }).join('');

  // Swap images and alt text on hover
  const productCards = grid.querySelectorAll('.product-card-image');
  productCards.forEach(img => {
    const hoverSrc = img.getAttribute('data-hover-src');
    const defaultSrc = img.getAttribute('src');
    const hoverAlt = img.getAttribute('data-hover-alt');
    const defaultAlt = img.getAttribute('data-default-alt');

    img.closest('a').addEventListener('mouseenter', () => {
      img.src = hoverSrc;
      img.alt = hoverAlt;
    });

    img.closest('a').addEventListener('mouseleave', () => {
      img.src = defaultSrc;
      img.alt = defaultAlt;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}

