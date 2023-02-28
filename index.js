const WORD_URL = 'https://words.dev-apis.com/word-of-the-day'
const VALIDATION_URL = 'https://words.dev-apis.com/validate-word'
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

const loadingDiv = document.querySelector(".info-bar")
const letters = document.querySelectorAll(".char-field")
const isLoading = setLoading(true);
const board = document.getElementsByClassName("board")[0];

async function init() {
    const answer = await getWordOfTheDay();
    setLoading(false);
    const answerParts = answer.split(""); 
    let currentGuess = '';
    let currentRow = 0;
    let done = false;

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            // add letter to the end
            currentGuess += letter;
        } else {
            // replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter
        console.log("currentGuess: " + currentGuess)
    }    
    
    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return;
        }

        setLoading(true)
        const res = await fetch(VALIDATION_URL, {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        })

        const resObj = await res.json();
        const { validWord } = resObj;
        setLoading(false);

        if (!validWord) {
            markInvalid();
            return;
        }

        // Mark letters as "correct", "close", or "wrong"
        const guessParts = currentGuess.split("");
        const map = makeMap(answerParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === answerParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            } 
        }
            
        for (let j = 0; j < ANSWER_LENGTH; j++) {
            if (answerParts.includes(guessParts[j] && map[guessParts[j]] >= 1)) {
                letters[currentRow * ANSWER_LENGTH + j].classList.add("close");
            } else {
                letters[currentRow * ANSWER_LENGTH + j].classList.add("wrong");
            }
        }

        // Check for winner
        if (currentGuess === answer) {
            alert(`You Win!!!`)
            document.querySelector(".brand").classList.add("winner");
            done = true;
            return;
        }
    
        currentRow++;
        currentGuess = '';

        // Check for remaining attempts
        if (currentRow === ROUNDS) {
            alert(`You lose. The word was ${answer}`);
            done = true;
        } else {
            console.log(letters[ANSWER_LENGTH * (currentRow)])
            letters[ANSWER_LENGTH * (currentRow)].focus();
        }

        // return res
    }    

    function backspace() {
        let target = letters[ANSWER_LENGTH * currentRow + currentGuess.length]
        console.log(target)
        if (target !== letters[ANSWER_LENGTH * currentRow] && target.innerText.length === 0) {
            target.previousElementSibling.focus();
        }
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalid(row) {
        for (let k = 0; k < ANSWER_LENGTH; k++) {
            letters[currentRow * ANSWER_LENGTH + k].classList.remove("invalid");

            setTimeout(function () {
                letters[currentRow * ANSWER_LENGTH + k].classList.add("invalid");
            }, 10);
        }
    }    

    document.addEventListener('keydown', function handleKeyPress (event) {
        if (done || isLoading) {
            return;
        }

        const action = event.key;

        console.log(action)
        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            // do nothing
        }
    })
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

async function getWordOfTheDay() {
    const res = await fetch(WORD_URL);
    const { word } = await res.json();
    return word.toUpperCase();
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('visible', isLoading)
}

function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj
}

init();