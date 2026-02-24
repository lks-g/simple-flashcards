document.addEventListener("DOMContentLoaded", () => {
    const flashcardElement = document.getElementById("flashcard");
    const questionText = document.getElementById("question-text");
    const answerText = document.getElementById("answer-text");
    const categoryText = document.getElementById("flashcard-category");

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const progressIndicator = document.getElementById("progress-indicator");

    const emptyState = document.getElementById("empty-state");
    const flashcardScene = document.getElementById("flashcard-scene");
    const controls = document.getElementById("controls");

    let flashcards = [];
    let currentIndex = 0;
    let isFlipped = false;
    let currentLang = "sk";

    function applyTranslations() {
        const dict = i18n[currentLang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                el.innerText = dict[key];
            }
        });
    }

    function getStr(key) {
        return i18n[currentLang][key] || key;
    }

    // Click for flip
    flashcardElement.addEventListener("click", () => {
        isFlipped = !isFlipped;
        if (isFlipped) {
            flashcardElement.classList.add("is-flipped");
        } else {
            flashcardElement.classList.remove("is-flipped");
        }
    });

    // Load from storage
    chrome.storage.local.get({ flashcards: [], appLanguage: "sk" }, (result) => {
        flashcards = result.flashcards;
        currentLang = result.appLanguage;
        applyTranslations();

        // Filter by URL param category
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get("category");
        const generalCatName = getStr("generalCategory");

        if (categoryParam) {
            flashcards = flashcards.filter(card => (card.category || generalCatName) === categoryParam);
        }

        if (flashcards.length === 0) {
            emptyState.style.display = "block";
            if (categoryParam) {
                emptyState.querySelector("h2").textContent = `${getStr("studyEmptyCategory")} "${categoryParam}".`;
            }
            flashcardScene.style.display = "none";
            controls.style.display = "none";
            return;
        }

        // Initialize first card
        updateUI();
    });

    function updateUI() {
        const currentCard = flashcards[currentIndex];

        // Reset flip state before updating content to prevent answer flashing
        if (isFlipped) {
            flashcardElement.classList.remove("is-flipped");
            isFlipped = false;
            // Timeout allows flip animation to start before content changes
            setTimeout(renderContent, 180);
        } else {
            renderContent();
        }

        function renderContent() {
            questionText.textContent = currentCard.question;
            answerText.textContent = currentCard.answer;
            categoryText.textContent = currentCard.category || getStr("generalCategory");
            progressIndicator.textContent = `${getStr("cardIndexPrefix")} ${currentIndex + 1} ${getStr("cardIndexOf")} ${flashcards.length}`;

            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === flashcards.length - 1;
        }
    }

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateUI();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < flashcards.length - 1) {
            currentIndex++;
            updateUI();
        }
    });

    // Keyboard Navigation
    document.addEventListener("keydown", (e) => {
        if (flashcards.length === 0) return;

        if (e.key === "ArrowLeft" && currentIndex > 0) {
            currentIndex--;
            updateUI();
        } else if (e.key === "ArrowRight" && currentIndex < flashcards.length - 1) {
            currentIndex++;
            updateUI();
        } else if (e.key === " " || e.key === "Enter") {
            // Space or Enter to flip
            flashcardElement.click();
        }
    });
});
