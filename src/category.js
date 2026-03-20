let categoriesData = null;

function ensureMetaDescriptionTag() {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'description');
    document.head.appendChild(tag);
  }
  return tag;
}

function titleCase(str) {
  return (str || "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// Try to guess a better "use" phrase per category.
// Can be expanded over time.
function getCategoryKeyUse(nameOrSlug) {
  const s = (nameOrSlug || "").toLowerCase();

  if (s.includes("fish") && s.includes("chip")) return "Fish & Chips Takeaway Packaging";
  if (s.includes("burger")) return "Takeaway Packaging for Burgers";
  if (s.includes("pizza")) return "Pizza Takeaway Packaging";
  if (s.includes("salad")) return "Packaging for Salads";
  if (s.includes("soup")) return "Packaging for Soups";
  if (s.includes("tray")) return "Meal Trays for Takeaway";
  if (s.includes("bowl")) return "Food Bowls for Takeaway";
  if (s.includes("cup")) return "Hot & Cold Drink Cups";

  return "Takeaway Food Packaging";
}

// Title format: {Category Name} — {Key Use} | KMZ Packaging
// Description: includes category, key benefits, and optional product count.
function setCategoryMetaTags(categorySlug, categoryData, products = []) {
  const BRAND = "KMZ Packaging";

  const categoryName =
    categoryData?.name ||
    titleCase(categorySlug) ||
    "Category";

  const keyUse = getCategoryKeyUse(categoryName || categorySlug);

  const seoTitle = `${categoryName} — ${keyUse} | ${BRAND}`;
  document.title = seoTitle;

  const productCount = Array.isArray(products) ? products.length : 0;

  let base = (categoryData?.description || "").replace(/\s+/g, " ").trim();

  if (!base || base.length < 30) {
    base = `Browse our range of ${categoryName.toLowerCase()}. Durable, compostable options ideal for restaurants, takeaways, and food service.`;
  }

  const countBit =
    productCount > 0 ? ` View ${productCount} product${productCount === 1 ? "" : "s"}.` : "";

  let seoDescription = `${base}${countBit}`;
  seoDescription = seoDescription.substring(0, 155);

  const tag = ensureMetaDescriptionTag();
  tag.setAttribute("content", seoDescription);
}

function getCategorySlug() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('name');
}

async function loadCategory() {
  const categorySlug = getCategorySlug();
  
  if (!categorySlug) {
    showNotFound();
    return;
  }

  try {
    // Fetch both products.json and categories.json
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch('/products.json'),
      fetch('/categories.json')
    ]);
    
    if (!productsResponse.ok) {
      throw new Error('Failed to load products');
    }
    if (!categoriesResponse.ok) {
      throw new Error('Failed to load categories');
    }
    
    const { products = [] } = await productsResponse.json();
    categoriesData = await categoriesResponse.json();
    
    // Find the category data
    const categoryData = categoriesData[categorySlug];
    
    if (!categoryData) {
      showNotFound();
      return;
    }
    
    // Filter products that belong to this category
    const categoryProducts = products.filter((product) => {
      const modelNumber = product.model_number?.trim();
      return (
        product.in_stock === true &&
        Boolean(modelNumber) &&
        product.categories &&
        product.categories.includes(categorySlug)
      );
    });
    
    displayCategory(categoryData, categoryProducts);
  } catch (error) {
    console.error('Error loading category:', error);
    showNotFound();
  }
}

function showNotFound() {
  document.getElementById('category-loading').classList.add('hidden');
  document.getElementById('category-content').classList.add('hidden');
  document.getElementById('category-not-found').classList.remove('hidden');
}

function displayCategory(categoryData, products) {
  document.getElementById('category-loading').classList.add('hidden');
  document.getElementById('category-not-found').classList.add('hidden');
  document.getElementById('category-content').classList.remove('hidden');
  
  setCategoryMetaTags(getCategorySlug(), categoryData, products);
  
  // Display category name and description
  document.getElementById('category-title').textContent = categoryData.name;
  document.getElementById('category-description').textContent = categoryData.description;
  
  // Render products
  renderProducts(products);
}

function renderProducts(products) {
  const grid = document.getElementById('category-products-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<p class="text-center text-[var(--color-text)] col-span-full">No products available in this category.</p>';
    return;
  }

  grid.innerHTML = products.map(product => {
    // Use default_image field from product data
    const defaultImage = product.default_image || `/img/products/${product.sku}/front.webp`;
    
    // Use hover_image field if provided, otherwise use default open.webp path
    const hoverImage = product.hover_image || `/img/products/${product.sku}/open.webp`;
    
    return `
    <a href="/product.html?id=${product.model_number}" class="group bg-transparent rounded-lg shadow-md hover:shadow-xl hover:bg-[#FFB74D]/10 transition-all duration-300 overflow-hidden border border-gray-200">
      <div class="px-6 pt-6 pb-4">
        <div class="aspect-square bg-gray-100 overflow-hidden rounded-lg relative">
          <img 
            src="${defaultImage}" 
            alt="${product.name}" 
            class="product-card-image w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            data-sku="${product.sku}"
            data-hover-src="${hoverImage}"
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
  
  // Swap images on hover
  const productCards = grid.querySelectorAll('.product-card-image');
  productCards.forEach(img => {
    const hoverSrc = img.getAttribute('data-hover-src');
    const defaultSrc = img.getAttribute('src');
    
    img.closest('a').addEventListener('mouseenter', () => {
      img.src = hoverSrc;
    });
    
    img.closest('a').addEventListener('mouseleave', () => {
      img.src = defaultSrc;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCategory);
} else {
  loadCategory();
}

