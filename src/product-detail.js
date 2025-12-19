let currentImageIndex = 0;
let productData = null;
let galleryImages = [];


function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function loadProduct() {
  const productId = getProductId();
  
  if (!productId) {
    showNotFound();
    return;
  }

  try {
    const response = await fetch('/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const products = await response.json();
    productData = products.find(p => p.id === productId);
    
    if (!productData) {
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
  document.getElementById('product-not-found').classList.remove('hidden');
}

function displayProduct() {
  
  document.getElementById('product-loading').classList.add('hidden');
  document.getElementById('product-detail').classList.remove('hidden');
  
  document.title = `${productData.name} - KMZ-Packaging`;
  
  document.getElementById('product-name').textContent = productData.name;
  document.getElementById('product-sku').textContent = productData.sku;
  document.getElementById('product-description').textContent = productData.full_description;
  document.getElementById('product-size').textContent = productData.size;
  document.getElementById('product-material').textContent = productData.material;
  
  galleryImages = productData.gallery_images || [productData.card_image];
  currentImageIndex = 0;
  
  updateMainImage();
  createThumbnails();
  setupNavigation();
  setupImageZoom();
}

function updateMainImage() {
  const mainImage = document.getElementById('main-product-image');
  if (galleryImages.length > 0) {
    mainImage.src = galleryImages[currentImageIndex];
    mainImage.alt = `${productData.name} - Image ${currentImageIndex + 1}`;
  }
  
  updateThumbnailActiveState();
  updateArrowStates();
}

let zoomSetupDone = false;

function setupImageZoom() {
  if (zoomSetupDone) return;
  
  const imageContainer = document.querySelector('.relative.mb-4.max-w-lg');
  const mainImage = document.getElementById('main-product-image');
  
  if (!imageContainer || !mainImage) return;
  
  imageContainer.addEventListener('mousemove', (e) => {
    const rect = imageContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    mainImage.style.transformOrigin = `${x}% ${y}%`;
    mainImage.style.transform = 'scale(2)';
  });
  
  imageContainer.addEventListener('mouseleave', () => {
    mainImage.style.transform = 'scale(1)';
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProduct);
} else {
  loadProduct();
}

