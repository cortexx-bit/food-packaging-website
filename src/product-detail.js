let currentImageIndex = 0;
let productData = null;
let galleryImages = [];
let categoriesData = null;
let fancyboxInstance = null;

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

  const breadcrumb = document.getElementById('breadcrumb');
  const breadcrumbProductName = document.getElementById('breadcrumb-product-name');
  if (breadcrumb && breadcrumbProductName) {
    breadcrumbProductName.textContent = productData.name;
    breadcrumb.classList.remove('hidden');
  }

  document.getElementById('product-name').textContent = productData.name;
  document.getElementById('product-sku').textContent = productData.sku;
  document.getElementById('product-description').textContent = productData.full_description;

  const requestQuoteBtn = document.getElementById('request-quote-btn');
  if (requestQuoteBtn) {
    requestQuoteBtn.href = `/contact.html?sku=${encodeURIComponent(productData.sku)}`;
  }

  const requestSampleBtn = document.getElementById('request-sample-btn');
  if (requestSampleBtn) {
    requestSampleBtn.href = `/contact.html?sku=${encodeURIComponent(productData.sku)}&sample=true`;
  }

  displayCategories();

  galleryImages = productData.images?.gallery_images || [];
  
  if (galleryImages.length === 0 && productData.gallery_images) {
    galleryImages = productData.gallery_images.map((src, index) => ({
      src: src,
      alt: `${productData.name} - Image ${index + 1}`
    }));
  }
  
  if (galleryImages.length === 0 && productData.card_image) {
    galleryImages = [{
      src: productData.card_image,
      alt: productData.name
    }];
  }
  
  currentImageIndex = 0;

  updateMainImage();
  createThumbnails();
  createFancyboxGallery();
  initializeFancybox();
  displaySpecifications();
}

function updateMainImage() {
  const mainImage = document.getElementById('main-product-image');
  const mainImageLink = document.getElementById('main-image-link');

  if (galleryImages.length > 0) {
    const currentImageData = galleryImages[currentImageIndex];
    const imageSrc = currentImageData.src || currentImageData;
    const imageAlt = currentImageData.alt || `${productData.name} - Image ${currentImageIndex + 1}`;
    
    // Add error handler for main image
    mainImage.onerror = function() {
      console.error('Failed to load image:', imageSrc);
      this.src = '/img/box.png';
    };
    
    mainImage.src = imageSrc;
    mainImage.alt = imageAlt;

    if (mainImageLink) {
      mainImageLink.href = imageSrc;
      mainImageLink.setAttribute('data-caption', imageAlt);
    }
  }

  updateThumbnailActiveState();
}

function createThumbnails() {
  const container = document.getElementById('thumbnail-container');
  container.innerHTML = '';

  galleryImages.forEach((imageData, index) => {
    const imageSrc = imageData.src || imageData;
    const imageAlt = imageData.alt || `${productData.name} - Thumbnail ${index + 1}`;
    
    const thumbnail = document.createElement('button');
    thumbnail.className = `thumbnail w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-2 shadow-md'
      : 'border-gray-200 hover:border-gray-300'
      }`;
    thumbnail.setAttribute('data-thumb-index', index);
    thumbnail.addEventListener('click', () => {
      currentImageIndex = index;
      updateMainImage();
      if (fancyboxInstance && fancyboxInstance.isVisible) {
        fancyboxInstance.jumpTo(index);
      }
    });

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageAlt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'w-full h-full object-cover';
    img.onerror = function () {
      console.error('Failed to load image:', imageSrc);
      this.src = '/img/box.png';
    };

    thumbnail.appendChild(img);
    container.appendChild(thumbnail);
  });
}

function updateThumbnailActiveState() {
  const thumbnails = document.querySelectorAll('.thumbnail');
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

function createFancyboxGallery() {
  const existingLinks = document.querySelectorAll('[data-fancybox="product-gallery"]');
  existingLinks.forEach(link => {
    if (link.id !== 'main-image-link') {
      link.remove();
    }
  });

  galleryImages.forEach((imageData, index) => {
    const imageSrc = imageData.src || imageData;
    const imageAlt = imageData.alt || `${productData.name} - Image ${index + 1}`;
    
    const link = document.createElement('a');
    link.href = imageSrc;
    link.setAttribute('data-fancybox', 'product-gallery');
    link.setAttribute('data-caption', imageAlt);
    link.setAttribute('data-thumb', imageSrc);
    link.style.display = 'none';
    link.setAttribute('data-gallery-index', index);
    document.body.appendChild(link);
  });
}

function initializeFancybox(attempts = 0) {
  const MAX_ATTEMPTS = 50; // 5 seconds max wait
  
  if (typeof Fancybox === 'undefined') {
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(() => initializeFancybox(attempts + 1), 100);
    } else {
      console.error('Fancybox failed to load after 5 seconds');
    }
    return;
  }

  if (fancyboxInstance) {
    fancyboxInstance.destroy();
  }

  fancyboxInstance = Fancybox.bind('[data-fancybox="product-gallery"]', {
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: [],
        right: ['slideshow', 'thumbs', 'close']
      }
    },
    Thumbs: {
      autoStart: window.innerWidth > 1024,
      axis: 'x'
    },
    Images: {
      zoom: true,
      wheel: 'slide',
      preload: [1, 1]
    },
    Carousel: {
      infinite: true,
      friction: 0.8,
      Navigation: {
        prevTpl: '<button class="fancybox__nav fancybox__nav--prev" aria-label="Previous"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>',
        nextTpl: '<button class="fancybox__nav fancybox__nav--next" aria-label="Next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>'
      }
    },
    Touch: {
      vertical: false,
      momentum: true
    },
    on: {
      ready: (fancybox, slide) => {
        if (slide) {
          currentImageIndex = slide.index;
          updateMainImage();
        }
      },
      change: (fancybox, carousel, slide) => {
        if (slide) {
          currentImageIndex = slide.index;
          updateMainImage();
        }
      }
    }
  });

  const mainImageLink = document.getElementById('main-image-link');
  if (mainImageLink) {
    mainImageLink.addEventListener('click', (e) => {
      e.preventDefault();
      const galleryLinks = document.querySelectorAll('[data-fancybox="product-gallery"]');
      const targetLink = Array.from(galleryLinks).find(link => {
        const linkIndex = parseInt(link.getAttribute('data-gallery-index'));
        return linkIndex === currentImageIndex;
      }) || galleryLinks[currentImageIndex] || galleryLinks[0];

      if (targetLink) {
        targetLink.click();
      }
    });
  }
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

// Add cleanup function and call on page unload
function cleanupGallery() {
  const hiddenLinks = document.querySelectorAll('[data-fancybox="product-gallery"][data-gallery-index]');
  hiddenLinks.forEach(link => link.remove());
  
  if (fancyboxInstance) {
    fancyboxInstance.destroy();
    fancyboxInstance = null;
  }
}

window.addEventListener('beforeunload', cleanupGallery);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProduct);
} else {
  loadProduct();
}
