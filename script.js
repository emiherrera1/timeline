// Timeline Scroll Interactions
class TimelineScroll {
    constructor() {
        this.timelineSections = document.querySelectorAll('.timeline-section');
        this.progressBar = document.querySelector('.progress-bar');
        this.init();
    }

    init() {
        this.setupClickOutsideListener();
        this.setupScrollListener();
        this.setupIntersectionObserver();
    }

    setupScrollListener() {
        let ticking = false;
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            this.progressBar.style.width = scrollPercent + '%';
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
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
        if (marker) {
            marker.style.transform = 'scale(1.2)';
            marker.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.5)';
            
            setTimeout(() => {
                marker.style.transform = 'scale(1)';
                marker.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }, 300);
        }
    }
}

// Main Timeline Controller
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
        
        this.init();
    }

    init() {
        this.setupClickOutsideListener();
        this.setupSearchListeners();
        this.setupFilterListeners();
        this.setupSubcategoryListeners();
    }

    setupSearchListeners() {
        // Real-time search as you type
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearchTerm = e.target.value;
            this.applyAllFilters();
        });

        // Search on Enter key
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.currentSearchTerm = e.target.value;
                this.applyAllFilters();
            }
        });

        // Search button
        this.searchButton.addEventListener('click', () => {
            this.currentSearchTerm = this.searchInput.value;
            this.applyAllFilters();
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
                        this.currentSubcategory = null;
                        this.hideAllSubcategories();
                        this.updateSubcategoryButtons();
                        this.applyAllFilters();
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
                this.applyAllFilters();
            });
        });
    }

    setupClickOutsideListener() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-group') setupSubcategoryListeners() {setupSubcategoryListeners() { !e.target.closest('.search-container')) {
                this.hideAllSubcategories();
            }
        });
    }

    setupSubcategoryListeners() {
        this.subcategoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentSubcategory = e.target.dataset.filter;
                this.updateSubcategoryButtons();
                this.applyAllFilters();
            });
        });
    }

    applyAllFilters() {
        this.events.forEach(event => {
            const matchesSearch = this.matchesSearch(event);
            const matchesFilter = this.matchesFilter(event);
            
            if (matchesSearch && matchesFilter) {
                event.style.display = 'flex';
                event.style.opacity = '1';
                if (this.currentSearchTerm) {
                    this.highlightSearchTerm(event, this.currentSearchTerm);
                } else {
                    this.removeHighlights(event);
                }
            } else {
                event.style.opacity = '0';
                setTimeout(() => {
                    event.style.display = 'none';
                }, 300);
            }
        });

        // Update section visibility
        setTimeout(() => this.updateSectionVisibility(), 350);
    }

    matchesSearch(event) {
        if (!this.currentSearchTerm) return true;
        
        const eventText = this.getEventText(event).toLowerCase();
        return eventText.includes(this.currentSearchTerm.toLowerCase());
    }

    matchesFilter(event) {
        if (this.currentFilter === 'all') return true;
        
        const eventCategory = event.dataset.category;
        const eventSubcategory = event.dataset.subcategory;
        
        if (eventCategory !== this.currentFilter) return false;
        
        if (this.currentSubcategory) {
            return eventSubcategory === this.currentSubcategory;
        }
        
        return true;
    }

    getEventText(event) {
        const title = event.querySelector('h3').textContent;
        const description = event.querySelector('p').textContent;
        const year = event.querySelector('.event-year').textContent;
        const categoryTags = Array.from(event.querySelectorAll('.category-tag')).map(tag => tag.textContent).join(' ');
        const subcategoryTags = Array.from(event.querySelectorAll('.subcategory-tag')).map(tag => tag.textContent).join(' ');
        
        return `${title} ${description} ${year} ${categoryTags} ${subcategoryTags}`;
    }

    highlightSearchTerm(event, searchTerm) {
        // Remove existing highlights
        this.removeHighlights(event);

        // Add new highlights
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
    new TimelineScroll();
    new TimelineController();
});
