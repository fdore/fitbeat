const exerciseDurationInput = document.getElementById('exercise-duration');
const repsInput = document.getElementById('reps');
const restDurationInput = document.getElementById('rest-duration');
const timerDisplay = document.querySelector('.timer-display');
const repsDisplay = document.querySelector('.reps-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

let audioCtx;

function playTick() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}

function playEndSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}

let timerId;
let currentState = 'idle'; // idle, warmup, exercise, rest
let currentRep = 0;
let remainingTime = 0;

let exerciseDuration = parseInt(exerciseDurationInput.value);
let reps = parseInt(repsInput.value);
let restDuration = parseInt(restDurationInput.value);

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingTime);
    if (currentState === 'idle') {
        repsDisplay.textContent = '';
    } else if (currentState === 'warmup') {
        repsDisplay.textContent = 'Warmup';
    } else {
        repsDisplay.textContent = `Round ${currentRep} / ${reps}`;
    }
}

function tick() {
    updateDisplay();

    if (remainingTime === 0) {
        playEndSound();

        if (currentState === 'warmup') {
            currentState = 'exercise';
            currentRep = 1;
            remainingTime = exerciseDuration;
            timerDisplay.classList.remove('timer-display--warmup');
        } else if (currentState === 'exercise') {
            if (currentRep >= reps) {
                stopTimer();
                timerDisplay.textContent = "Done!";
                repsDisplay.textContent = '';
                timerDisplay.classList.remove('timer-display--rest');
                return;
            }
            currentState = 'rest';
            remainingTime = restDuration;
            timerDisplay.classList.add('timer-display--rest');
        } else if (currentState === 'rest') {
            currentRep++;
            currentState = 'exercise';
            remainingTime = exerciseDuration;
            timerDisplay.classList.remove('timer-display--rest');
        }
        updateDisplay();
    } else {
        playTick();
    }

    remainingTime--;
}

function startTimer() {
    if (currentState === 'idle') {
        exerciseDuration = parseInt(exerciseDurationInput.value);
        reps = parseInt(repsInput.value);
        restDuration = parseInt(restDurationInput.value);

        currentState = 'warmup';
        remainingTime = 7;
        timerDisplay.classList.add('timer-display--warmup');
        updateDisplay();
    }

    timerId = setInterval(tick, 1000);
    startBtn.disabled = true;
}

function stopTimer() {
    clearInterval(timerId);
    startBtn.disabled = false;
}

function resetTimer() {
    stopTimer();
    currentState = 'idle';
    currentRep = 0;
    remainingTime = parseInt(exerciseDurationInput.value);
    timerDisplay.classList.remove('timer-display--rest');
    timerDisplay.classList.remove('timer-display--warmup');
    updateDisplay();
}

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display
resetTimer();

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service worker registered'))
            .catch(err => console.log(`Service Worker Error: ${err}`))
    })
}
