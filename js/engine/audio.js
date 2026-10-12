// Gravity Rush - Web Audio Synthesizer & Procedural Music Engine
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;

        this.masterVolume = 0.8;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.6;
        this.isMuted = false;

        // Music sequencer state
        this.isPlayingMusic = false;
        this.musicTempo = 126; // BPM
        this.step = 0;
        this.sequenceTimer = null;
        this.currentWorldTheme = 'city';

        // Lazy initialize upon first user gesture
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            this.ctx = new AudioContextClass();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.initialized = true;

            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn('AudioContext failed to initialize', e);
        }
    }

    ensureContext() {
        if (!this.initialized) {
            this.init();
        } else if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        }
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        }
    }

    setMusicVolume(val) {
        this.musicVolume = Math.max(0, Math.min(1, val));
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // ==========================================
    // SOUND EFFECTS (Synthesized in real-time)
    // ==========================================

    playJump() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.14);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    playLand(speed = 1) {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const intensity = Math.min(Math.max(speed / 10, 0.4), 1.5);
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

        gain.gain.setValueAtTime(0.2 * intensity, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playBounce() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(740, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.26);
    }

    playSpeedBoost() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.25);
        filter.Q.value = 3;

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    playCheckpoint() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const time = now + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time);
            osc.stop(time + 0.32);
        });
    }

    playImpact() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.1);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playBreak() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Crunch noise
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.28, now);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
    }

    playDeath() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;

        // Low heavy boom
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);

        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.45);

        // Distortion noise burst
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        noise.start(now);
    }

    playLevelComplete() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Euphoric futuristic fanfare
        const chord = [
            { f: 440.0, t: 0.00 }, // A4
            { f: 554.37, t: 0.08 }, // C#5
            { f: 659.25, t: 0.16 }, // E5
            { f: 880.0, t: 0.24 }, // A5
            { f: 1108.73, t: 0.34 }, // C#6
            { f: 1318.51, t: 0.46 }  // E6
        ];

        chord.forEach(item => {
            const time = now + item.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, time);

            gain.gain.setValueAtTime(0.22, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time);
            osc.stop(time + 0.65);
        });
    }

    playStar(index = 0) {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const notes = [659.25, 880.0, 1174.66]; // E5, A5, D6
        const freq = notes[index % notes.length];
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.38);
    }

    playButtonClick() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // ==========================================
    // PROCEDURAL MUSIC SYNTHESIZER
    // ==========================================

    startMusic(worldTheme = 'city', levelNumber = 1) {
        this.ensureContext();
        this.currentWorldTheme = worldTheme;

        // Scale tempo and urgency with world & level
        let tempo = 124;
        if (worldTheme === 'cyber') tempo = 132;
        if (worldTheme === 'industrial') tempo = 120;
        if (worldTheme === 'space') tempo = 114;
        if (worldTheme === 'ice') tempo = 128;
        if (worldTheme === 'lava') tempo = 142;
        if (worldTheme === 'sky') tempo = 130;
        if (worldTheme === 'expert') tempo = 150;

        if (levelNumber > 40) tempo += 4;
        if (levelNumber > 50) tempo += 6;

        this.musicTempo = tempo;

        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        this.step = 0;
        this.scheduleNextBeat();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
            this.sequenceTimer = null;
        }
    }

    scheduleNextBeat() {
        if (!this.isPlayingMusic) return;

        const beatDurationMs = (60 / this.musicTempo / 4) * 1000; // 16th notes
        this.playSequenceStep(this.step % 16);
        this.step++;

        this.sequenceTimer = setTimeout(() => {
            this.scheduleNextBeat();
        }, beatDurationMs);
    }

    playSequenceStep(s) {
        if (!this.ctx || this.isMuted || !this.isPlayingMusic) return;
        const now = this.ctx.currentTime;

        // 1. Kick on steps 0, 4, 8, 12 (four on the floor)
        if (s % 4 === 0) {
            this.playSynthKick(now);
        }

        // 2. Snare / Clap on steps 4, 12
        if (s === 4 || s === 12) {
            this.playSynthSnare(now);
        }

        // 3. Hi-hat on offbeats (2, 6, 10, 14) and 16ths
        if (s % 2 === 1) {
            this.playSynthHiHat(now, s % 4 === 3 ? 0.08 : 0.05);
        }

        // 4. Bassline notes tailored to theme
        this.playSynthBass(now, s);

        // 5. Arpeggio leads
        this.playSynthArp(now, s);
    }

    playSynthKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + 0.12);
    }

    playSynthSnare(time) {
        // Noise burst
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
    }

    playSynthHiHat(time, vol = 0.06) {
        const bufferSize = this.ctx.sampleRate * 0.03;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6500;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
    }

    playSynthBass(time, s) {
        // 16-step bass patterns based on world
        const patterns = {
            city: [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 98.0, 77.78], // C2, D#2, F2, G2
            cyber: [55.0, 55.0, 65.41, 55.0, 73.42, 55.0, 82.41, 73.42],  // A1, C2, D2, E2
            industrial: [49.0, 49.0, 49.0, 58.27, 49.0, 65.41, 49.0, 58.27],
            space: [43.65, 43.65, 51.91, 43.65, 58.27, 43.65, 65.41, 51.91],
            ice: [65.41, 73.42, 82.41, 65.41, 98.0, 82.41, 73.42, 65.41],
            lava: [55.0, 65.41, 55.0, 65.41, 73.42, 65.41, 82.41, 73.42],
            expert: [65.41, 82.41, 98.0, 82.41, 110.0, 98.0, 130.81, 110.0]
        };

        const pattern = patterns[this.currentWorldTheme] || patterns.city;
        const noteIndex = Math.floor(s / 2) % pattern.length;
        const freq = pattern[noteIndex];

        // Trigger on eighth notes
        if (s % 2 === 0) {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, time);
            filter.frequency.exponentialRampToValueAtTime(180, time + 0.12);

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(time);
            osc.stop(time + 0.15);
        }
    }

    playSynthArp(time, s) {
        // High sparkling arpeggio on certain 16th steps
        if (s % 2 !== 1) return;

        const arpScales = {
            city: [523.25, 622.25, 698.46, 783.99, 932.33, 1046.5],
            cyber: [440.0, 523.25, 587.33, 659.25, 783.99, 880.0],
            space: [392.0, 440.0, 523.25, 587.33, 659.25, 783.99],
            ice: [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5],
            lava: [440.0, 493.88, 554.37, 659.25, 739.99, 880.0],
            expert: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
        };

        const scale = arpScales[this.currentWorldTheme] || arpScales.city;
        const note = scale[(s * 3) % scale.length];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.07, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + 0.09);
    }
}
