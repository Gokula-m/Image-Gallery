class ImageGallery {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentImageIndex = 0;
        this.currentCategory = 'all';
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadImages();
    }

    initializeElements() {
        // Gallery elements
        this.galleryGrid = document.getElementById('galleryGrid');
        this.loading = document.getElementById('loading');
        this.emptyState = document.getElementById('emptyState');
        this.errorState = document.getElementById('errorState');
        
        // Filter elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Lightbox elements
        this.lightbox = document.getElementById('lightbox');
        this.lightboxOverlay = document.getElementById('lightboxOverlay');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxClose = document.getElementById('lightboxClose');
        this.lightboxPrev = document.getElementById('lightboxPrev');
        this.lightboxNext = document.getElementById('lightboxNext');
        this.lightboxTitle = document.getElementById('lightboxTitle');
        this.lightboxCategory = document.getElementById('lightboxCategory');
        this.lightboxCounter = document.getElementById('lightboxCounter');
        this.lightboxLoading = document.querySelector('.lightbox-loading');
    }

    bindEvents() {
        // Filter button events
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterImages(e.target.dataset.category);
            });
        });

        // Lightbox events
        this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        this.lightboxOverlay.addEventListener('click', () => this.closeLightbox());
        this.lightboxPrev.addEventListener('click', () => this.showPreviousImage());
        this.lightboxNext.addEventListener('click', () => this.showNextImage());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.classList.contains('show')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.showPreviousImage();
                        break;
                    case 'ArrowRight':
                        this.showNextImage();
                        break;
                }
            }
        });

        // Touch events for mobile swipe
        this.lightbox.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });

        this.lightbox.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        // Prevent scrolling when lightbox is open
        this.lightbox.addEventListener('wheel', (e) => {
            e.preventDefault();
        });
    }

    async loadImages() {
        try {
            this.showLoading();
            
            // Use the gallery data from the external file
            if (typeof galleryData !== 'undefined') {
                this.images = galleryData;
                this.filteredImages = [...this.images];
                this.renderGallery();
                this.hideLoading();
            } else {
                throw new Error('Gallery data not found');
            }
        } catch (error) {
            console.error('Error loading images:', error);
            this.showError();
        }
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.galleryGrid.style.display = 'none';
        this.emptyState.style.display = 'none';
        this.errorState.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.galleryGrid.style.display = 'grid';
    }

    showError() {
        this.loading.style.display = 'none';
        this.galleryGrid.style.display = 'none';
        this.emptyState.style.display = 'none';
        this.errorState.style.display = 'block';
    }

    showEmpty() {
        this.loading.style.display = 'none';
        this.galleryGrid.style.display = 'none';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'block';
    }

    renderGallery() {
        if (this.filteredImages.length === 0) {
            this.showEmpty();
            return;
        }

        this.galleryGrid.innerHTML = '';
        
        this.filteredImages.forEach((image, index) => {
            const galleryItem = this.createGalleryItem(image, index);
            this.galleryGrid.appendChild(galleryItem);
        });

        this.hideLoading();
    }

    createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;
        
        const img = document.createElement('img');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'gallery-item-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        
        const overlay = document.createElement('div');
        overlay.className = 'gallery-item-overlay';
        overlay.innerHTML = `
            <div class="gallery-item-title">${image.title}</div>
            <div class="gallery-item-category">${image.category}</div>
        `;
        
        item.appendChild(loadingDiv);
        item.appendChild(img);
        item.appendChild(overlay);
        
        // Handle image loading
        img.onload = () => {
            loadingDiv.style.display = 'none';
            img.style.opacity = '1';
        };
        
        img.onerror = () => {
            loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Failed to load</p>';
        };
        
        img.src = image.url;
        img.alt = image.title;
        
        // Add click event to open lightbox
        item.addEventListener('click', () => {
            this.openLightbox(index);
        });
        
        return item;
    }

    filterImages(category) {
        this.currentCategory = category;
        
        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        // Filter images
        if (category === 'all') {
            this.filteredImages = [...this.images];
        } else {
            this.filteredImages = this.images.filter(img => img.category === category);
        }
        
        // Animate out current items
        const currentItems = document.querySelectorAll('.gallery-item');
        currentItems.forEach(item => {
            item.classList.add('hidden');
        });
        
        // Re-render gallery after animation
        setTimeout(() => {
            this.renderGallery();
        }, 300);
    }

    openLightbox(index) {
        this.currentImageIndex = index;
        this.lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        this.updateLightboxImage();
        this.updateNavigationButtons();
        this.updateLightboxInfo();
    }

    closeLightbox() {
        this.lightbox.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateLightboxImage();
            this.updateNavigationButtons();
            this.updateLightboxInfo();
        }
    }

    showNextImage() {
        if (this.currentImageIndex < this.filteredImages.length - 1) {
            this.currentImageIndex++;
            this.updateLightboxImage();
            this.updateNavigationButtons();
            this.updateLightboxInfo();
        }
    }

    updateLightboxImage() {
        const image = this.filteredImages[this.currentImageIndex];
        
        // Show loading state
        this.lightboxLoading.style.display = 'block';
        this.lightboxImage.style.opacity = '0';
        
        // Create new image to preload
        const img = new Image();
        
        img.onload = () => {
            this.lightboxImage.src = img.src;
            this.lightboxImage.style.opacity = '1';
            this.lightboxLoading.style.display = 'none';
        };
        
        img.onerror = () => {
            this.lightboxLoading.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Failed to load image</p>';
        };
        
        img.src = image.url;
    }

    updateNavigationButtons() {
        this.lightboxPrev.disabled = this.currentImageIndex === 0;
        this.lightboxNext.disabled = this.currentImageIndex === this.filteredImages.length - 1;
    }

    updateLightboxInfo() {
        const image = this.filteredImages[this.currentImageIndex];
        this.lightboxTitle.textContent = image.title;
        this.lightboxCategory.textContent = image.category;
        this.lightboxCounter.textContent = `${this.currentImageIndex + 1} of ${this.filteredImages.length}`;
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const swipeLength = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeLength) > swipeThreshold) {
            if (swipeLength > 0) {
                // Swipe right - show previous
                this.showPreviousImage();
            } else {
                // Swipe left - show next
                this.showNextImage();
            }
        }
    }
}

// Initialize the gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        // Force recalculation of grid layout
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            galleryGrid.style.display = 'none';
            galleryGrid.offsetHeight; // Trigger reflow
            galleryGrid.style.display = 'grid';
        }
    }, 250);
});

// Intersection Observer for lazy loading animation
const observeGalleryItems = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0s';
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Observe gallery items as they're added
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('gallery-item')) {
                        observer.observe(node);
                    }
                });
            });
        });

        mutationObserver.observe(galleryGrid, { childList: true });
    }
};

// Initialize intersection observer
document.addEventListener('DOMContentLoaded', observeGalleryItems);
