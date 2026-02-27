# Recallify — Simple Flashcards

A powerful Chrome extension for creating AI-powered flashcards from any text content on a web page. Learn directly from the web with intelligent question-answer generation.

> **Available in:** English 🇬🇧 | Slovak 🇸🇰

---

## 📋 Table of Contents

- [English](#english-)
- [Slovak / Slovenčina](#slovak--slovenčina-)

---

## English 🇬🇧

### 🎯 Features

- **AI-Powered Flashcard Generation** - Automatically generate study flashcards from selected web text using Google Gemini AI
- **Smart Categorization** - AI creates relevant category names for your flashcards
- **Context Menu Integration** - Simply select text and create a flashcard in one click
- **Category Management** - Organize flashcards by categories
- **Study Mode** - Dedicated study interface with keyboard navigation
- **Dashboard** - View all your flashcards organized by category
- **Persistent Storage** - All flashcards saved locally in browser storage
- **Bilingual Support** - Use the extension in English or Slovak
- **Notifications** - Real-time feedback on flashcard creation status

### 📦 Prerequisites

- Google Chrome or Chromium-based browser
- A free Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 🚀 Installation

1. **Clone or download** this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the project folder
6. The Recallify extension will appear in your Chrome toolbar

### 🔑 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select or create a Google Cloud project
4. Copy your API key
5. In the Recallify extension popup, click the ⚙️ **Settings button**
6. Paste your API key in the input field
7. Click **Save Key**

> **Note:** Your API key is stored locally in your browser and never sent to external servers (except Google's Gemini API for processing).

### 📖 Usage

#### Creating Flashcards

1. Select any text on a web page
2. Right-click and choose **"Recallify — Vytvoriť kartu"** (Create Card)
3. The AI will process the text and create a flashcard with:
   - **Question** - Key concept to study
   - **Answer** - Detailed explanation
   - **Category** - Automatically assigned topic

#### Studying

1. Click the Recallify extension icon → **"Study All"** button (or study a specific category)
2. Navigate cards with:
   - **Arrow keys** (← →) or buttons
   - **Spacebar/Enter** to flip cards
3. Review questions and answers at your own pace

#### Managing Flashcards

1. Open the **Dashboard** (via popup → fullscreen button)
2. Click on any category to see its flashcards
3. **Edit cards** - Click the pencil icon to modify questions, answers, or categories
4. **Delete cards** - Use the clear button to remove all flashcards

### 🎨 Features in Detail

- **Real-time Notifications** - Get instant feedback when flashcards are created
- **Keyboard Navigation** - Study efficiently without touching the mouse
- **Empty State Handling** - Clear UI for getting started
- **Language Persistence** - Your language choice is remembered
- **Responsive Design** - Works on different screen sizes

### 🛠️ Project Structure

```
simple-flashcards/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (AI processing)
├── popup.html/js/css       # Main popup interface
├── dashboard.html/js/css   # Full-screen dashboard
├── study.html/js/css       # Study mode interface
├── landing/                # Landing page files
├── translations.js         # Multi-language support
└── README.md              # This file
```

### 📝 License

This project is open source. Feel free to use, modify, and distribute.

---

## Slovak 🇸🇰

### 🎯 Funkcie

- **AI-poháňaná generácia flash kariet** - Automaticky generujte študijné flash karty z vybraného textu na webe pomocou AI Gemini
- **Inteligentná kategorizácia** - AI vytvorí relevantné názvy kategórií pre vaše flash karty
- **Integrácia do kontextovej ponuky** - Stačí vybrať text a vytvoriť flash kartu jedným kliknutím
- **Správa kategórií** - Organizujte flash karty podľa kategórií
- **Študijný režim** - Vyhradené rozhranie na študovanie s navigáciou cez klávesnicu
- **Ovládací panel** - Pozrite si všetky svoje flash karty organizované podľa kategórií
- **Trvalé úložisko** - Všetky flash karty sú uložené lokálne v úložisku prehliadača
- **Dvojjazyčná podpora** - Používajte rozšírenie v angličtine alebo slovenčine
- **Upozornenia** - Spätná väzba v reálnom čase na stav vytvárania flash kariet

### 📦 Požiadavky

- Google Chrome alebo prehliadač na báze Chromium
- Bezplatný API kľúč Google Gemini ([Získajte ho tu](https://aistudio.google.com/app/apikey))

### 🚀 Inštalácia

1. **Klonujte alebo stiahnite** toto úložisko
2. Otvorte Chrome a prejdite na `chrome://extensions/`
3. Zapnite **Vývojársky režim** (prepínač v pravom hornom rohu)
4. Kliknite na **Načítať rozbalenú položku**
5. Vyberte priečinok projektu
6. Rozšírenie Recallify sa objaví na paneli vášho prehliadača Chrome

### 🔑 Získanie API kľúča Gemini

1. Navštívte [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Kliknite na **"Create API Key"** (Vytvoriť API kľúč)
3. Vyberte alebo vytvorte projekt Google Cloud
4. Skopírujte svoj API kľúč
5. V popup okne rozšírenia Recallify kliknite na tlačidlo **⚙️ Nastavenia**
6. Prilepte svoj API kľúč do poľa na zadávanie
7. Kliknite na **Uložiť kľúč**

> **Poznámka:** Váš API kľúč je uložený lokálne vo vašom prehliadači a nikdy sa neposiela na externé servery (okrem API servera Google Gemini na spracovanie).

### 📖 Použitie

#### Vytváranie flash kariet

1. Vyberte ľubovoľný text na webovej stránke
2. Kliknite pravým tlačidlom a vyberte **"Recallify — Vytvoriť kartu"**
3. AI spracuje text a vytvorí flash kartu s:
   - **Otázka** - Kľúčový koncept na študovanie
   - **Odpoveď** - Podrobné vysvetlenie
   - **Kategória** - Automaticky priradená téma

#### Študovanie

1. Kliknite na ikonu rozšírenia Recallify → tlačidlo **"Študovať všetko"** (alebo študujte konkrétnu kategóriu)
2. Navigujte karty pomocou:
   - **Klávesy so šípkami** (← →) alebo tlačidiel
   - **Mezerník/Enter** na otočenie karty
3. Prehliadajte si otázky a odpovede vlastným tempom

#### Správa flash kariet

1. Otvorte **Ovládací panel** (cez popup → tlačidlo celoobrazovky)
2. Kliknite na ľubovoľnú kategóriu a pozrite si jej flash karty
3. **Úprava kariet** - Kliknite na ikonu tužky a upravte otázky, odpovede alebo kategórie
4. **Odstránenie kariet** - Použite tlačidlo vymazania na odstránenie všetkých flash kariet

### 🎨 Funkcie v podrobnostiach

- **Upozornenia v reálnom čase** - Získajte okamžitú spätnu väzbu pri vytváraní flash kariet
- **Navigácia cez klávesnicu** - Študujte efektívne bez dotyknutia myši
- **Spracovanie prázdneho stavu** - Jasné rozhranie na začatie práce
- **Trvalosť jazyka** - Váš výber jazyka je zapamätaný
- **Responzívny dizajn** - Funguje na rôznych veľkostiach obrazovky

### 🛠️ Štruktúra projektu

```
simple-flashcards/
├── manifest.json           # Konfigurácia rozšírenia
├── background.js           # Service worker (spracovanie AI)
├── popup.html/js/css       # Hlavné rozhranie popup okna
├── dashboard.html/js/css   # Ovládací panel v režime celej obrazovky
├── study.html/js/css       # Rozhranie študijného režimu
├── landing/                # Súbory vstupnej stránky
├── translations.js         # Podpora viacerých jazykov
└── README.md               # Tento súbor
```

### 📝 Licencia

Tento projekt je open source. Môžete ho voľne používať, upravovať a distribuovať.

---

**Made with ❤️ for learners everywhere**
