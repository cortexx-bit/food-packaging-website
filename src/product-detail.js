let currentImageIndex = 0;
let productData = null;
let galleryImages = [];
let fancyboxInstance = null;
let mainImageClickHandlerAdded = false;


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
  setupFancybox();
  displaySpecifications();
}

function updateMainImage() {
  const mainImage = document.getElementById('main-product-image');
  const mainImageLink = document.getElementById('main-image-link');
  
  if (galleryImages.length > 0) {
    const currentImage = galleryImages[currentImageIndex];
    mainImage.src = currentImage;
    mainImage.alt = `${productData.name} - Image ${currentImageIndex + 1}`;
    
    if (mainImageLink) {
      mainImageLink.href = currentImage;
      mainImageLink.setAttribute('data-caption', `${productData.name} - Image ${currentImageIndex + 1}`);
    }
  }
  
  updateThumbnailActiveState();
  updateArrowStates();
}

function setupFancybox() {

  if (fancyboxInstance) {
    fancyboxInstance.destroy();
  }
  
  // Create hidden links for all gallery images
  createFancyboxGalleryLinks();
  
  fancyboxInstance = Fancybox.bind('[data-fancybox="product-gallery"]', {
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: [],
        right: ['slideshow', 'download', 'thumbs', 'close']
      }
    },
    Thumbs: {
      autoStart: true,
      axis: 'x'
    },
    Images: {
      zoom: {
        maxRatio: 1.5  // Reduced zoom level (1.5x = 150% zoom)
      },
      wheel: 'slide'
    },
    Carousel: {
      infinite: true
    },
    on: {
      ready: (fancybox, slide) => {
        // Set initial slide based on currentImageIndex when opening
        if (slide) {
          currentImageIndex = slide.index;
          updateMainImage();
        }
      },
      change: (fancybox, carousel, slide) => {
        // Sync currentImageIndex when navigating in Fancybox
        if (slide) {
          currentImageIndex = slide.index;
          updateMainImage();
        }
      }
    }
  });
  
  if (!mainImageClickHandlerAdded) {
    const mainImageLink = document.getElementById('main-image-link');
    if (mainImageLink) {
      mainImageLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Find the gallery link at currentImageIndex and click it
        const galleryLinks = document.querySelectorAll('[data-fancybox="product-gallery"]');
        const targetLink = Array.from(galleryLinks).find(link => {
          const linkIndex = parseInt(link.getAttribute('data-gallery-index'));
          return linkIndex === currentImageIndex;
        }) || galleryLinks[currentImageIndex] || galleryLinks[0];
        
        if (targetLink) {
          targetLink.click();
        }
      });
      mainImageClickHandlerAdded = true;
    }
  }
}

function createFancyboxGalleryLinks() {
  const existingLinks = document.querySelectorAll('[data-fancybox="product-gallery"]');
  existingLinks.forEach(link => link.remove());
  
  galleryImages.forEach((image, index) => {
    const link = document.createElement('a');
    link.href = image;
    link.setAttribute('data-fancybox', 'product-gallery');
    link.setAttribute('data-caption', `${productData.name} - Image ${index + 1}`);
    link.style.display = 'none';
    link.setAttribute('data-gallery-index', index);
    document.body.appendChild(link);
  });
  
  if (fancyboxInstance) {
    setupFancybox();
  }
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
      if (fancyboxInstance) {
        if (fancyboxInstance.isVisible) {
          fancyboxInstance.jumpTo(index);
        } else {
          const galleryLinks = document.querySelectorAll('[data-fancybox="product-gallery"]');
          if (galleryLinks[index]) {
            galleryLinks[index].click();
          }
        }
      } else {
        const mainImageLink = document.getElementById('main-image-link');
        if (mainImageLink) {
          mainImageLink.click();
        }
      }
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
  
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('product-detail').classList.contains('hidden')) return;
    
    if (fancyboxInstance && fancyboxInstance.isVisible) return;
    
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

