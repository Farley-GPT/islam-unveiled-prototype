// js/interactive_features.js

// js/interactive_features.js

// All Evidence Locker and Explore Source logic removed as per user request.
// This file now reserved for future interactive features.

        let title = "Source Details";

        try {
            if (sourceId.startsWith('quran_')) {
                const quranVerses = await AppDataUI.loadQuranVerses();
                sourceData = quranVerses.verses.find(v => v.id === sourceId);
                title = `Quranic Verse: ${sourceId.replace('quran_', '').replace('_', ':')}`;
            } else if (sourceId.startsWith('hadith_')) {
                const hadithSnippets = await AppDataUI.loadHadithSnippets();
                sourceData = hadithSnippets.snippets.find(s => s.id === sourceId);
                title = `Hadith Snippet: ${sourceId.replace('hadith_', '')}`;
            } else {
                console.warn(`Unknown source type for ID: ${sourceId}`);
                appCoreInstance.showModal('source-explorer-modal', 'Error', `<p>Unknown source type for ID: ${sourceId}</p>`);
                return;
            }

            if (!sourceData) {
                console.warn(`Source data not found for ID: ${sourceId}`);
                appCoreInstance.showModal('source-explorer-modal', title, `<p>Details for source ID "${sourceId}" could not be found.</p>`);
                return;
            }

            const modalContentHTML = AppDataUI.getSourceExplorerModalHTML(sourceData, sourceId);
            appCoreInstance.showModal('source-explorer-modal', title, modalContentHTML);




                // Remove any existing listener to prevent multiple attachments if modal is re-shown



                newBtn.addEventListener('click', () => {

                });
            }

        } catch (error) {
            console.error(`Error loading source details for ${sourceId}:`, error);
            appCoreInstance.showModal('source-explorer-modal', 'Error', `<p>Could not load details for ${sourceId}. See console for more info.</p>`);
        }
    }


    // --- Public API ---
    return {

        showSourceExplorerModal,

    };

})();
