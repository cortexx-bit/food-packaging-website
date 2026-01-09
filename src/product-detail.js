let currentImageIndex = 0;
let productData = null;
let galleryImages = [];


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
    const response = await fetch('/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const products = await response.json();
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
  
  document.getElementById('product-name').textContent = productData.name;
  document.getElementById('product-sku').textContent = productData.sku;
  document.getElementById('product-description').textContent = productData.full_description;
  
  galleryImages = productData.gallery_images || [productData.card_image];
  currentImageIndex = 0;
  
  updateMainImage();
  createThumbnails();
  setupNavigation();
  setupImageZoom();
  displaySpecifications();
}

function updateMainImage() {
  const mainImage = document.getElementById('main-product-image');
  if (galleryImages.length > 0) {
    mainImage.src = galleryImages[currentImageIndex];
    mainImage.alt = `${productData.name} - Image ${currentImageIndex + 1}`;
  }
  
  // Reset zoom when image changes
  if (isZoomed) {
    mainImage.style.transform = 'scale(1)';
    mainImage.style.transformOrigin = 'center center';
    isZoomed = false;
    const imageWrapper = document.querySelector('.relative.mb-4.max-w-lg .aspect-square');
    if (imageWrapper) {
      imageWrapper.style.cursor = 'pointer';
    }
  }
  
  updateThumbnailActiveState();
  updateArrowStates();
}

let zoomSetupDone = false;
let isZoomed = false;

function setupImageZoom() {
  if (zoomSetupDone) return;
  
  const imageContainer = document.querySelector('.relative.mb-4.max-w-lg');
  const imageWrapper = imageContainer?.querySelector('.aspect-square');
  const mainImage = document.getElementById('main-product-image');
  
  if (!imageContainer || !imageWrapper || !mainImage) return;
  
  imageWrapper.addEventListener('click', (e) => {
    if (isZoomed) {
      // Unzoom
      mainImage.style.transform = 'scale(1)';
      mainImage.style.transformOrigin = 'center center';
      isZoomed = false;
      imageWrapper.style.cursor = 'pointer';
    } else {
      // Zoom in
      const rect = imageWrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      mainImage.style.transformOrigin = `${x}% ${y}%`;
      mainImage.style.transform = 'scale(2)';
      isZoomed = true;
      imageWrapper.style.cursor = 'zoom-out';
    }
  });
  
  zoomSetupDone = true;
}

function createThumbnails() {
  const container = document.getElementById('thumbnail-container');
  container.innerHTML = '';
  
  galleryImages.forEach((image, index) => {
    const thumbnail = document.createElement('button');
    thumbnail.className = `w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
      index === currentImageIndex 
        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-2 shadow-md' 
        : 'border-gray-200 hover:border-gray-300'
    }`;
    thumbnail.addEventListener('click', () => {
      currentImageIndex = index;
      updateMainImage();
    });
    
    const img = document.createElement('img');
    img.src = image;
    img.alt = `Thumbnail ${index + 1}`;
    img.className = 'w-full h-full object-cover';
    img.onerror = function() {
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
  
  prevBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateMainImage();
  });
  
  nextBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateMainImage();
  });
  
  // Keyboard navigation
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

