let currentImageIndex = 0;
let productData = null;
let galleryImages = [];
let categoriesData = null;

function getProductModelNumber() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function loadProduct() {
  const productModelNumber = getProductModelNumber();

  if (!productModelNumber) {
    showNotFound();
    return;
  }

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch('/products.json'),
      fetch('/categories.json')
    ]);

    if (!productsResponse.ok) {
      throw new Error('Failed to load products');
    }

    const products = await productsResponse.json();
    categoriesData = await categoriesResponse.json();
    productData = products.find(p => p.model_number === productModelNumber);

    if (!productData) {
      showNotFound();
      return;
    }

    // Check if product is out of stock
    if (productData.in_stock === false) {
      showNotFound();
      return;
    }

    displayProduct();
  } catch (error) {
    console.error('Error loading product:', error);
    showNotFound();
  }
}

function showNotFound() {
  document.getElementById('product-loading').classList.add('hidden');
  document.getElementById('product-detail').classList.add('hidden');
  document.getElementById('product-not-found').classList.remove('hidden');
}

function displayProduct() {
  document.getElementById('product-loading').classList.add('hidden');
  document.getElementById('product-not-found').classList.add('hidden');
  document.getElementById('product-detail').classList.remove('hidden');

  document.title = `${productData.name} - KMZ-Packaging`;

  // Update breadcrumb
  const breadcrumb = document.getElementById('breadcrumb');
  const breadcrumbProductName = document.getElementById('breadcrumb-product-name');
  if (breadcrumb && breadcrumbProductName) {
    breadcrumbProductName.textContent = productData.name;
    breadcrumb.classList.remove('hidden');
  }

  document.getElementById('product-name').textContent = productData.name;
  document.getElementById('product-sku').textContent = productData.sku;
  document.getElementById('product-description').textContent = productData.full_description;

  // Update Request Quote button to include SKU
  const requestQuoteBtn = document.getElementById('request-quote-btn');
  if (requestQuoteBtn) {
    requestQuoteBtn.href = `/contact.html?sku=${encodeURIComponent(productData.sku)}`;
  }

  // Update Request Sample button to include SKU and sample parameter
  const requestSampleBtn = document.getElementById('request-sample-btn');
  if (requestSampleBtn) {
    requestSampleBtn.href = `/contact.html?sku=${encodeURIComponent(productData.sku)}&sample=true`;
  }

  displayCategories();

  // Build gallery images array from new structure
  galleryImages = productData.images?.gallery_images || [];
  
  // Fallback to old format if new structure doesn't exist
  if (galleryImages.length === 0 && productData.gallery_images) {
    galleryImages = productData.gallery_images.map((src, index) => ({
      src: src,
      alt: `${productData.name} - Image ${index + 1}`
    }));
  }
  
  // Final fallback to card_image
  if (galleryImages.length === 0 && productData.card_image) {
    galleryImages = [{
      src: productData.card_image,
      alt: productData.name
    }];
  }
  
  currentImageIndex = 0;

  updateMainImage();
  createThumbnails();
  setupNavigation();
  displaySpecifications();
}

function updateMainImage() {
  const mainImage = document.getElementById('main-product-image');
  const mainImageLink = document.getElementById('main-image-link');

  if (galleryImages.length > 0) {
    const currentImageData = galleryImages[currentImageIndex];
    const imageSrc = currentImageData.src || currentImageData;
    const imageAlt = currentImageData.alt || `${productData.name} - Image ${currentImageIndex + 1}`;
    
    mainImage.src = imageSrc;
    mainImage.alt = imageAlt;

    if (mainImageLink) {
      mainImageLink.href = imageSrc;
      mainImageLink.setAttribute('data-caption', imageAlt);
    }
  }

  updateThumbnailActiveState();
  updateArrowStates();
}

function createThumbnails() {
  const container = document.getElementById('thumbnail-container');
  container.innerHTML = '';

  galleryImages.forEach((imageData, index) => {
    const imageSrc = imageData.src || imageData;
    const imageAlt = imageData.alt || `${productData.name} - Thumbnail ${index + 1}`;
    
    const thumbnail = document.createElement('button');
    thumbnail.className = `w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-2 shadow-md'
      : 'border-gray-200 hover:border-gray-300'
      }`;
    thumbnail.addEventListener('click', () => {
      currentImageIndex = index;
      updateMainImage();
    });

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageAlt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'w-full h-full object-cover';
    img.onerror = function () {
      this.src = '/img/box.png';
    };

    thumbnail.appendChild(img);
    container.appendChild(thumbnail);
  });
}

function updateThumbnailActiveState() {
  const thumbnails = document.querySelectorAll('#thumbnail-container button');
  thumbnails.forEach((thumb, index) => {
    if (index === currentImageIndex) {
      thumb.classList.remove('border-gray-200', 'border-gray-300', 'hover:border-gray-300');
      thumb.classList.add('border-[var(--color-primary)]', 'ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2', 'shadow-md');
    } else {
      thumb.classList.remove('border-[var(--color-primary)]', 'ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2', 'shadow-md');
      thumb.classList.add('border-gray-200', 'hover:border-gray-300');
    }
  });
}

function updateArrowStates() {
  const prevBtn = document.getElementById('prev-image');
  const nextBtn = document.getElementById('next-image');

  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = galleryImages.length <= 1;
  nextBtn.disabled = galleryImages.length <= 1;

  if (galleryImages.length <= 1) {
    prevBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
  }
}

function setupNavigation() {
  const prevBtn = document.getElementById('prev-image');
  const nextBtn = document.getElementById('next-image');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
      updateMainImage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
      updateMainImage();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (document.getElementById('product-detail').classList.contains('hidden')) return;

    if (e.key === 'ArrowLeft') {
      currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
      updateMainImage();
    } else if (e.key === 'ArrowRight') {
      currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
      updateMainImage();
    }
  });
}

function displayCategories() {
  const categoriesContainer = document.getElementById('product-categories-container');
  const categoriesElement = document.getElementById('product-categories');

  if (!categoriesContainer || !categoriesElement) return;

  if (productData.categories && productData.categories.length > 0 && categoriesData) {
    const categoryLinks = [];

    productData.categories.forEach(categorySlug => {
      const category = categoriesData[categorySlug];

      if (category && category.name) {
        const categoryName = category.name;
        const linkHTML = `<a href="/category.html?name=${categorySlug}" class="category-link">${categoryName}</a>`;
        categoryLinks.push(linkHTML);
      }
    });

    if (categoryLinks.length > 0) {
      categoriesElement.innerHTML = categoryLinks.join(', ');
      categoriesContainer.style.display = 'block';
    } else {
      categoriesContainer.style.display = 'none';
    }
  } else {
    categoriesContainer.style.display = 'none';
  }
}

function displaySpecifications() {
  const detailedInfoContainer = document.getElementById('detailed-info');
  if (!detailedInfoContainer || !productData || !productData.specifications) {
    return;
  }

  const specs = productData.specifications;

  const specLabels = {
    'raw_material': 'Raw Material',
    'capacity_ml': 'Capacity (ml)',
    'weight_g': 'Weight (g)',
    'open_size_mm': 'Open Size (mm)',
    'fold_size_mm': 'Fold Size (mm)'
  };

  let tableHTML = '<div class="overflow-x-auto"><table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">';
  tableHTML += '<thead><tr class="bg-gray-100">';
  tableHTML += '<th class="border border-gray-300 px-6 py-3 text-left font-bold text-[var(--color-text)]">Specification</th>';
  tableHTML += '<th class="border border-gray-300 px-6 py-3 text-left font-bold text-[var(--color-text)]">Value</th>';
  tableHTML += '</tr></thead><tbody>';

  Object.keys(specs).forEach((key, index) => {
    const label = specLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const value = specs[key];
    const rowClass = index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100';

    tableHTML += `<tr class="${rowClass}">`;
    tableHTML += `<td class="border border-gray-300 px-6 py-3 font-semibold text-[var(--color-text)]">${label}</td>`;
    tableHTML += `<td class="border border-gray-300 px-6 py-3 text-[var(--color-text)]">${value}</td>`;
    tableHTML += '</tr>';
  });

  tableHTML += '</tbody></table></div>';

  detailedInfoContainer.innerHTML = tableHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProduct);
} else {
  loadProduct();
}
