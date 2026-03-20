// ================================================
//  SLITHER ARENA – Settings Management & UI
// ================================================

// Default Settings Object
let gameSettings = {
    sound: true,
    music: true,
    showFPS: true,
    graphics: 'medium', // 'low', 'medium', 'high'
    sensitivity: 1.0
};

// ============ INITIALIZATION ============
function initSettings() {
    loadSettings();
    setupSettingsListeners();
    applyAllSettings();
}

// ============ STORAGE ============
function loadSettings() {
    const saved = localStorage.getItem('slither_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameSettings = { ...gameSettings, ...parsed };
        } catch (e) {
            console.error("Failed to parse settings:", e);
        }
    }
}

function saveSettings() {
    localStorage.setItem('slither_settings', JSON.stringify(gameSettings));
}

// ============ UI LOGIC ============
function setupSettingsListeners() {
    // DOM Elements
    const modal = document.getElementById('settings-modal');
    const triggerBtns = document.querySelectorAll('.settings-trigger-btn');
    const closeBtn = document.getElementById('settings-close-btn');
    const saveBtn = document.getElementById('settings-save-btn');
    const overlay = modal.querySelector('.modal-overlay');

    // Toggles
    const soundToggle = document.getElementById('set-sound');
    const musicToggle = document.getElementById('set-music');
    const fpsToggle = document.getElementById('set-fps');
    const sensitivityRange = document.getElementById('set-sensitivity');

    // Quality Buttons
    const qualityBtns = document.querySelectorAll('.quality-btn');

    // 1. OPEN MODAL (Target all trigger buttons)
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            updateSettingsUI();
            modal.classList.add('active');
            // Only pause if game is running
            if (typeof gameRunning !== 'undefined' && gameRunning && typeof pauseGame === 'function') {
                pauseGame();
            }
        });
    });

    // 2. CLOSE MODAL (SAVE & RESUME)
    const closeModal = () => {
        modal.classList.remove('active');
        saveSettings();
        applyAllSettings();
        if (typeof resumeGame === 'function') resumeGame();
    };

    closeBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // 3. INPUT LISTENERS
    soundToggle.addEventListener('change', (e) => gameSettings.sound = e.target.checked);
    musicToggle.addEventListener('change', (e) => gameSettings.music = e.target.checked);
    fpsToggle.addEventListener('change', (e) => gameSettings.showFPS = e.target.checked);
    
    sensitivityRange.addEventListener('input', (e) => {
        gameSettings.sensitivity = parseFloat(e.target.value);
    });

    // 4. QUALITY BUTTONS
    qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameSettings.graphics = btn.dataset.value;
            qualityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function updateSettingsUI() {
    document.getElementById('set-sound').checked = gameSettings.sound;
    document.getElementById('set-music').checked = gameSettings.music;
    document.getElementById('set-fps').checked = gameSettings.showFPS;
    document.getElementById('set-sensitivity').value = gameSettings.sensitivity;

    const qualityBtns = document.querySelectorAll('.quality-btn');
    qualityBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === gameSettings.graphics);
    });
}

// ============ ENGINE APPLICATION ============
function applyAllSettings() {
    // 1. FPS Counter
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
        fpsCounter.style.display = gameSettings.showFPS ? 'block' : 'none';
    }

    // 2. Audio (Placeholders for now, but state is tracked)
    if (typeof window.isSoundEnabled !== 'undefined') window.isSoundEnabled = gameSettings.sound;
    if (typeof window.isMusicEnabled !== 'undefined') window.isMusicEnabled = gameSettings.music;

    // 3. Graphics Quality (Affects renderer constants)
    applyGraphicsQuality();
}

function applyGraphicsQuality() {
    // Adjust global limits based on quality
    if (gameSettings.graphics === 'low') {
        window.MAX_PARTICLES = 100;
        window.DRAW_DETAIL_ZOOM = 0.7; // Only draw details when zoomed in close
    } else if (gameSettings.graphics === 'medium') {
        window.MAX_PARTICLES = 300;
        window.DRAW_DETAIL_ZOOM = 0.5;
    } else {
        window.MAX_PARTICLES = 600;
        window.DRAW_DETAIL_ZOOM = 0.3; // Always draw details
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initSettings);
