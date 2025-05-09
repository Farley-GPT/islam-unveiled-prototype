// js/app_core.js

const AppCore = (() => {
    // --- THEME TOGGLE LOGIC ---
    function applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(theme);
        // Update icon
        const icon = document.getElementById('theme-toggle-icon');
        if (icon) {
            icon.textContent = theme === 'theme-dark' ? '🌙' : '☀️';
        }
    }
    function getSavedTheme() {
        return localStorage.getItem('iu_theme') || 'theme-dark';
    }
    function saveTheme(theme) {
        localStorage.setItem('iu_theme', theme);
    }
    function setupThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
            const next = current === 'theme-dark' ? 'theme-light' : 'theme-dark';
            applyTheme(next);
            saveTheme(next);
        });
    }
    function initializeTheme() {
        const theme = getSavedTheme();
        applyTheme(theme);
    }
    document.addEventListener('DOMContentLoaded', () => {
        initializeTheme();
        setupThemeToggle();
        // Go To Top button logic
        const goTopBtn = document.getElementById('go-to-top');
        const header = document.querySelector('header');
        let headerBottom = 0;
        function updateHeaderBottom() {
            if (header) {
                const rect = header.getBoundingClientRect();
                headerBottom = rect.bottom + window.scrollY;
            }
        }
        updateHeaderBottom();
        window.addEventListener('resize', updateHeaderBottom);
        window.addEventListener('scroll', () => {
            if (!goTopBtn) return;
            if (window.scrollY > headerBottom) {
                goTopBtn.classList.add('visible');
            } else {
                goTopBtn.classList.remove('visible');
            }
        });
        if (goTopBtn) {
            goTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });
    // --- State ---
    let currentView = 'home'; // or whatever the initial view is
    let currentSectionPath = null; // For book reader
    let bookStructureCache = null; // Cache book structure for reader navigation

    // --- DOM Elements ---
    const mainContentArea = document.getElementById('main-content-area');
    const mainNav = document.getElementById('main-nav');
    const disclaimerLink = document.getElementById('disclaimer-link');
    const genericModal = document.getElementById('generic-modal');
    const genericModalTitle = document.getElementById('generic-modal-title');
    const genericModalBody = document.getElementById('generic-modal-body');
    const sourceExplorerModal = document.getElementById('source-explorer-modal');
    const sourceExplorerModalTitle = document.getElementById('source-explorer-modal-title');
    const sourceExplorerModalBody = document.getElementById('source-explorer-modal-body');


    // --- Constants ---
    const APOLOGIST_TACTICS_INTRO_SECTION_PATH = "part_III_doctrinal_problems_contemporary_critique/chapter_10_addressing_apologetics/section_1_introduction_to_apologetics.json"; // Example path

    // --- Utility Functions ---
    function showLoading() {
        mainContentArea.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Loading content...</p>';
    }

    function updateActiveNavLink(targetView) {
        document.querySelectorAll('#main-nav .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.nav === targetView) {
                link.classList.add('active');
            }
        });
    }

    // --- Breadcrumbs ---
    function renderBreadcrumbs(viewName, sectionPath = null) {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (!breadcrumbs) return;
        let crumbs = [];
        // Always start with Home
        crumbs.push({ label: 'Home', view: 'home', href: '#', clickable: viewName !== 'home' });
        if (viewName === 'outline') {
            crumbs.push({ label: 'Book Outline', view: 'outline', href: '#', clickable: false });
        } else if (viewName === 'glossary') {
            crumbs.push({ label: 'Glossary', view: 'glossary', href: '#', clickable: false });
        } else if (viewName === 'tactics') {
            crumbs.push({ label: 'Apologist Tactics', view: 'tactics', href: '#', clickable: false });
        } else if (viewName === 'reader' && sectionPath) {
            crumbs.push({ label: 'Book Outline', view: 'outline', href: '#', clickable: true });
            // Section label: fallback to sectionPath, ideally use section title if available
            let sectionLabel = sectionPath.split('/').pop().replace('.json', '').replace(/_/g, ' ');
            sectionLabel = sectionLabel.charAt(0).toUpperCase() + sectionLabel.slice(1);
            crumbs.push({ label: sectionLabel, view: 'reader', href: '#', clickable: false });
        }
        // Render
        let html = '';
        crumbs.forEach((crumb, i) => {
            if (i > 0) html += '<span class="breadcrumb-sep">›</span>';
            if (crumb.clickable) {
                html += `<a href="#" class="breadcrumb-link" data-breadcrumb-view="${crumb.view}">${crumb.label}</a>`;
            } else {
                html += `<span class="breadcrumb-link" aria-current="page">${crumb.label}</span>`;
            }
        });
        breadcrumbs.innerHTML = html;
        // Add navigation for clickable crumbs
        breadcrumbs.querySelectorAll('.breadcrumb-link[data-breadcrumb-view]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const view = link.getAttribute('data-breadcrumb-view');
                if (view) {
                    AppCore.renderView(view);
                }
            });
        });
    }

    // --- Modal Management ---
    function showModal(modalId, title, contentHTML) {
        let modal, modalTitleEl, modalBodyEl;

        if (modalId === 'generic-modal') {
            modal = genericModal;
            modalTitleEl = genericModalTitle;
            modalBodyEl = genericModalBody;
        } else if (modalId === 'source-explorer-modal') {
            modal = sourceExplorerModal;
            modalTitleEl = sourceExplorerModalTitle;
            modalBodyEl = sourceExplorerModalBody;
        } else {
            console.error("Unknown modal ID:", modalId);
            return;
        }

        if (!modal || !modalTitleEl || !modalBodyEl) {
            console.error(`Modal elements not found for ${modalId}`);
            return;
        }

        modalTitleEl.textContent = title;
        modalBodyEl.innerHTML = contentHTML;
        modal.style.display = 'block';
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        } else {
            console.error("Attempted to close non-existent modal:", modalId);
        }
    }

    // --- View Rendering ---
    async function renderView(viewName, sectionPath = null) {
        renderBreadcrumbs(viewName, sectionPath);
        showLoading();
        currentView = viewName;
        currentSectionPath = sectionPath; // Store for book reader

        // Ensure book structure is loaded if not already, especially for reader
        if (!bookStructureCache) {
            try {
                bookStructureCache = await AppDataUI.loadBookStructure();
            } catch (error) {
                console.error("Failed to load book structure for rendering:", error);
                mainContentArea.innerHTML = `<p class="error-message">Core application data (book structure) could not be loaded. The application cannot continue.</p>`;
                return;
            }
        }

        updateActiveNavLink(viewName);
        window.scrollTo(0, 0); // Scroll to top on view change

        try {
            switch (viewName) {
                case 'home': {
                    const homeHTML = AppDataUI.getHomeScreenHTML(bookStructureCache);
                    mainContentArea.innerHTML = homeHTML;
                    break;
                }
                case 'mission': {
                    mainContentArea.innerHTML = `
                        <button id="back-to-home-btn" class="action-button" style="margin-bottom: 24px;">← Back to Home</button>
                        ${AppDataUI.getMissionStatementHTML()}
                    `;
                    const backBtn = document.getElementById('back-to-home-btn');
                    if (backBtn) backBtn.onclick = () => AppCore.renderView('home');
                    break;
                }
                case 'outline': {
                    const outlineHTML = AppDataUI.getBookOutlineHTML(bookStructureCache);
                    mainContentArea.innerHTML = outlineHTML;

                    function showBookSectionModalAtIndex(idx, bookStructureCache) {
                        const section = bookStructureCache.sections[idx];
                        if(section) {
                            // Set modal type flag to 'book'
                            window.currentModalType = 'book';

                            let navHTML = `<div class="book-modal-nav">`;
                            if(idx > 0) {
                                navHTML += `<button id="prev-section">Previous Section</button>`;
                            }
                            if(idx < bookStructureCache.sections.length - 1) {
                                navHTML += `<button id="next-section">Next Section</button>`;
                            }
                            navHTML += `</div>`;
                            const content = `<div class="book-modal-content">${section.content}</div>${navHTML}`;
                            AppCore.showModal('generic-modal', section.title, content);

                            // Remove any existing glossary or book keydown handler
                            if(window.currentGlossaryKeyHandler) {
                                document.removeEventListener('keydown', window.currentGlossaryKeyHandler, true);
                                window.currentGlossaryKeyHandler = null;
                            }
                            if(window.currentBookKeyHandler) {
                                document.removeEventListener('keydown', window.currentBookKeyHandler, true);
                                window.currentBookKeyHandler = null;
                            }

                            // Set up keydown listener for left/right arrows for book outline navigation
                            window.currentBookKeyHandler = function(e) {
                                // Only process if the current modal is a book modal
                                if(window.currentModalType !== 'book') return;
                                if(e.key === 'ArrowLeft' && idx > 0) {
                                    e.preventDefault();
                                    console.log('Book modal (capture): Left arrow pressed');
                                    document.removeEventListener('keydown', window.currentBookKeyHandler, true);
                                    showBookSectionModalAtIndex(idx - 1, bookStructureCache);
                                } else if(e.key === 'ArrowRight' && idx < bookStructureCache.sections.length - 1) {
                                    e.preventDefault();
                                    console.log('Book modal (capture): Right arrow pressed');
                                    document.removeEventListener('keydown', window.currentBookKeyHandler, true);
                                    showBookSectionModalAtIndex(idx + 1, bookStructureCache);
                                }
                            };
                            document.addEventListener('keydown', window.currentBookKeyHandler, true);

                            // Attach click events to navigation buttons
                            const prevBtn = document.getElementById('prev-section');
                            const nextBtn = document.getElementById('next-section');
                            if(prevBtn) {
                                prevBtn.addEventListener('click', () => {
                                    document.removeEventListener('keydown', window.currentBookKeyHandler, true);
                                    showBookSectionModalAtIndex(idx - 1, bookStructureCache);
                                });
                            }
                            if(nextBtn) {
                                nextBtn.addEventListener('click', () => {
                                    document.removeEventListener('keydown', window.currentBookKeyHandler, true);
                                    showBookSectionModalAtIndex(idx + 1, bookStructureCache);
                                });
                            }
                        }
                    }

                    // Attach click and keydown events to each book section
                    const sections = mainContentArea.querySelectorAll('.book-section');
                    sections.forEach(sectionEl => {
                        sectionEl.addEventListener('click', () => {
                            const idx = parseInt(sectionEl.getAttribute('data-index'), 10);
                            showBookSectionModalAtIndex(idx, bookStructureCache);
                        });
                        sectionEl.addEventListener('keydown', e => {
                            if(e.key === 'Enter' || e.key === ' ') {
                                const idx = parseInt(sectionEl.getAttribute('data-index'), 10);
                                showBookSectionModalAtIndex(idx, bookStructureCache);
                            }
                        });
                    });
                    break;
                }
                case 'glossary': {
                    const glossaryData = await AppDataUI.loadGlossary();
                    const glossaryHTML = AppDataUI.getGlossaryHTML(glossaryData);
                    mainContentArea.innerHTML = glossaryHTML;
                    // Add search functionality
                    const searchInput = document.getElementById('glossary-search');
                    if(searchInput) {
                       searchInput.addEventListener('input', function() {
                          const filter = this.value.toLowerCase();
                          document.querySelectorAll('.glossary-item').forEach(item => {
                              const term = item.querySelector('.glossary-term').textContent.toLowerCase();
                              item.style.display = term.includes(filter) ? "" : "none";
                          });
                       });
                    }
                    // Attach event listeners for glossary modal with navigation
                    const items = mainContentArea.querySelectorAll('.glossary-item');
                    function showGlossaryModalAtIndex(idx, glossaryData) {
                        const entry = glossaryData.terms[idx];
                        if (entry) {
                            // Remove any existing glossary key listener
                            if (window.currentGlossaryKeyHandler) {
                                document.removeEventListener('keydown', window.currentGlossaryKeyHandler, true);
                                window.currentGlossaryKeyHandler = null;
                            }
                            // Create simple content without Next/Previous buttons
                            const content = `<div class='glossary-modal-def'><p>${entry.definition.replace(/\n/g, '</p><p>')}</p></div>`;
                            AppCore.showModal('generic-modal', entry.term, content);
                        }
                    }
                    items.forEach(item => {
                        item.addEventListener('click', () => {
                            const idx = parseInt(item.getAttribute('data-index'), 10);
                            showGlossaryModalAtIndex(idx, glossaryData);
                        });
                        item.addEventListener('keydown', (e) => {
                            if(e.key === 'Enter' || e.key === ' ') {
                                const idx = parseInt(item.getAttribute('data-index'), 10);
                                showGlossaryModalAtIndex(idx, glossaryData);
                            }
                        });
                    });
                    break;
                }
                case 'settings': {
                    const currentFontSize = parseInt(window.getComputedStyle(document.body).fontSize);
                    const settingsHTML = `
                        <div class="settings-container">
                            <h2>Settings</h2>
                            <label for="font-size">Font Size:</label>
                            <input type="range" id="font-size" min="12" max="24" value="${currentFontSize}">
                            <p>Adjust the font size of the application.</p>
                        </div>
                    `;
                    mainContentArea.innerHTML = settingsHTML;
                    const fontSlider = document.getElementById('font-size');
                    if(fontSlider) {
                        fontSlider.addEventListener('input', (e) => {
                           document.body.style.fontSize = e.target.value + 'px';
                        });
                    }
                    break;
                }
                case 'tactics':
                    const tacticsData = await AppDataUI.loadApologistTactics();
                    const tacticsPageHTML = AppDataUI.getApologistTacticsPageHTML(tacticsData);
                    mainContentArea.innerHTML = tacticsPageHTML;
                    // Now, load and render the introduction content into the placeholder
                    const introWrapper = document.getElementById('apologist-tactics-intro-content-wrapper');
                    if (introWrapper) {
                        try {
                            const introContentData = await AppDataUI.loadSectionContent(APOLOGIST_TACTICS_INTRO_SECTION_PATH);
                            let introRenderedHTML = '';
                            if (introContentData && introContentData.content) {
                                introRenderedHTML = introContentData.content.map(item => AppDataUI.renderContentItem(item)).join('');
                            } else {
                                introRenderedHTML = "<p><em>Introduction content not found or is empty.</em></p>";
                            }
                            introWrapper.innerHTML = `<div class="tactics-introduction">${introRenderedHTML}</div>`;
                        } catch (introError) {
                            console.error("Error loading apologist tactics introduction:", introError);
                            introWrapper.innerHTML = `<p class="text-critical"><em>Error loading introduction.</em></p>`;
                        }
                    }
                    break;
                case 'reader':
                    if (!sectionPath) {
                        console.error("No section path provided for reader view.");
                        renderView('home'); // Default to home
                        return;
                    }
                    currentSectionPath = sectionPath;
                    const sectionData = await AppDataUI.loadSectionContent(sectionPath);
                    const readerHTML = AppDataUI.getBookReaderHTML(sectionData, sectionPath, bookStructureCache);
                    mainContentArea.innerHTML = readerHTML;
                    setupReaderNavigation(sectionPath);
                    break;
                // case 'deconstructor': // Placeholder
                //     mainContentArea.innerHTML = `<div class="argument-deconstructor-container"><h2>Argument Deconstructor</h2><p>This feature is under development.</p></div>`;
                //     break;
                default:
                    console.warn(`Unknown view: ${viewName}. Redirecting to home.`);
                    renderView('home');
            }
        } catch (error) {
            console.error(`Error rendering view ${viewName}:`, error);
            mainContentArea.innerHTML = `<div class="error-message" style="padding: 20px; background-color: var(--accent-secondary); color: var(--text-primary); border-radius: var(--border-radius-medium); text-align:center;">
                <h3>Content Display Error</h3>
                <p>An error occurred while trying to display this content.</p>
                <p>Please try navigating again or check the console for more details.</p>
            </div>`;
        }
    }

    // --- Book Reader Specific Logic ---
    function setupReaderNavigation(currentSectionPath) {
        const prevBtn = document.getElementById('prev-section-btn');
        const nextBtn = document.getElementById('next-section-btn');

        if (!prevBtn || !nextBtn || !bookStructureCache) {
            console.warn("Reader navigation buttons or book structure not found.");
            return;
        }
        
        const { prev: prevSectionPath, next: nextSectionPath } = AppDataUI.getAdjacentSections(currentSectionPath, bookStructureCache);

        if (prevSectionPath) {
            prevBtn.disabled = false;
            prevBtn.dataset.navSection = prevSectionPath;
        } else {
            prevBtn.disabled = true;
            delete prevBtn.dataset.navSection;
        }

        if (nextSectionPath) {
            nextBtn.disabled = false;
            nextBtn.dataset.navSection = nextSectionPath;
        } else {
            nextBtn.disabled = true;
            delete nextBtn.dataset.navSection;
        }

        // Remove any previous keydown listener to avoid duplicates
        if (window.readerKeyHandler) {
            document.removeEventListener('keydown', window.readerKeyHandler, true);
        }
        // Define and add new keydown handler
        window.readerKeyHandler = function(e) {
            // Only trigger on book reader view
            if (document.getElementById('prev-section-btn') && document.getElementById('next-section-btn')) {
                if (e.key === 'ArrowLeft' && prevSectionPath && !prevBtn.disabled) {
                    e.preventDefault();
                    prevBtn.click();
                } else if (e.key === 'ArrowRight' && nextSectionPath && !nextBtn.disabled) {
                    e.preventDefault();
                    nextBtn.click();
                }
            }
        };
        document.addEventListener('keydown', window.readerKeyHandler, true);
    }

    // Clean up keyboard navigation when leaving the reader
    function cleanupReaderNavigation() {
        if (window.readerKeyHandler) {
            document.removeEventListener('keydown', window.readerKeyHandler, true);
            window.readerKeyHandler = null;
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Main Navigation (using event delegation on the nav container)
        if (mainNav) {
            mainNav.addEventListener('click', (event) => {
                event.preventDefault();
                const navLink = event.target.closest('.nav-link');
                if (navLink && navLink.dataset.nav) {
                    renderView(navLink.dataset.nav);
                }
            });
        }

        // Dynamic Content Area Event Delegation
        if (mainContentArea) {
            mainContentArea.addEventListener('click', (event) => {
                const target = event.target;

                // Handle mission statement button
                const showMissionBtn = target.closest('#show-mission-btn');
                if (showMissionBtn) {
                    event.preventDefault();
                    renderView('mission');
                    return;
                }

                // Case File Cards / Section Links
                const caseFileCard = target.closest('.case-file-card, .button[data-nav-section]');
                if (caseFileCard && caseFileCard.dataset.navSection && caseFileCard.dataset.navSection !== '#') {
                    event.preventDefault();
                    renderView('reader', caseFileCard.dataset.navSection);
                    return;
                }

                // Outline Links
                const outlineLink = target.closest('.nav-link-section');
                if (outlineLink && outlineLink.dataset.navSection) {
                    event.preventDefault();
                    renderView('reader', outlineLink.dataset.navSection);
                    return;
                }

                // Reader Navigation Buttons
                const readerNavButton = target.closest('.reader-navigation .nav-button');
                if (readerNavButton && readerNavButton.dataset.navSection && !readerNavButton.disabled) {
                    event.preventDefault();
                    renderView('reader', readerNavButton.dataset.navSection);
                    return;
                }

                // Explore Source Buttons (fully removed feature)
                const exploreSourceBtn = target.closest('.explore-source-button');
                if (exploreSourceBtn && exploreSourceBtn.dataset.sourceId) {
                    event.preventDefault();
                    // Pass `this` (AppCore instance) to showSourceExplorerModal
                    InteractiveFeatures.showSourceExplorerModal(exploreSourceBtn.dataset.sourceId, AppCore);
                    return;
                }
            });
        }


        // Modal Close Buttons
        document.body.addEventListener('click', (event) => {
            if (event.target.matches('.close-button') || event.target.matches('.modal')) {
                // If click is on .modal background itself or a .close-button
                let modalToClose = null;
                if (event.target.matches('.modal')) {
                    modalToClose = event.target.id;
                } else { // It's a close button
                    modalToClose = event.target.dataset.modalClose;
                }
                
                if (modalToClose) {
                    closeModal(modalToClose);
                }
            }
        });
    }

    // --- History Management ---
    function updateURL(viewName, sectionPath = null) {
        let hash = `#${viewName}`;
        if (sectionPath) {
            hash += `/${encodeURIComponent(sectionPath)}`;
        }
        if (window.location.hash !== hash) {
            history.pushState({ view: viewName, sectionPath }, '', hash);
        }
    }

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            renderView(event.state.view, event.state.sectionPath);
        }
    });

    // Override renderView to include URL update
    const originalRenderView = renderView;
    renderView = async function(viewName, sectionPath = null) {
        await originalRenderView(viewName, sectionPath);
        updateURL(viewName, sectionPath);
    };

    // New Starter Screen Function
    function showStarterScreen(bootPromise) {
        const overlay = document.createElement('div');
        overlay.id = 'starter-screen';
        overlay.className = 'starter-screen';
        const video = document.createElement('video');
        video.src = 'assets/video/AAU.mov';
        video.className = 'starter-video';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        const button = document.createElement('button');
        button.id = 'starter-btn';
        button.className = 'starter-button';
        button.textContent = 'This Is Islam';
        overlay.appendChild(video);
        overlay.appendChild(button);
        document.body.appendChild(overlay);
        button.addEventListener('click', async () => {
            overlay.classList.add('fade-out');
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
            });
            await bootPromise;
            AppCore.renderView('home');
        });
    }

    // --- Initialization ---
    async function initialize() {
        console.log("Islam Unveiled: Critical Explorer - Initializing...");
        setupEventListeners();

        const bootPromise = AppDataUI.loadBookStructure()
            .then(data => { bookStructureCache = data; })
            .catch(error => {
                console.error("Failed to load book structure:", error);
            });

        showStarterScreen(bootPromise);
    }

    // --- Public API of AppCore ---
    return {
        init: initialize,
        renderView, // Expose if needed by other modules, though generally internal
        showModal,  // Expose for InteractiveFeatures
        closeModal
    };

})();

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    AppCore.init();
});
