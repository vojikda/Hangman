// List of words for the game (max 6 letters)
const words = [
    'APPLE',
    'BEACH',
    'CLOUD',
    'DREAM',
    'EARTH',
    'FLAME',
    'GREEN',
    'HEART',
    'JUICE',
    'KNIFE',
    'LIGHT',
    'MUSIC',
    'NIGHT',
    'OCEAN',
    'PEACE',
    'QUEEN',
    'RIVER',
    'SMILE',
    'TIGER',
    'VOICE',
    'WATER',
    'YOUTH',
    'ZEBRA'
];

// Game state
let currentWord = '';
let guessedLetters = new Set();
let remainingAttempts = 6;
let gameOver = false;

// DOM elements
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');
const bodyParts = document.querySelectorAll('.body-part');

// Initialize the game
function initGame() {
    // Reset game state
    currentWord = words[Math.floor(Math.random() * words.length)];
    guessedLetters.clear();
    remainingAttempts = 6;
    gameOver = false;
    
    // Reset UI
    updateWordDisplay();
    updateAttemptsDisplay();
    message.textContent = 'Guess the word! You have 6 attempts.';
    message.style.color = '#1a73e8';
    bodyParts.forEach(part => part.style.display = 'none');
    
    // Create keyboard
    keyboard.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = letter;
        key.addEventListener('click', () => handleGuess(letter));
        keyboard.appendChild(key);
    }
}

// Update attempts display
function updateAttemptsDisplay() {
    message.textContent = `Remaining attempts: ${remainingAttempts}`;
    if (remainingAttempts <= 2) {
        message.style.color = '#f44336';
    } else {
        message.style.color = '#1a73e8';
    }
}

// Handle letter guess
function handleGuess(letter) {
    if (gameOver || guessedLetters.has(letter)) return;
    
    guessedLetters.add(letter);
    const key = Array.from(keyboard.children).find(k => k.textContent === letter);
    key.classList.add('used');
    
    if (currentWord.includes(letter)) {
        // Correct guess
        updateWordDisplay();
        if (!wordDisplay.textContent.includes('_')) {
            endGame(true);
        }
    } else {
        // Wrong guess
        remainingAttempts--;
        bodyParts[6 - remainingAttempts].style.display = 'block';
        updateAttemptsDisplay();
        
        if (remainingAttempts === 0) {
            endGame(false);
        }
    }
}

// Update word display
function updateWordDisplay() {
    wordDisplay.textContent = currentWord
        .split('')
        .map(letter => guessedLetters.has(letter) ? letter : '_')
        .join(' ');
}

// End game
function endGame(won) {
    gameOver = true;
    if (won) {
        message.textContent = 'Congratulations! You won! 🎉';
        message.style.color = '#4caf50';
    } else {
        message.textContent = `Game Over! You ran out of attempts. The word was ${currentWord} 😢`;
        message.style.color = '#f44336';
    }
}

// Event listeners
newGameBtn.addEventListener('click', initGame);

// Start the game
initGame(); 