document.addEventListener("DOMContentLoaded", () => {
    const contentArea = document.getElementById("content-area");
    const statsBar = document.getElementById("stats-bar");
    const mainTitle = document.getElementById("main-title");
    const langSwitcher = document.getElementById("lang-switcher");
    const studyAllBtn = document.getElementById("study-all-btn");
    const clearBtn = document.getElementById("clear-btn");

    // Edit Modal
    const editModal = document.getElementById("edit-modal");
    const editCategorySelect = document.getElementById("edit-category");
    const newCategoryInput = document.getElementById("new-category-input");
    const editQuestionInput = document.getElementById("edit-question");
    const editAnswerInput = document.getElementById("edit-answer");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const saveEditBtn = document.getElementById("save-edit-btn");

    // Delete Modal
    const deleteModal = document.getElementById("delete-modal");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

    const ADD_NEW_CAT_VALUE = "__ADD_NEW__";
    let editingCardIndex = null;
    let allFlashcards = [];
    let currentLang = "sk";
    let currentView = "grid"; // "grid" or "category"
    let currentCatName = null;

    loadData();

    function getStr(key) {
        return i18n[currentLang][key] || key;
    }

    function applyTranslations() {
        const dict = i18n[currentLang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.innerText = dict[key];
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (dict[key]) el.placeholder = dict[key];
        });
    }

    function loadData() {
        chrome.storage.local.get({ flashcards: [], appLanguage: "sk" }, (result) => {
            allFlashcards = result.flashcards;
            currentLang = result.appLanguage;
            langSwitcher.value = currentLang;
            applyTranslations();

            allFlashcards.forEach((card, index) => { card.originalIndex = index; });

            renderStats();
            if (currentView === "grid") {
                renderCategoryGrid();
            } else {
                renderCategoryDetail(currentCatName);
            }
        });
    }

    langSwitcher.addEventListener("change", (e) => {
        currentLang = e.target.value;
        chrome.storage.local.set({ appLanguage: currentLang }, () => {
            applyTranslations();
            renderStats();
            if (currentView === "grid") renderCategoryGrid();
            else renderCategoryDetail(currentCatName);
        });
    });

    studyAllBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "study.html" });
    });

    clearBtn.addEventListener("click", () => {
        deleteModal.classList.remove("hidden");
    });

    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.classList.add("hidden");
    });

    confirmDeleteBtn.addEventListener("click", () => {
        chrome.storage.local.set({ flashcards: [] }, () => {
            deleteModal.classList.add("hidden");
            currentView = "grid";
            currentCatName = null;
            loadData();
        });
    });

    // --- STATS ---
    function renderStats() {
        const generalCat = getStr("generalCategory");
        const categories = new Set(allFlashcards.map(c => c.category || generalCat));
        statsBar.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${allFlashcards.length}</div>
                <div class="stat-label">${getStr("cardsCount")}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${categories.size}</div>
                <div class="stat-label">${getStr("dashboardCategories")}</div>
            </div>
        `;
    }

    // --- CATEGORY GRID ---
    function renderCategoryGrid() {
        currentView = "grid";
        currentCatName = null;
        mainTitle.textContent = getStr("dashboardCategories");
        contentArea.innerHTML = "";

        const generalCat = getStr("generalCategory");

        if (allFlashcards.length === 0) {
            contentArea.innerHTML = `<div class="empty-state-full"><span>📄</span>${getStr("emptyCards")}</div>`;
            return;
        }

        const grouped = {};
        allFlashcards.forEach(card => {
            const cat = card.category || generalCat;
            if (!grouped[cat]) grouped[cat] = 0;
            grouped[cat]++;
        });

        const grid = document.createElement("div");
        grid.className = "dash-category-grid";

        Object.keys(grouped).sort().forEach(cat => {
            const tile = document.createElement("div");
            tile.className = "dash-cat-tile";
            tile.innerHTML = `
                <div class="dash-cat-name">${cat}</div>
                <div class="dash-cat-count">${grouped[cat]} ${getStr("cardsCount")}</div>
                <div class="dash-cat-actions">
                    <button class="dash-study-btn" data-cat="${cat}" data-i18n="studyCategory">${getStr("studyCategory")}</button>
                </div>
            `;
            tile.addEventListener("click", (e) => {
                if (e.target.classList.contains("dash-study-btn")) {
                    chrome.tabs.create({ url: "study.html?category=" + encodeURIComponent(e.target.dataset.cat) });
                    return;
                }
                renderCategoryDetail(cat);
            });
            grid.appendChild(tile);
        });

        contentArea.appendChild(grid);
    }

    // --- CATEGORY DETAIL ---
    function renderCategoryDetail(catName) {
        currentView = "category";
        currentCatName = catName;
        mainTitle.textContent = `${getStr("categoryPrefix")} ${catName}`;
        contentArea.innerHTML = "";

        const generalCat = getStr("generalCategory");

        const backBtn = document.createElement("button");
        backBtn.className = "btn-secondary";
        backBtn.innerHTML = getStr("backToDash");
        backBtn.style.marginBottom = "16px";
        backBtn.addEventListener("click", () => renderCategoryGrid());
        contentArea.appendChild(backBtn);

        const cards = [...allFlashcards].reverse().filter(c => (c.category || generalCat) === catName);

        const list = document.createElement("div");
        list.className = "card-list";

        cards.forEach(card => {
            const el = document.createElement("div");
            el.className = "dash-card";

            const top = document.createElement("div");
            top.className = "dash-card-top";

            const q = document.createElement("div");
            q.className = "dash-card-q";
            q.textContent = card.question;

            const editBtn = document.createElement("button");
            editBtn.className = "btn-ghost";
            editBtn.textContent = getStr("btnEdit");
            editBtn.addEventListener("click", () => openEditModal(card));

            top.appendChild(q);
            top.appendChild(editBtn);

            const toggleBtn = document.createElement("button");
            toggleBtn.className = "btn-secondary btn-sm";
            toggleBtn.textContent = getStr("btnShowAnswer");
            toggleBtn.style.width = "100%";

            const answerDiv = document.createElement("div");
            answerDiv.className = "dash-card-a";
            answerDiv.textContent = card.answer;

            toggleBtn.addEventListener("click", () => {
                if (answerDiv.style.display === "block") {
                    answerDiv.style.display = "none";
                    toggleBtn.textContent = getStr("btnShowAnswer");
                } else {
                    answerDiv.style.display = "block";
                    toggleBtn.textContent = getStr("btnHideAnswer");
                }
            });

            el.appendChild(top);
            el.appendChild(toggleBtn);
            el.appendChild(answerDiv);
            list.appendChild(el);
        });

        contentArea.appendChild(list);
    }

    // --- EDIT MODAL ---
    function openEditModal(card) {
        editingCardIndex = card.originalIndex;
        const generalCat = getStr("generalCategory");
        const uniqueCategories = new Set(allFlashcards.map(c => c.category || generalCat));

        editCategorySelect.innerHTML = "";
        [...uniqueCategories].sort().forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            editCategorySelect.appendChild(opt);
        });

        const addOpt = document.createElement("option");
        addOpt.value = ADD_NEW_CAT_VALUE;
        addOpt.textContent = getStr("addNewCategoryOption");
        editCategorySelect.appendChild(addOpt);

        const currentCat = card.category || generalCat;
        if (uniqueCategories.has(currentCat)) editCategorySelect.value = currentCat;

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
        editModal.classList.add("hidden");
        editingCardIndex = null;
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
            editModal.classList.add("hidden");
            editingCardIndex = null;
            loadData();
        });
    });
});
