// Timeline Scroll Interactions
class TimelineScroll {
    constructor() {
        this.timelineSections = document.querySelectorAll('.timeline-section');
        this.progressBar = document.querySelector('.progress-bar');
        this.init();
    }

    init() {
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

// Filter functionality with horizontal subcategories
class TimelineFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.subcategoryButtons = document.querySelectorAll('.subcategory-btn');
        this.events = document.querySelectorAll('.event');
        this.timelineSections = document.querySelectorAll('.timeline-section');
        this.currentFilter = 'all';
        this.currentSubcategory = null;
        this.init();
    }

    init() {
        this.setupMainFilterListeners();
        this.setupSubcategoryListeners();
    }

    setupMainFilterListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                
                if (filter === 'all') {
                    this.handleAllFilter();
                } else if (filter === 'founder' || filter === 'regulation') {
                    this.handleMainFilter(e.target, filter);
                }
            });
        });
    }

    setupSubcategoryListeners() {
        this.subcategoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const subcategory = e.target.dataset.filter;
                this.handleSubcategoryFilter(e.target, subcategory);
            });
        });
    }

    handleAllFilter() {
        // Reset all filters
        this.currentFilter = 'all';
        this.currentSubcategory = null;
        
        // Update button states
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        this.subcategoryButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        
        // Hide all subcategories
        this.hideAllSubcategories();
        
        // Show all events
        this.showAllEvents();
    }

    handleMainFilter(button, filter) {
        // Update main filter state
        this.currentFilter = filter;
        this.currentSubcategory = null;
        
        // Update button states
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        this.subcategoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show/hide subcategories
        this.hideAllSubcategories();
        const subcategoryContainer = document.getElementById(`${filter}-subcategories`);
        if (subcategoryContainer) {
            subcategoryContainer.classList.add('show');
        }
        
        // Show events for this main category
        this.filterEvents(filter);
    }

    handleSubcategoryFilter(button, subcategory) {
        // Update subcategory state
        this.currentSubcategory = subcategory;
        
        // Update button states
        this.subcategoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter events by subcategory
        this.filterEvents(this.currentFilter, subcategory);
    }

    hideAllSubcategories() {
        document.querySelectorAll('.subcategory-buttons').forEach(container => {
            container.classList.remove('show');
        });
    }

    showAllEvents() {
        this.events.forEach(event => {
            event.style.display = 'flex';
            event.style.opacity = '1';
        });
        
        this.timelineSections.forEach(section => {
            section.style.display = 'block';
        });
    }

    filterEvents(category, subcategory = null) {
        this.events.forEach(event => {
            const eventCategory = event.dataset.category;
            const eventSubcategory = event.dataset.subcategory;
            
            let shouldShow = false;
            
            if (category === 'all') {
                shouldShow = true;
            } else if (eventCategory === category) {
                if (subcategory) {
                    shouldShow = eventSubcategory === subcategory;
                } else {
                    shouldShow = true;
                }
            }
            
            if (shouldShow) {
                event.style.display = 'flex';
                event.style.opacity = '1';
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
    new TimelineFilter();
});
