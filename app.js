const game = document.getElementById("game");
const keys = document.querySelectorAll(".key");
const gameOverPopup = document.getElementById("game-over");
const wordRevealEl = document.getElementById("word");
const playAgainBtn = document.getElementById("play-again-btn");
const wordNotFoundPopup = document.getElementById("not-found");

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

playAgainBtn.addEventListener("click", () => {
    initializeGame(wordLength);
    gameOverPopup.classList.add("no-display");
});

async function initializeGame(wordLength) {
    guesses = 0;
    lettersEntered = 0;
    word = await getRandomWord(wordLength);
    createGame(wordLength);
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
    
    for (let i = 0; i < wordLength; i++) {
        const box = guessRow.children[i];
        box.classList.add("guessed");
        if (box.textContent === word[i])
            box.classList.add("bg-green")
    }

    for (let letter of word) {
        if (guessedWord.includes(letter)) {
            let box = guessRow.children[guessedWord.indexOf(letter)];
            if (!box.classList.contains("bg-green") && !box.classList.contains("bg-yellow"))
                box.classList.add("bg-yellow");
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
        return word;
    getRandomWord(len);
}

async function checkWord(word) {
    let apiURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const res = await fetch(apiURL);
    const data = await res.ok;
    return data;
}
