const game = document.getElementById("game");
const keys = document.querySelectorAll(".key");
const closeMenuBtns = document.querySelectorAll(".close-icon");
const wordLengthBtns = document.querySelectorAll(".len-option");
const playAgainBtns = document.querySelectorAll(".play-again-btn");
const settingToggleBtns = document.querySelectorAll(".toggle-switch");

const gameOverPopup = document.getElementById("game-over");
const wordRevealEl = document.getElementById("word");
const wordNotFoundPopup = document.getElementById("not-found");
const settingsBtn = document.getElementById("settings-icon");
const settingsMenu = document.getElementById("settings-menu");
const gameWonPopup = document.getElementById("game-won");
const helpMenu = document.getElementById("help-menu");
const helpBtn = document.getElementById("help-icon");

let wordLength = 5;
let lettersEntered = 0;
let guesses = 0;
const totalGuesses = 6;

let word;

initializeGame(wordLength);

window.addEventListener("keydown", (e) => {
    if (e.keyCode >= 65 && e.keyCode <= 90) return enterLetter(e.key);
    if (e.key === 'Backspace') return deleteLetter();
    if (e.key === 'Enter') return guessWord();
})

keys.forEach(key => {
    key.addEventListener("click", () => {
        if (key.classList.contains('letter')) return enterLetter(key.textContent);
        if (key.classList.contains('delete')) return deleteLetter();
        if (key.classList.contains('enter')) return guessWord();
    });
});

settingsBtn.addEventListener("click", () => {
    if (!helpMenu.classList.contains('no-display'))
        helpMenu.classList.add("no-display");
    settingsMenu.classList.remove("no-display");
});

helpBtn.addEventListener("click", () => {
    if (!settingsMenu.classList.contains('no-display'))
        settingsMenu.classList.add("no-display");
    helpMenu.classList.remove("no-display");
});

playAgainBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        initializeGame(wordLength);
        const popup = btn.parentNode;
        popup.classList.add("no-display");
    });
});

wordLengthBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        initializeGame(parseInt(btn.textContent));
        wordLengthBtns.forEach(btn => btn.classList.remove("bg-green"));
        btn.classList.add("bg-green");
    });
})

closeMenuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const menu = btn.parentNode.parentNode;
        menu.classList.add("no-display");
    })
});

settingToggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("switch-on");

        if (btn.getAttribute("data-action") === 'theme') {
            const root = document.documentElement;
            if (root.hasAttribute("data-theme")) {
                root.removeAttribute("data-theme");
                return;
            }
            root.setAttribute("data-theme", "dark");
        }
    });
});

async function initializeGame(len) {
    lettersEntered = 0;
    guesses = 0;
    wordLength = len;
    createGame(len);
    word = await getRandomWord(len);
}

function createGame(wordLength) {
    game.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const gameRow = document.createElement('div');
        gameRow.classList.add('game-row');
        for (let j = 0; j < wordLength; j++) {
            const box = document.createElement("div");
            box.classList.add('game-box');
            gameRow.append(box);
        }
        game.append(gameRow);
    }
}

function enterLetter(key) {
    let box = game.children[guesses].children[lettersEntered];
    if (lettersEntered < wordLength) {
        box.classList.add("box-filled");
        box.textContent = key.toUpperCase();
        lettersEntered++;
    }
}

function deleteLetter() {
    if (lettersEntered === 0)
        return;
    lettersEntered--;
    let box = game.children[guesses].children[lettersEntered];
    box.innerHTML = '';
    box.classList.remove("box-filled");
}

async function guessWord() {
    if (!(lettersEntered === wordLength))
        return;

    let guessRow = game.children[guesses];
    let guessedWord = '';
    guessRow.childNodes.forEach(el => guessedWord += el.textContent);

    if (!(await checkWord(guessedWord))) {
        wordNotFoundPopup.classList.remove("no-display");
        await setTimeout(() => wordNotFoundPopup.classList.add("no-display"), 2000);
        return;
    }
    
    let yellowLetters = '';
    for (let i = 0; i < wordLength; i++) {
        const box = guessRow.children[i];
        box.classList.add("guessed");
        if (box.textContent === word[i]) {
            box.classList.add("bg-green");
            continue;
        }
        yellowLetters += word[i];
    }

    if (guessedWord === word) {
        gameWonPopup.classList.remove("no-display");
        return;
    }

    for (let letter of yellowLetters) {
        for (let i = 0; i < wordLength; i++) {
            let box = guessRow.children[i];
            if (letter === guessedWord[i] && !box.classList.contains("bg-green") && !box.classList.contains("bg-yellow")) {
                box.classList.add("bg-yellow");
                break;
            }
        }
    }
    
    guesses++;
    lettersEntered = 0;

    if (guesses >= totalGuesses) {
        gameOverPopup.classList.remove("no-display");
        wordRevealEl.textContent = word;
        return;
    }
}

function displayPopup(popup) {
    popup.classList.remove("no-display");
}

async function getRandomWord(len) {
    let apiURL = `https://random-word-api.herokuapp.com/word?length=${len}`;
    const res = await fetch(apiURL);
    const word = (await res.json())[0].toUpperCase();
    if (await checkWord(word))
        console.log(word);
        return word;

    return (await getRandomWord(len));
}

async function checkWord(word) {
    let apiURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const res = await fetch(apiURL);
    const data = await res.ok;
    return data;
}
