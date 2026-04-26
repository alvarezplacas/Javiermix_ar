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
        // Precargar sonidos ligeros (usando URLs de recursos públicos o placeholders)
        // Nota: En un entorno real, estos archivos deberían existir en /public/audio/
        this.load('hover', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); // Sutil click/pop
        this.load('transition', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Woosh suave
        this.load('ambient', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Solo ejemplo, debería ser un loop ambiente
    }

    private load(name: string, url: string) {
        const audio = new Audio(url);
        audio.volume = 0.2;
        this.sounds.set(name, audio);
    }

    enable() {
        this.enabled = true;
        // Iniciar ambiente si es necesario
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
            sound.play().catch(() => { /* Autoplay block */ });
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
