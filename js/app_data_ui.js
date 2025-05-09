// js/app_data_ui.js

const AppDataUI = (() => {
    // --- Private State for Cached Data ---
    let bookStructure = null;
    let glossaryData = null;
    let apologistTacticsData = null;
    let quranVerses = null;
    let hadithSnippets = null;
    const sectionContentCache = new Map();

    // --- Constants ---
    const DATA_PATH = './data/';
    const CONTENT_PATH = `${DATA_PATH}content/`;

    // --- Utility Functions ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            const mainContentArea = document.getElementById('main-content-area');
            if (mainContentArea) {
                mainContentArea.innerHTML = `<div class="error-message" style="padding: 20px; background-color: var(--accent-secondary); color: var(--text-primary); border-radius: var(--border-radius-medium); text-align:center;">
                    <h3>Data Loading Error</h3>
                    <p>Could not load required data from: <code>${url.replace(window.location.origin, '')}</code></p>
                    <p>Please check the file exists, is valid JSON, and the server is running. Check console for more details.</p>
                </div>`;
            }
            throw error; 
        }
    }

    // --- Data Loading Functions ---
    async function loadBookStructure() {
        if (!bookStructure) {
            bookStructure = await fetchData(`${DATA_PATH}book_structure.json`);
        }
        return bookStructure;
    }

    async function loadGlossary() {
        if (!glossaryData) {
            glossaryData = await fetchData(`${DATA_PATH}glossary.json`);
        }
        return glossaryData;
    }

    async function loadApologistTactics() {
        if (!apologistTacticsData) {
            apologistTacticsData = await fetchData(`${DATA_PATH}apologist_tactics.json`);
        }
        return apologistTacticsData;
    }

    async function loadQuranVerses() {
        if (!quranVerses) {
            quranVerses = await fetchData(`${DATA_PATH}sources/quran_verses.json`);
        }
        return quranVerses;
    }

    async function loadHadithSnippets() {
        if (!hadithSnippets) {
            hadithSnippets = await fetchData(`${DATA_PATH}sources/hadith_snippets.json`);
        }
        return hadithSnippets;
    }

    async function loadSectionContent(sectionPath) {
        if (!sectionPath || typeof sectionPath !== 'string') {
            console.error("Invalid sectionPath provided to loadSectionContent:", sectionPath);
            throw new Error("Invalid section path.");
        }
        if (sectionContentCache.has(sectionPath)) {
            return sectionContentCache.get(sectionPath);
        }
        // Ensure the path doesn't start with './' or CONTENT_PATH already
        let fullPath = sectionPath.startsWith(CONTENT_PATH) ? sectionPath : `${CONTENT_PATH}${sectionPath}`;
        if (fullPath.endsWith('.json') === false) { // Ensure .json extension
            fullPath += '.json';
        }

        const content = await fetchData(fullPath);
        sectionContentCache.set(sectionPath, content); // Cache with original path for consistency
        return content;
    }


    // --- UI Rendering Functions ---

    // Mission Statement HTML
    function getMissionStatementHTML() {
        return `
            <div class="mission-statement-full">
                <h2>Ara's Mission Statement:</h2>
                <p>They want me dead. Let’s be clear about that from the outset. For speaking the truths you are about to read, for daring to expose the rot at the heart of Islam, for the simple act of holding their "holy" book to the light – and to the flame – there are those who would see me silenced, permanently. This isn't hyperbole; it's the stated penalty for apostates and blasphemers in their own scriptures, a fate meted out by their most fervent followers across the globe, even today. That is the fear they wield. That is the brutality this book confronts.</p>
                <p>Why, then, invite such danger? Why stand virtually alone, one of the few women on Earth publicly burning Qurans, knowing each act could be my last? Because the alternative – silence in the face of a creeping, ideologically-driven darkness – is a betrayal far greater than any personal risk. Because the truth, however dangerous, must be told. This book is that truth, forged in conviction, indifferent to consequence. It is my fight against an entire religious edifice built on what I will demonstrate are centuries of deception, manipulation, and divinely-sanctioned violence.</p>
                <p>This is not a polite academic critique. This is a forensic takedown. I will guide you through the labyrinthine passages of the Quran, not as a reverent believer, but as an investigator examining a crime scene. We will scrutinize the life of Muhammad, not as a hallowed prophet, but as a historical figure whose actions, ambitions, and "revelations" laid the groundwork for an empire built on conquest and control. The "Jahiliyyah," the supposed age of ignorance he vanquished? We will see it for the propaganda it is, a convenient myth to elevate a warlord to a messiah.</p>
                <p>The apologists will squirm. The revisionists will cry foul. The politically correct will clutch their pearls and scream "Islamophobia!" – their favorite silencer for any uncomfortable truth. Let them. Their outrage is the predictable chorus when the foundations of a carefully constructed illusion begin to crack. This book is not for them. It is for those who sense the dissonance, who see the headlines of religiously-motivated atrocities, the subjugation of women, the intolerance for dissent, and are told it has "nothing to do with true Islam." It has <em>everything</em> to do with it.</p>
                <p>I will show you, from <em>their own sources</em>, how the call to violence is not an aberration but a feature. How the subjugation of women is not a cultural misinterpretation but a scriptural mandate. How the intolerance for non-believers and critics is not a modern distortion but a foundational principle. This is Islam, stripped bare of its Westernized PR, revealed in its stark, unyielding, and often terrifying reality.</p>
                <p>The fear they cultivate is real. But the fear of living under the shadow of their ideology, of watching our freedoms erode, of allowing their deceptions to go unchallenged, must be greater. This book is my defiance. It’s the intellectual fire aimed at the core of their claims, designed to burn away the layers of historical whitewashing and apologetic obfuscation.</p>
                <p>You will be disturbed. You may be angered. You will certainly be confronted. But you will not be able to say you weren’t shown the evidence. My purpose is to shake the very foundations of what you <em>think</em> you know about Islam, to expose the lies that have held sway for too long, and to arm you with the unassailable truth.</p>
                <p>This isn't just a book; it's an act of war against an ideology I believe to be profoundly dangerous. And in this war, the most potent weapon is the unveiled, unvarnished truth. Read on, if you dare to see. Understand why I risk everything. Understand what is truly at stake.</p>
                <p><strong>Some burn books to hide truth. I burn their book to reveal it.</strong></p>
                <p><strong>This. Is. Islam.</strong></p>
            </div>
        `;
    }

    function getHomeScreenHTML(structure) {
        const parts = structure.parts;
        // The mission statement is assumed to be the first section of the first chapter of the first part.
        // Or, more robustly, we can define a specific path for it in book_structure.json if needed.
        // For now, let's assume it's: part_I_introduction_and_foundation/chapter_0_introduction/mission_statement.json
        const missionStatementSectionPath = "part_I_introduction_and_foundation/chapter_0_introduction/section_0_mission_statement.json";


        let caseFilesHTML = parts.map(part => {
            let firstSectionPath = '';
            if (part.chapters && part.chapters.length > 0 && part.chapters[0].sections && part.chapters[0].sections.length > 0) {
                firstSectionPath = part.chapters[0].sections[0].contentFile;
            } else if (part.sections && part.sections.length > 0) {
                firstSectionPath = part.sections[0].contentFile;
            }

            return `
            <div class="case-file-card" data-nav-section="${firstSectionPath || '#'}">
                <div class="case-file-card-header">
                    <h3>${part.partTitle}</h3>
                    <span>${part.partSubtitle || ''}</span>
                </div>
                <p class="case-file-card-description">${part.summary || 'Explore the critical arguments and evidence presented in this part.'}</p>
                <div class="case-file-card-footer">
                    <button class="open-case-file-btn">Open Case File</button>
                </div>
            </div>`;
        }).join('');

        return `
            <div class="home-screen-container">
                <h2 class="dashboard-title">Investigator's Dashboard</h2>
                <div class="mission-statement-excerpt">
                    <h2>Investigator's Mandate</h2>
                    <p>This platform is dedicated to a critical and evidence-based examination of the foundational texts and historical claims of Islam, as presented in Ara American's "This Is Islam." Our objective is to foster informed analysis and open discussion.</p>
                    <button id="show-mission-btn" class="button">Read Full Mission Statement</button>
                </div>
                <h3>Case Files (Book Parts)</h3>
                <div class="case-files-grid">
                    ${caseFilesHTML}
                </div>
            </div>
        `;
    }

    function getBookOutlineHTML(structure) {
        let outlineHTML = '<div class="outline-list-container">';
        outlineHTML += '<h2 class="page-title">Book Outline</h2>';

        structure.parts.forEach(part => {
            outlineHTML += `<div class="outline-part"><h3>${part.partTitle}</h3>`;
            if (part.chapters && part.chapters.length > 0) {
                part.chapters.forEach(chapter => {
                    outlineHTML += `<div class="outline-chapter"><h4>${chapter.chapterTitle}</h4>`;
                    outlineHTML += '<ul class="outline-section-list">';
                    chapter.sections.forEach(section => {
                        outlineHTML += `<li><a href="#" class="nav-link-section" data-nav-section="${section.contentFile}">${section.sectionTitle}</a></li>`;
                    });
                    outlineHTML += '</ul></div>';
                });
            } else if (part.sections && part.sections.length > 0) {
                 outlineHTML += '<ul class="outline-section-list">';
                 part.sections.forEach(section => {
                    outlineHTML += `<li><a href="#" class="nav-link-section" data-nav-section="${section.contentFile}">${section.sectionTitle}</a></li>`;
                 });
                 outlineHTML += '</ul>';
            }
            outlineHTML += '</div>';
        });
        outlineHTML += '</div>';
        return outlineHTML;
    }

    function getGlossaryHTML(glossary) {
        let itemsHTML = glossary.terms.map((item, idx) => `
            <li class="glossary-item" data-index="${idx}" tabindex="0" role="button" aria-label="View definition for ${item.term}">
                <div class="glossary-term">${item.term}</div>
                <div class="glossary-definition"><p>${item.definition.replace(/\n/g, '</p><p>')}</p></div>
            </li>
        `).join('');

        return `
             <div class="glossary-container">
                 <h2 class="page-title">Glossary of Terms</h2>
                 ${glossary.introduction ? `<div class="glossary-intro"><p>${glossary.introduction}</p></div>` : ''}
                 <div class="glossary-search-container">
                   <input type="text" id="glossary-search" placeholder="Search terms..." aria-label="Search glossary">
                 </div>
                 <ul class="glossary-list">
                     ${itemsHTML}
                 </ul>
             </div>
         `;
    }

    function getApologistTacticsPageHTML(tacticsListData) {
        // This function ONLY generates the list of tactics.
        // The intro content is handled separately by AppCore loading a specific section.
        let tacticsListHTML = tacticsListData.tactics.map(tactic => `
            <div class="tactic-card">
                <div class="tactic-card-header">
                    <h4>${tactic.name}</h4>
                </div>
                <div class="tactic-description">
                    <strong>Description:</strong>
                    <p>${tactic.description.replace(/\n/g, '</p><p>')}</p>
                </div>
                <div class="tactic-rebuttal">
                    <strong>Critical Rebuttal:</strong>
                    <p>${tactic.rebuttal.replace(/\n/g, '</p><p>')}</p>
                </div>
            </div>
        `).join('');

        return `
            <div class="apologist-tactics-container">
                <h2 class="page-title">Common Apologist Tactics</h2>
                <div id="apologist-tactics-intro-content-wrapper">
                    <!-- Intro content from a specific section will be loaded here by AppCore -->
                    <div class="loading-spinner"></div>
                </div>
                <h3>Identified Tactics & Rebuttals</h3>
                <div class="tactics-list">
                    ${tacticsListHTML}
                </div>
            </div>
        `;
    }
    
    function renderContentItem(item) {
        switch (item.type) {
            case 'paragraph':
                return `<p>${item.text}</p>`;
            case 'heading':
                return `<h${item.level || 4}>${item.text}</h${item.level || 4}>`;
            case 'quote_block':
                return `
                    <div class="quote-block">
                        <p>${item.text}</p>
                        ${item.text_ref ? `<span class="quote-reference">${item.text_ref}</span>` : ''}

                    </div>`;
            case 'list':
                let listItems = item.items.map(li => `<li>${li}</li>`).join('');
                return `<ul>${listItems}</ul>`;
            default:
                console.warn('Unknown content type:', item.type, item);
                return `<p class="text-critical"><em>Unsupported content type: ${item.type}</em></p>`;
        }
    }


    function getBookReaderHTML(sectionData, sectionPath, currentBookStructure) {
        let contentHTML = sectionData.content.map(renderContentItem).join('');
        
        let chapterTitleDisplay = '';
        let sectionTitleDisplay = sectionData.title; // Default to title from content file

        if (currentBookStructure) {
            for (const part of currentBookStructure.parts) {
                if (part.chapters) {
                    for (const chapter of part.chapters) {
                        const foundSection = chapter.sections.find(s => s.contentFile === sectionPath);
                        if (foundSection) {
                            chapterTitleDisplay = chapter.chapterTitle;
                            // sectionTitleDisplay = foundSection.sectionTitle; // Prefer title from content file
                            break;
                        }
                    }
                } else if (part.sections) { 
                     const foundSection = part.sections.find(s => s.contentFile === sectionPath);
                     if (foundSection) {
                        chapterTitleDisplay = part.partTitle; 
                        // sectionTitleDisplay = foundSection.sectionTitle; // Prefer title from content file
                        break;
                     }
                }
                if (chapterTitleDisplay) break;
            }
        }
        // If sectionData.title is very generic, like "Section Content", try to use book_structure's title
        if (sectionData.title && (sectionData.title.toLowerCase() === "section content" || sectionData.title.toLowerCase() === "content") && currentBookStructure) {
             const foundInSectionList = findSectionDetails(sectionPath, currentBookStructure);
             if (foundInSectionList && foundInSectionList.sectionTitle) {
                sectionTitleDisplay = foundInSectionList.sectionTitle;
             }
        }


        return `
            <div class="book-reader-container">
                <div class="reader-header">
                    ${chapterTitleDisplay ? `<h2>${chapterTitleDisplay}</h2>` : ''}
                    <h3>${sectionTitleDisplay || 'Content'}</h3>
                </div>
                <div class="reader-content">
                    ${contentHTML}
                </div>
                <div class="reader-navigation">
                    <button class="nav-button prev" id="prev-section-btn" disabled>Previous Section</button>
                    <button class="nav-button next" id="next-section-btn" disabled>Next Section</button>
                </div>
            </div>
        `;
    }

    function getSourceExplorerModalHTML(sourceDetails, sourceId) {
        if (!sourceDetails) {
            return `<div class="source-explorer-content"><p class="error-message">Source details not found for ID: ${sourceId}</p></div>`;
        }

        let typeLabel = 'Source';
        if (sourceId) { // Ensure sourceId is defined before checking startsWith
             if (sourceId.startsWith('quran_')) typeLabel = 'Quran Verse';
             else if (sourceId.startsWith('hadith_')) typeLabel = 'Hadith Snippet';
        }


        return `
            <div class="source-explorer-content">
                <p class="reference-id"><strong>Reference ID:</strong> ${sourceDetails.id || sourceId}</p>
                <h4>Original Text (${typeLabel})</h4>
                <div class="source-text-block">${sourceDetails.text ? sourceDetails.text.replace(/\n/g, '<br>') : 'N/A'}</div>

                <h4>Ara American's Analysis</h4>
                <div class="analysis-block">
                    ${sourceDetails.analysis ? `<p>${sourceDetails.analysis.replace(/\n/g, '</p><p>')}</p>` : '<p class="no-content-notice">No specific analysis provided for this source in the data.</p>'}
                </div>

                <h4>Common Apologist Claim (if any)</h4>
                <div class="apologist-claim-block">
                    ${sourceDetails.apologist_claim ? `<p>${sourceDetails.apologist_claim.replace(/\n/g, '</p><p>')}</p>` : '<p class="no-content-notice">No common apologist claims noted for this source in the data.</p>'}
                </div>
            </div>
        `;
    }
    
    // Helper to find section details from book structure
    function findSectionDetails(sectionPath, currentBookStructure) {
        if (!currentBookStructure || !sectionPath) return null;
        for (const part of currentBookStructure.parts) {
            const sectionsToSearch = [];
            if (part.chapters) {
                part.chapters.forEach(ch => {
                    if (ch.sections) sectionsToSearch.push(...ch.sections);
                });
            }
            if (part.sections) { // For parts like Introduction/Conclusion without chapters
                sectionsToSearch.push(...part.sections);
            }
            
            const section = sectionsToSearch.find(s => s.contentFile === sectionPath);
            if (section) return section;
        }
        return null;
    }


    // --- Public API ---
    return {
        // Data Loaders
        getMissionStatementHTML,
        loadBookStructure,
        loadGlossary,
        loadApologistTactics,
        loadQuranVerses,
        loadHadithSnippets,
        loadSectionContent,

        // UI Generators
        getHomeScreenHTML,
        getBookOutlineHTML,
        getGlossaryHTML,
        getApologistTacticsPageHTML, // Renamed for clarity
        getBookReaderHTML,
        getSourceExplorerModalHTML,
        renderContentItem, // Expose for dynamic content rendering (e.g., Apologist Tactics Intro)

        // Getter for book structure (needed for prev/next logic in reader)
        getBookStructure: () => bookStructure, // Direct access after loading

        getAdjacentSections: (currentSectionPath, currentBookStructure) => {
            if (!currentBookStructure || !currentSectionPath) return { prev: null, next: null };

            const allSections = [];
            currentBookStructure.parts.forEach(part => {
                if (part.chapters) {
                    part.chapters.forEach(chapter => {
                        if (chapter.sections) {
                           chapter.sections.forEach(section => allSections.push(section.contentFile));
                        }
                    });
                } else if (part.sections) { 
                    part.sections.forEach(section => allSections.push(section.contentFile));
                }
            });

            const currentIndex = allSections.indexOf(currentSectionPath);
            if (currentIndex === -1) {
                console.warn(`Current section path ${currentSectionPath} not found in allSections list for prev/next.`);
                return { prev: null, next: null };
            }

            const prev = currentIndex > 0 ? allSections[currentIndex - 1] : null;
            const next = currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;
            
            return { prev, next };
        }
    };
})();
