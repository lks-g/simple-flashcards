document.addEventListener("DOMContentLoaded", () => {
    // Top-level DOM elements
    const dashboardView = document.getElementById("dashboard-view");
    const categoryView = document.getElementById("category-view");
    const settingsView = document.getElementById("settings-view");
    const recentCardContainer = document.getElementById("recent-card-container");
    const categoryGrid = document.getElementById("category-grid");
    const categoryCardsContainer = document.getElementById("category-cards-container");
    const currentCategoryTitle = document.getElementById("current-category-title");

    // Buttons
    const studyAllBtn = document.getElementById("study-all-btn");
    const quizBtn = document.getElementById("quiz-btn");
    const backToDashBtn = document.getElementById("back-to-dash-btn");
    const studyCategoryBtn = document.getElementById("study-category-btn");
    const clearBtn = document.getElementById("clear-btn");
    const langSwitcher = document.getElementById("lang-switcher");
    const settingsBtn = document.getElementById("settings-btn");
    const backFromSettingsBtn = document.getElementById("back-from-settings-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    // Settings elements
    const apiKeyInput = document.getElementById("api-key-input");
    const llmSelect = document.getElementById("llm-select");
    const saveApiKeyBtn = document.getElementById("save-api-key-btn");
    const apiKeyStatus = document.getElementById("api-key-status");

    // Edit Modal elements
    const editModal = document.getElementById("edit-modal");
    const editCategorySelect = document.getElementById("edit-category");
    const newCategoryInput = document.getElementById("new-category-input");
    const editQuestionInput = document.getElementById("edit-question");
    const editAnswerInput = document.getElementById("edit-answer");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const saveEditBtn = document.getElementById("save-edit-btn");

    // Delete Modal elements
    const deleteModal = document.getElementById("delete-modal");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

    // State
    const ADD_NEW_CAT_VALUE = "__ADD_NEW__";
    let editingCardIndex = null;
    let allFlashcards = [];
    let currentCategoryViewName = null;
    let currentLang = "sk";

    // Initial Load
    loadData();

    function applyTranslations() {
        const dict = i18n[currentLang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                el.innerText = dict[key];
            }
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (dict[key]) {
                el.placeholder = dict[key];
            }
        });
    }

    function getStr(key) {
        return i18n[currentLang][key] || key;
    }

    async function loadAvailableModels(apiKey, savedModelVal) {
        if (!apiKey) {
            llmSelect.innerHTML = `<option value="" disabled selected data-i18n="enterApiKeyFirst">${getStr("enterApiKeyFirst")}</option>`;
            return;
        }

        try {
            llmSelect.innerHTML = `<option value="" disabled selected data-i18n="loadingModels">${getStr("loadingModels")}</option>`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (!response.ok) throw new Error("Failed to fetch models");

            const data = await response.json();
            const models = data.models || [];

            let validModels = models.filter(m =>
                m.supportedGenerationMethods &&
                m.supportedGenerationMethods.includes("generateContent") &&
                m.name.toLowerCase().includes("gemini")
            );

            validModels = validModels.map(m => {
                return {
                    id: m.name.replace("models/", ""),
                    name: m.displayName || m.name.replace("models/", "")
                };
            });

            let flashModel = validModels.find(m => m.id.includes('flash-latest')) || validModels.find(m => m.id.includes('flash'));
            let proModel = validModels.find(m => m.id.includes('pro-latest')) || validModels.find(m => m.id.includes('pro'));

            if (!flashModel) flashModel = { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' };
            if (!proModel) proModel = { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' };

            let otherGemini = validModels.filter(m => m.id !== flashModel.id && m.id !== proModel.id).slice(0, 3);

            const topModels = [flashModel, proModel, ...otherGemini];

            llmSelect.innerHTML = "";
            topModels.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = m.name;
                llmSelect.appendChild(opt);
            });

            let targetVal = savedModelVal || flashModel.id;

            if (targetVal && topModels.some(m => m.id === targetVal)) {
                llmSelect.value = targetVal;
            } else if (topModels.length > 0) {
                llmSelect.value = topModels[0].id;
            }

        } catch (error) {
            console.error("Recallify Model Fetch Error:", error);
            llmSelect.innerHTML = `<option value="gemini-1.5-flash">Gemini 1.5 Flash (Fallback)</option>`;
        }
    }

    function loadData() {
        chrome.storage.local.get({ flashcards: [], appLanguage: "sk", geminiApiKey: "", selectedLLM: "gemini-1.5-flash" }, (result) => {
            allFlashcards = result.flashcards;
            currentLang = result.appLanguage;
            langSwitcher.value = currentLang;

            // Pre-fill API key input (show masked)
            if (result.geminiApiKey) {
                apiKeyInput.value = result.geminiApiKey;
            }

            loadAvailableModels(result.geminiApiKey, result.selectedLLM);

            applyTranslations();

            allFlashcards.forEach((card, index) => {
                card.originalIndex = index;
            });

            renderDashboard();
            if (currentCategoryViewName) {
                renderCategoryView(currentCategoryViewName);
            }
        });
    }

    langSwitcher.addEventListener("change", (e) => {
        currentLang = e.target.value;
        chrome.storage.local.set({ appLanguage: currentLang }, () => {
            applyTranslations();
            renderDashboard();
            if (currentCategoryViewName) {
                renderCategoryView(currentCategoryViewName);
            }
        });
    });

    // --- NAVIGATION ---
    function showView(viewToShow) {
        [dashboardView, categoryView, settingsView].forEach(v => v.classList.add("hidden"));
        viewToShow.classList.remove("hidden");
    }

    studyAllBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "study.html" });
    });

    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            chrome.tabs.create({ url: "quiz.html" });
        });
    }

    backToDashBtn.addEventListener("click", () => {
        currentCategoryViewName = null;
        showView(dashboardView);
    });

    studyCategoryBtn.addEventListener("click", () => {
        if (currentCategoryViewName) {
            chrome.tabs.create({ url: "study.html?category=" + encodeURIComponent(currentCategoryViewName) });
        }
    });

    settingsBtn.addEventListener("click", () => {
        apiKeyStatus.style.display = "none";
        showView(settingsView);
    });

    backFromSettingsBtn.addEventListener("click", () => {
        showView(dashboardView);
    });

    fullscreenBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "dashboard.html" });
    });

    // --- SETTINGS ---
    llmSelect.addEventListener("change", () => {
        const llm = llmSelect.value;
        chrome.storage.local.set({ selectedLLM: llm }, () => {
            const originalBorder = llmSelect.style.borderColor;
            const originalBg = llmSelect.style.backgroundColor;

            llmSelect.style.backgroundColor = "#d1fae5";
            llmSelect.style.borderColor = "#10b981";

            setTimeout(() => {
                llmSelect.style.backgroundColor = originalBg;
                llmSelect.style.borderColor = originalBorder;
            }, 600);
        });
    });

    saveApiKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        const llm = llmSelect.value;
        chrome.storage.local.set({ geminiApiKey: key, selectedLLM: llm }, () => {
            loadAvailableModels(key, llm);
            apiKeyStatus.style.display = "block";
            apiKeyStatus.textContent = getStr("apiKeySaved");
            setTimeout(() => { apiKeyStatus.style.display = "none"; }, 3000);
        });
    });

    // --- DELETE ---
    clearBtn.addEventListener("click", () => {
        deleteModal.classList.remove("hidden");
    });

    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.classList.add("hidden");
    });

    confirmDeleteBtn.addEventListener("click", () => {
        chrome.storage.local.set({ flashcards: [] }, () => {
            deleteModal.classList.add("hidden");
            currentCategoryViewName = null;
            showView(dashboardView);
            loadData();
        });
    });

    // --- DASHBOARD RENDER ---
    function renderDashboard() {
        recentCardContainer.innerHTML = "";
        categoryGrid.innerHTML = "";

        const generalCatName = getStr("generalCategory");

        if (allFlashcards.length === 0) {
            recentCardContainer.innerHTML = `<div class='empty-text'>${getStr("emptyCards")}</div>`;
            categoryGrid.innerHTML = `<div class='empty-text'>${getStr("emptyCategories")}</div>`;
            studyAllBtn.style.display = "none";
            return;
        }

        studyAllBtn.style.display = "inline-block";

        // 1. Most recent card
        const mostRecentCard = allFlashcards[allFlashcards.length - 1];
        const recentCardEl = createCardElement(mostRecentCard);
        recentCardContainer.appendChild(recentCardEl);

        // 2. Category Grouping & Grid
        const grouped = {};
        allFlashcards.forEach((card) => {
            const cat = card.category || generalCatName;
            if (!grouped[cat]) grouped[cat] = 0;
            grouped[cat]++;
        });

        const sortedCategories = Object.keys(grouped).sort();

        sortedCategories.forEach(cat => {
            const tile = document.createElement("div");
            tile.className = "category-tile";
            tile.innerHTML = `
                <div class="category-tile-name">${cat}</div>
                <div class="category-tile-count">${grouped[cat]} ${getStr("cardsCount")}</div>
            `;
            tile.addEventListener("click", () => {
                showView(categoryView);
                renderCategoryView(cat);
            });
            categoryGrid.appendChild(tile);
        });
    }

    // --- CATEGORY VIEW RENDER ---
    function renderCategoryView(categoryName) {
        currentCategoryViewName = categoryName;
        currentCategoryTitle.textContent = `${getStr("categoryPrefix")} ${categoryName}`;
        categoryCardsContainer.innerHTML = "";
        const generalCatName = getStr("generalCategory");

        const categoryCards = [...allFlashcards]
            .reverse()
            .filter(c => (c.category || generalCatName) === categoryName);

        categoryCards.forEach(card => {
            const cardEl = createCardElement(card);
            categoryCardsContainer.appendChild(cardEl);
        });
    }

    // --- UI HELPERS ---
    function createCardElement(card) {
        const cardElement = document.createElement("div");
        cardElement.className = "flashcard";

        const questionContainer = document.createElement("div");
        questionContainer.className = "question-container";

        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        questionDiv.textContent = card.question;

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = getStr("btnEdit");
        editBtn.addEventListener("click", () => openEditModal(card));

        questionContainer.appendChild(questionDiv);
        questionContainer.appendChild(editBtn);

        const showAnswerBtn = document.createElement("button");
        showAnswerBtn.className = "show-answer-btn";
        showAnswerBtn.textContent = getStr("btnShowAnswer");

        const answerDiv = document.createElement("div");
        answerDiv.className = "answer";
        answerDiv.textContent = card.answer;

        showAnswerBtn.addEventListener("click", () => {
            if (answerDiv.style.display === "block") {
                answerDiv.style.display = "none";
                showAnswerBtn.textContent = getStr("btnShowAnswer");
            } else {
                answerDiv.style.display = "block";
                showAnswerBtn.textContent = getStr("btnHideAnswer");
            }
        });

        cardElement.appendChild(questionContainer);
        cardElement.appendChild(showAnswerBtn);
        cardElement.appendChild(answerDiv);

        return cardElement;
    }

    // --- EDIT MODAL ---
    function openEditModal(card) {
        editingCardIndex = card.originalIndex;
        const generalCatName = getStr("generalCategory");

        const uniqueCategories = new Set(allFlashcards.map(c => c.category || generalCatName));
        editCategorySelect.innerHTML = "";

        [...uniqueCategories].sort().forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            editCategorySelect.appendChild(option);
        });

        const addNewOption = document.createElement("option");
        addNewOption.value = ADD_NEW_CAT_VALUE;
        addNewOption.textContent = getStr("addNewCategoryOption");
        editCategorySelect.appendChild(addNewOption);

        const currentCat = card.category || generalCatName;
        if (uniqueCategories.has(currentCat)) {
            editCategorySelect.value = currentCat;
        }

        newCategoryInput.value = "";
        newCategoryInput.classList.add("hidden");
        editQuestionInput.value = card.question;
        editAnswerInput.value = card.answer;

        editModal.classList.remove("hidden");
    }

    editCategorySelect.addEventListener("change", (e) => {
        if (e.target.value === ADD_NEW_CAT_VALUE) {
            newCategoryInput.classList.remove("hidden");
            newCategoryInput.focus();
        } else {
            newCategoryInput.classList.add("hidden");
        }
    });

    cancelEditBtn.addEventListener("click", () => {
        closeEditModal();
    });

    saveEditBtn.addEventListener("click", () => {
        const question = editQuestionInput.value.trim();
        const answer = editAnswerInput.value.trim();
        let category = editCategorySelect.value;

        if (category === ADD_NEW_CAT_VALUE) {
            category = newCategoryInput.value.trim();
            if (!category) {
                alert(getStr("categoryAlert"));
                return;
            }
        }

        if (!question || !answer) {
            alert(getStr("emptyAlert"));
            return;
        }

        allFlashcards[editingCardIndex].question = question;
        allFlashcards[editingCardIndex].answer = answer;
        allFlashcards[editingCardIndex].category = category;

        chrome.storage.local.set({ flashcards: allFlashcards }, () => {
            closeEditModal();
            loadData();
        });
    });

    function closeEditModal() {
        editModal.classList.add("hidden");
        editingCardIndex = null;
    }
});
