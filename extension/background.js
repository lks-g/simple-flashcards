// Recallify — Background Service Worker
// API key is now loaded from chrome.storage.local (no hardcoded key)

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "create-flashcard",
        title: "Recallify — Vytvoriť kartu",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "create-flashcard") {
        const selectedText = info.selectionText;

        chrome.storage.local.get({ appLanguage: "sk", geminiApiKey: "" }, async (result) => {
            const appLang = result.appLanguage;
            const apiKey = result.geminiApiKey;

            // Check for API key
            if (!apiKey) {
                const noKeyTitle = appLang === "en" ? "API Key Missing" : "Chýba API kľúč";
                const noKeyMsg = appLang === "en"
                    ? "Please set your Gemini API key in the Recallify extension settings (⚙️)."
                    : "Prosím, nastavte si Gemini API kľúč v nastaveniach rozšírenia Recallify (⚙️).";

                chrome.notifications.create("nokey-" + Date.now(), {
                    type: "basic",
                    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
                    title: noKeyTitle,
                    message: noKeyMsg,
                    priority: 2
                });
                return;
            }

            const notifLoadingMsg = appLang === "en"
                ? "Generating flashcard... AI is processing text."
                : "Generujem flash kartu... AI spracováva text.";

            const notificationId = "loading-" + Date.now();
            chrome.notifications.create(notificationId, {
                type: "basic",
                iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
                title: "Recallify",
                message: notifLoadingMsg,
                priority: 0
            });

            await generateFlashcard(selectedText, notificationId, apiKey);
        });
    }
});

async function generateFlashcard(text, notificationId, apiKey) {
    try {
        const languageData = await chrome.storage.local.get({ appLanguage: "sk" });
        const appLang = languageData.appLanguage;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        let prompt;
        if (appLang === "en") {
            prompt = `Read the following text and generate 1 study flashcard (Question and Answer) in English.
Focus on the most important information.
Also invent a short, relevant category name (1-2 words in English) based on the text content.
Reply STRICTLY in JSON format exactly like this: {"question": "your question", "answer": "your answer", "category": "your category"}.
Text: "${text}"`;
        } else {
            prompt = `Prečítaj si nasledujúci text a vytvor 1 študijnú flash kartu (Otázka a Odpoveď) v slovenskom jazyku. 
Zameraj sa na to najdôležitejšie.
Tiež vymysli krátky, výstižný názov kategórie (1-2 slová v slovenčine) na základe obsahu textu.
Odpovedz STRIKTNE v JSON formáte presne takto: {"question": "tvoja otázka", "answer": "tvoja odpoveď", "category": "tvoja kategória"}.
Text: "${text}"`;
        }

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let aiResponseText = data.candidates[0].content.parts[0].text;

        const flashcard = JSON.parse(aiResponseText);

        chrome.storage.local.get({ flashcards: [], appLanguage: "sk" }, (result) => {
            const updatedFlashcards = [...result.flashcards, flashcard];
            const lang = result.appLanguage;

            const notifSuccessTitle = lang === "en" ? "Success!" : "Úspech!";
            const notifSuccessMsg = lang === "en" ? "Card created! Category: " : "Karta vytvorená! Kategória: ";
            const defCategory = lang === "en" ? "General" : "Všeobecné";

            chrome.storage.local.set({ flashcards: updatedFlashcards }, () => {
                chrome.notifications.clear(notificationId);
                chrome.notifications.create("success-" + Date.now(), {
                    type: "basic",
                    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
                    title: notifSuccessTitle,
                    message: `${notifSuccessMsg}${flashcard.category || defCategory}`,
                    priority: 0
                });
            });
        });

    } catch (error) {
        console.error("Recallify error:", error);
        chrome.notifications.clear(notificationId);
        chrome.storage.local.get({ appLanguage: "sk" }, (result) => {
            const lang = result.appLanguage;
            const notifErrorTitle = lang === "en" ? "Error" : "Chyba";
            const notifErrorMsg = lang === "en"
                ? "Failed to create flashcard. Please try again."
                : "Nepodarilo sa vytvoriť flash kartu. Skúste to znova.";

            chrome.notifications.create("error-" + Date.now(), {
                type: "basic",
                iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
                title: notifErrorTitle,
                message: notifErrorMsg,
                priority: 0
            });
        });
    }
}
