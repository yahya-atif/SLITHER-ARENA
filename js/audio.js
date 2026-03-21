/**
 * SLITHER ARENA – Audio Manager (Robust Version)
 * Handles audio without blocking game execution.
 */

const AudioManager = {
    sounds: {},
    music: null,
    isInitialized: false,
    hasError: false,

    // Define sound assets (Recommended: Use local files in /assets/audio/ to avoid browser blocking)
    ASSETS: {
        eat: 'assets/audio/eat.mp3',
        boost: 'assets/audio/boost.mp3',
        death: 'assets/audio/death.mp3',
        click: 'assets/audio/click.mp3',
        pause: 'assets/audio/pause.mp3',
        resume: 'assets/audio/resume.mp3',
        music: 'assets/audio/music.mp3'
        
        /* Fallback URLs (May be blocked by browser security if running from file://)
        eat: 'https://cdn.pixabay.com/audio/2022/03/15/audio_783a4a7515.mp3',
        boost: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8de30422d.mp3',
        death: 'https://cdn.pixabay.com/audio/2021/08/09/audio_88444a6820.mp3',
        click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73484.mp3',
        pause: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73484.mp3',
        resume: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73484.mp3',
        music: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d19c67eb0a.mp3'
        */
    },

    init() {
        if (this.isInitialized) return;
        
        console.log("🎵 Initializing Audio System...");
        
        try {
            // Preload sound effects - NON-BLOCKING
            for (const [name, url] of Object.entries(this.ASSETS)) {
                try {
                    if (name === 'music') {
                        this.music = new Audio();
                        this.music.src = url;
                        this.music.loop = true;
                        this.music.volume = 0.3;
                        this.music.preload = 'none'; // Don't block loading
                    } else {
                        const audio = new Audio();
                        audio.src = url;
                        audio.preload = 'metadata'; // Just enough to know it exists
                        this.sounds[name] = audio;
                    }
                } catch (assetError) {
                    console.warn(`⚠️ Could not load asset '${name}':`, assetError);
                }
            }
            this.isInitialized = true;
            console.log("✅ Audio System Initialized (In background).");
        } catch (error) {
            console.error("❌ Audio System Critical Failure (Game will continue without sound):", error);
            this.isInitialized = true; // Mark as "done" so it doesn't try again and fail
            this.hasError = true;
        }
    },

    playSound(name) {
        // Safe check for settings
        const isSoundOn = typeof gameSettings !== 'undefined' ? gameSettings.sound : true;
        if (!isSoundOn) return;
        
        if (!this.isInitialized) this.init();
        if (!this.sounds[name]) return;

        try {
            const soundClone = this.sounds[name].cloneNode();
            soundClone.volume = (name === 'boost') ? 0.15 : 0.4;
            
            const playPromise = soundClone.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Silently ignore browser blocking
                });
            }
        } catch (e) {
            // Complete silence on errors to prevent game crash
        }
    },

    playMusic() {
        const isMusicOn = typeof gameSettings !== 'undefined' ? gameSettings.music : true;
        if (!isMusicOn) return;

        if (!this.isInitialized) this.init();
        if (!this.music) return;
        
        try {
            const playPromise = this.music.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn("⚠️ Music playback was prevented by the browser. Click required.");
                });
            }
        } catch (e) {
            console.error("❌ Music play error:", e);
        }
    },

    pauseMusic() {
        try {
            if (this.music) this.music.pause();
        } catch (e) {}
    },

    resumeMusic() {
        const isMusicOn = typeof gameSettings !== 'undefined' ? gameSettings.music : true;
        if (!isMusicOn) return;

        try {
            if (this.music) this.music.play().catch(() => {});
        } catch (e) {}
    },

    stopMusic() {
        try {
            if (this.music) {
                this.music.pause();
                this.music.currentTime = 0;
            }
        } catch (e) {}
    },

    updateFromSettings() {
        if (typeof gameSettings === 'undefined') return;

        if (!gameSettings.music) {
            this.stopMusic();
        } else if (typeof gameRunning !== 'undefined' && gameRunning && (typeof gamePaused === 'undefined' || !gamePaused)) {
            this.playMusic();
        }
    }
};
