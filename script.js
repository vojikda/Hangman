// Word lists for different difficulties
const wordLists = {
    easy: [
        'APPLE', 'BEACH', 'CLOUD', 'DREAM', 'EARTH',
        'FLAME', 'GREEN', 'HEART', 'JUICE', 'KNIFE',
        'LIGHT', 'MUSIC', 'NIGHT', 'OCEAN', 'PEACE'
    ],
    medium: [
        'BANANA', 'CASTLE', 'DRAGON', 'EAGLE', 'FLOWER',
        'GARDEN', 'HAPPY', 'ISLAND', 'JUNGLE', 'KITTEN',
        'LION', 'MONKEY', 'NATURE', 'OCEAN', 'PENGUIN'
    ],
    hard: [
        'ADVENTURE', 'BEAUTIFUL', 'CHALLENGE', 'DANGEROUS',
        'ELEPHANT', 'FANTASTIC', 'GENERATOR', 'HAPPINESS',
        'IMPORTANT', 'JOURNEY', 'KNOWLEDGE', 'LANGUAGE'
    ]
};

// Game state
let currentWord = '';
let guessedLetters = new Set();
let remainingAttempts = 6;
let gameOver = false;
let currentDifficulty = 'medium';
let gameTimer = null;
let seconds = 0;
let hintsLeft = 3;
let stats = {
    gamesPlayed: 0,
    wins: 0,
    highScore: 0
};

// DOM elements
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');
const hintBtn = document.getElementById('hint-btn');
const bodyParts = document.querySelectorAll('.body-part');
const difficultyContainer = document.getElementById('difficulty-container');
const gameContainer = document.getElementById('game-container');
const timerDisplay = document.getElementById('timer');
const gamesPlayedDisplay = document.getElementById('games-played');
const winsDisplay = document.getElementById('wins');
const winRateDisplay = document.getElementById('win-rate');
const highScoreDisplay = document.getElementById('high-score');

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('hangmanStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
        updateStatsDisplay();
    }
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('hangmanStats', JSON.stringify(stats));
}

// Update stats display
function updateStatsDisplay() {
    gamesPlayedDisplay.textContent = stats.gamesPlayed;
    winsDisplay.textContent = stats.wins;
    winRateDisplay.textContent = stats.gamesPlayed > 0 
        ? Math.round((stats.wins / stats.gamesPlayed) * 100) + '%'
        : '0%';
    highScoreDisplay.textContent = stats.highScore;
}

// Start timer
function startTimer() {
    seconds = 0;
    updateTimerDisplay();
    gameTimer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

// Update timer display
function updateTimerDisplay() {
    timerDisplay.textContent = `Time: ${seconds}s`;
}

// Initialize the game
function initGame() {
    // Reset game state
    currentWord = wordLists[currentDifficulty][Math.floor(Math.random() * wordLists[currentDifficulty].length)];
    guessedLetters.clear();
    remainingAttempts = getMaxAttempts();
    gameOver = false;
    hintsLeft = 3;
    
    // Reset UI
    updateWordDisplay();
    updateAttemptsDisplay();
    message.textContent = `Guess the word! You have ${remainingAttempts} attempts.`;
    message.style.color = '#1a73e8';
    bodyParts.forEach(part => part.style.display = 'none');
    hintBtn.textContent = `Hint (${hintsLeft} left)`;
    hintBtn.disabled = false;
    
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

    // Start timer
    startTimer();
}

// Get max attempts based on difficulty
function getMaxAttempts() {
    switch(currentDifficulty) {
        case 'easy': return 8;
        case 'hard': return 4;
        default: return 6;
    }
}

// Update attempts display
function updateAttemptsDisplay() {
    message.textContent = `Remaining attempts: ${remainingAttempts}`;
    if (remainingAttempts <= 2) {
        message.style.color = '#f44336';
        message.classList.add('warning');
    } else {
        message.style.color = '#1a73e8';
        message.classList.remove('warning');
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
        bodyParts[getMaxAttempts() - remainingAttempts].style.display = 'block';
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
    stopTimer();
    
    // Update stats
    stats.gamesPlayed++;
    if (won) {
        stats.wins++;
        const score = calculateScore();
        if (score > stats.highScore) {
            stats.highScore = score;
        }
        message.textContent = `Congratulations! You won! 🎉 Score: ${score}`;
        message.style.color = '#4caf50';
    } else {
        message.textContent = `Game Over! You ran out of attempts. The word was ${currentWord} 😢`;
        message.style.color = '#f44336';
    }
    
    saveStats();
    updateStatsDisplay();
}

// Calculate score
function calculateScore() {
    const baseScore = 1000;
    const timePenalty = seconds * 10;
    const attemptsBonus = remainingAttempts * 100;
    return Math.max(0, baseScore - timePenalty + attemptsBonus);
}

// Handle hint
function handleHint() {
    if (hintsLeft > 0 && !gameOver) {
        const unguessedLetters = currentWord
            .split('')
            .filter(letter => !guessedLetters.has(letter));
        
        if (unguessedLetters.length > 0) {
            const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            handleGuess(randomLetter);
            hintsLeft--;
            hintBtn.textContent = `Hint (${hintsLeft} left)`;
            if (hintsLeft === 0) {
                hintBtn.disabled = true;
            }
        }
    }
}

// Handle difficulty selection
function handleDifficultySelection(difficulty) {
    currentDifficulty = difficulty;
    difficultyContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    initGame();
}

// Event listeners
newGameBtn.addEventListener('click', () => {
    difficultyContainer.style.display = 'block';
    gameContainer.style.display = 'none';
});

hintBtn.addEventListener('click', handleHint);

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleDifficultySelection(btn.dataset.difficulty);
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (!gameOver) {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
            const keyElement = Array.from(keyboard.children).find(k => k.textContent === key);
            if (keyElement && !keyElement.classList.contains('used')) {
                keyElement.click();
            }
        }
    }
});

// Load stats and show difficulty selection
loadStats();
difficultyContainer.style.display = 'block';
gameContainer.style.display = 'none'; 