document.addEventListener("DOMContentLoaded", () => {
    const emptyState = document.getElementById("empty-state");
    const quizScene = document.getElementById("quiz-scene");
    const controls = document.getElementById("controls");
    const questionText = document.getElementById("question-text");
    const optionsGrid = document.getElementById("options-grid");
    const nextBtn = document.getElementById("next-btn");
    const scoreDisplay = document.getElementById("score-display");

    let allFlashcards = [];
    let currentLang = "sk";
    
    let currentQuestionCard = null;
    let questionsAnswered = 0;
    let correctAnswers = 0;
    
    // Load Data
    chrome.storage.local.get({ flashcards: [], appLanguage: "sk" }, (result) => {
        allFlashcards = result.flashcards;
        currentLang = result.appLanguage;
        
        applyTranslations();
        
        if (allFlashcards.length < 4) {
            quizScene.style.display = "none";
            controls.style.display = "none";
            emptyState.style.display = "block";
        } else {
            updateScoreDisplay();
            loadNextQuestion();
        }
    });

    function getStr(key) {
        return i18n[currentLang] && i18n[currentLang][key] ? i18n[currentLang][key] : key;
    }

    function applyTranslations() {
        if (typeof i18n === 'undefined') return;
        const dict = i18n[currentLang];
        if (!dict) return;

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                el.innerText = dict[key];
            }
        });
        document.title = getStr("quizTitle");
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `${getStr("scoreText")}${correctAnswers}/${questionsAnswered}`;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function loadNextQuestion() {
        nextBtn.style.display = "none";
        optionsGrid.innerHTML = "";
        
        // Pick random question
        const qIndex = Math.floor(Math.random() * allFlashcards.length);
        currentQuestionCard = allFlashcards[qIndex];
        
        questionText.textContent = currentQuestionCard.question;
        
        // Pick 3 wrong answers
        let wrongOptions = [];
        let availableWrong = allFlashcards.filter((c, i) => i !== qIndex);
        shuffleArray(availableWrong);
        
        for (let i = 0; i < 3 && i < availableWrong.length; i++) {
            wrongOptions.push(availableWrong[i].answer);
        }
        
        let allOptions = [...wrongOptions, currentQuestionCard.answer];
        shuffleArray(allOptions);
        
        allOptions.forEach(optText => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = optText;
            btn.addEventListener("click", () => handleAnswer(btn, optText === currentQuestionCard.answer));
            optionsGrid.appendChild(btn);
        });
    }

    function handleAnswer(clickedBtn, isCorrect) {
        const allBtns = optionsGrid.querySelectorAll(".option-btn");
        allBtns.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === currentQuestionCard.answer) {
                btn.classList.add("correct");
            }
        });
        
        if (!isCorrect) {
            clickedBtn.classList.add("wrong");
        } else {
            correctAnswers++;
        }
        
        questionsAnswered++;
        updateScoreDisplay();
        
        nextBtn.style.display = "block";
    }

    nextBtn.addEventListener("click", loadNextQuestion);
});
