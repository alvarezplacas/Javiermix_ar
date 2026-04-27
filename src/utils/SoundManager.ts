// d:\web_javiermix\JAVIERMIX-AR-0504\src\utils\SoundManager.ts

class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = false;

    private constructor() {}

    static getInstance() {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    init() {
        // Precargar sonidos ligeros
        this.load('hover', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); 
        this.load('transition', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); 
    }

    private load(name: string, url: string) {
        const audio = new Audio(url);
        audio.volume = 0.2;
        this.sounds.set(name, audio);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.stopAll();
    }

    play(name: string, volume: number = 0.2) {
        if (!this.enabled) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.currentTime = 0;
            sound.volume = volume;
            sound.play().catch(() => {});
        }
    }

    playMusic(url: string) {
        if (!this.enabled) return;
        
        // Si ya está sonando la misma URL, no reiniciar
        const currentMusic = this.sounds.get('music');
        if (currentMusic && currentMusic.src === url && !currentMusic.paused) {
            return;
        }

        if (currentMusic) {
            // Fade out sutil antes de cambiar
            const fadeOut = setInterval(() => {
                if (currentMusic.volume > 0.02) {
                    currentMusic.volume -= 0.02;
                } else {
                    currentMusic.pause();
                    clearInterval(fadeOut);
                    this.startNewTrack(url);
                }
            }, 50);
        } else {
            this.startNewTrack(url);
        }
    }

    private startNewTrack(url: string) {
        const music = new Audio(url);
        music.loop = true;
        music.volume = 0; // Empezar en silencio para fade in
        this.sounds.set('music', music);
        music.play().catch(() => {});
        
        // Fade in
        const fadeIn = setInterval(() => {
            if (music.volume < 0.15) {
                music.volume += 0.01;
            } else {
                music.volume = 0.15;
                clearInterval(fadeIn);
            }
        }, 100);
    }

    stopMusic() {
        const music = this.sounds.get('music');
        if (music) {
            music.pause();
            music.currentTime = 0;
        }
    }

    stopAll() {
        this.sounds.forEach(s => {
            s.pause();
            s.currentTime = 0;
        });
    }
}

export const soundManager = SoundManager.getInstance();
