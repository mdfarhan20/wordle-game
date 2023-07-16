const game = document.getElementById("game");
const keys = document.querySelectorAll(".key");

let wordLength = 5;
let lettersEntered = 0;
let guesses = 0;
const totalGuesses = 6;

const word = "SHARK";

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

function initializeGame(wordLength) {
    createGame(wordLength);
}

function createGame(wordLength) {
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
    box.classList.add("box-filled");
    if (lettersEntered < wordLength) {
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

function guessWord() {
    if (!(lettersEntered === wordLength) || guesses >= totalGuesses)
        return;

    let guessRow = game.children[guesses];
    for (let i = 0; i < wordLength; i++) {
        const box = guessRow.children[i];
        box.classList.add("guessed");
        if (box.textContent === word[i])
            box.classList.add("bg-green")
    }

    for (let letter of word) {
        let guessedWord = '';
        guessRow.childNodes.forEach(el => guessedWord += el.textContent);
        
        if (guessedWord.includes(letter)) {
            let box = guessRow.children[guessedWord.indexOf(letter)];
            if (!box.classList.contains("bg-green") && !box.classList.contains("bg-yellow"))
                box.classList.add("bg-yellow");
        }
    }

    guesses++;
    lettersEntered = 0;
}


