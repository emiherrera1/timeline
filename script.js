// Performance-optimized Timeline Scroll Interactions
class TimelineScroll {
    constructor() {
        this.timelineSections = document.querySelectorAll('.timeline-section');
        this.progressBar = document.querySelector('.progress-bar');
        this.isScrolling = false;
        this.animationFrameId = null;
        this.init();
    }

    init() {
        this.setupScrollListener();
        this.setupIntersectionObserver();
    }

    setupScrollListener() {
        // Throttled scroll listener for better performance
        let ticking = false;
        
        const updateProgress = () => {
            if (!this.isScrolling) return;
            
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
            
            this.progressBar.style.width = scrollPercent + '%';
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                this.animationFrameId = requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };

        // Use passive listeners for better performance
        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Track scroll state for performance
        window.addEventListener('scroll', () => {
            this.isScrolling = true;
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 150);
        }, { passive: true });
    }

    setupIntersectionObserver() {
        // Optimized intersection observer with better performance
        const observerOptions = {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    entry.target.classList.add('visible');
                    this.animateMarker(entry.target);
                }
            });
        }, observerOptions);

        this.timelineSections.forEach(section => {
            observer.observe(section);
        });
    }

    animateMarker(section) {
        const marker = section.querySelector('.marker-dot');
        if (marker && !marker.classList.contains('animated')) {
            marker.classList.add('animated');
            marker.style.transform = 'scale(1.2)';
            marker.style.boxShadow = '0 0 20px rgba(0, 212, 170, 0.5)';
            
            setTimeout(() => {
                marker.style.transform = 'scale(1)';
                marker.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                marker.classList.remove('animated');
            }, 300);
        }
    }

    // Cleanup method for performance
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }
}

// Performance-optimized Timeline Controller
class TimelineController {
    constructor() {
        this.events = document.querySelectorAll('.event');
        this.timelineSections = document.querySelectorAll('.timeline-section');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.subcategoryButtons = document.querySelectorAll('.subcategory-btn');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.clearButton = document.getElementById('clearButton');
        
        this.currentFilter = 'all';
        this.currentSubcategory = null;
        this.currentSearchTerm = '';
        this.searchTimeout = null;
        this.filterTimeout = null;
        
        // Debounced methods for better performance
        this.debouncedSearch = this.debounce(this.performSearch.bind(this), 150);
        this.debouncedFilter = this.debounce(this.applyAllFilters.bind(this), 100);
        
        this.init();
    }

    init() {
        this.setupSearchListeners();
        this.setupFilterListeners();
        this.setupSubcategoryListeners();
        this.setupClickOutsideListener();
        this.preloadEventData();
    }

    // Debounce utility for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Preload event data for faster filtering
    preloadEventData() {
        this.eventData = new Map();
        this.events.forEach(event => {
            const title = event.querySelector('h3').textContent;
            const description = event.querySelector('p').textContent;
            const year = event.querySelector('.event-year').textContent;
            const categoryTags = Array.from(event.querySelectorAll('.category-tag')).map(tag => tag.textContent).join(' ');
            const subcategoryTags = Array.from(event.querySelectorAll('.subcategory-tag')).map(tag => tag.textContent).join(' ');
            
            this.eventData.set(event, {
                text: `${title} ${description} ${year} ${categoryTags} ${subcategoryTags}`.toLowerCase(),
                category: event.dataset.category,
                subcategory: event.dataset.subcategory
            });
        });
    }

    setupSearchListeners() {
        // Debounced real-time search
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearchTerm = e.target.value;
            this.debouncedSearch();
        });

        // Search on Enter key
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.currentSearchTerm = e.target.value;
                this.performSearch();
            }
        });

        // Search button
        this.searchButton.addEventListener('click', () => {
            this.currentSearchTerm = this.searchInput.value;
            this.performSearch();
        });

        // Clear button
        this.clearButton.addEventListener('click', () => {
            this.currentSearchTerm = '';
            this.searchInput.value = '';
            this.currentFilter = 'all';
            this.currentSubcategory = null;
            this.resetAllButtons();
            this.applyAllFilters();
        });
    }

    setupFilterListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                
                if (filter === 'all') {
                    this.currentFilter = 'all';
                    this.currentSubcategory = null;
                    this.hideAllSubcategories();
                } else if (filter === 'founder' || filter === 'regulation') {
                    // Toggle subcategory if clicking the same filter
                    if (this.currentFilter === filter) {
                        const subcategoryContainer = document.getElementById(`${filter}-subcategories`);
                        if (subcategoryContainer.classList.contains('show')) {
                            // Close subcategories
                            this.currentSubcategory = null;
                            this.hideAllSubcategories();
                            this.updateSubcategoryButtons();
                        } else {
                            // Open subcategories
                            subcategoryContainer.classList.add('show');
                        }
                        this.debouncedFilter();
                        return;
                    }
                    
                    this.currentFilter = filter;
                    this.currentSubcategory = null;
                    this.hideAllSubcategories();
                    const subcategoryContainer = document.getElementById(`${filter}-subcategories`);
                    if (subcategoryContainer) {
                        subcategoryContainer.classList.add('show');
                    }
                }
                
                this.updateFilterButtons();
                this.debouncedFilter();
            });
        });
    }

    setupSubcategoryListeners() {
        this.subcategoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentSubcategory = e.target.dataset.filter;
                this.updateSubcategoryButtons();
                this.debouncedFilter();
            });
        });
    }

    setupClickOutsideListener() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-group') && !e.target.closest('.search-container')) {
                this.hideAllSubcategories();
            }
        });
    }

    performSearch() {
        this.applyAllFilters();
    }

    applyAllFilters() {
        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => {
            this.events.forEach(event => {
                const matchesSearch = this.matchesSearch(event);
                const matchesFilter = this.matchesFilter(event);
                
                if (matchesSearch && matchesFilter) {
                    this.showEvent(event);
                    if (this.currentSearchTerm) {
                        this.highlightSearchTerm(event, this.currentSearchTerm);
                    } else {
                        this.removeHighlights(event);
                    }
                } else {
                    this.hideEvent(event);
                }
            });

            // Update section visibility with delay for smooth transitions
            setTimeout(() => this.updateSectionVisibility(), 200);
        });
    }

    showEvent(event) {
        event.style.display = 'flex';
        event.style.opacity = '1';
        event.style.transform = 'translateY(0)';
    }

    hideEvent(event) {
        event.style.opacity = '0';
        event.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (event.style.opacity === '0') {
                event.style.display = 'none';
            }
        }, 300);
    }

    matchesSearch(event) {
        if (!this.currentSearchTerm) return true;
        
        const eventData = this.eventData.get(event);
        return eventData.text.includes(this.currentSearchTerm.toLowerCase());
    }

    matchesFilter(event) {
        if (this.currentFilter === 'all') return true;
        
        const eventData = this.eventData.get(event);
        
        if (eventData.category !== this.currentFilter) return false;
        
        if (this.currentSubcategory) {
            return eventData.subcategory === this.currentSubcategory;
        }
        
        return true;
    }

    highlightSearchTerm(event, searchTerm) {
        // Remove existing highlights
        this.removeHighlights(event);

        // Add new highlights with performance optimization
        const title = event.querySelector('h3');
        const description = event.querySelector('p');
        
        this.highlightText(title, searchTerm);
        this.highlightText(description, searchTerm);
    }

    highlightText(element, searchTerm) {
        const text = element.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = text.replace(regex, '<span class="search-highlight">$1</span>');
        element.innerHTML = highlightedText;
    }

    removeHighlights(event) {
        const highlights = event.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    updateFilterButtons() {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-filter="${this.currentFilter}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    updateSubcategoryButtons() {
        this.subcategoryButtons.forEach(btn => btn.classList.remove('active'));
        const activeSubButton = document.querySelector(`[data-filter="${this.currentSubcategory}"]`);
        if (activeSubButton) {
            activeSubButton.classList.add('active');
        }
    }

    resetAllButtons() {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        this.subcategoryButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
    }

    hideAllSubcategories() {
        document.querySelectorAll('.subcategory-buttons').forEach(container => {
            container.classList.remove('show');
        });
    }

    updateSectionVisibility() {
        this.timelineSections.forEach(section => {
            const events = section.querySelectorAll('.event');
            const visibleEvents = Array.from(events).filter(event => 
                event.style.display !== 'none' && event.style.opacity !== '0'
            );
            
            if (visibleEvents.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class for smooth initial load
    document.body.classList.add('loading');
    
    // Initialize components
    const timelineScroll = new TimelineScroll();
    const timelineController = new TimelineController();
    
    // Remove loading class after initialization
    requestAnimationFrame(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        timelineScroll.destroy();
    });
});
