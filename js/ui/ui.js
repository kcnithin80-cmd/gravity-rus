// Gravity Rush - UI & Screen Management System
// Renders HUD, Level Complete Dialog, Pause Menu, Level Select, and Skin Customizer
import { WORLDS, getWorldForLevel } from '../levels/levelData.js';
import { StorageManager } from './storage.js';

export class UIManager {
    constructor(game) {
        this.game = game;

        // Cache DOM elements
        this.dom = {
            hud: document.getElementById('hud'),
            levelText: document.getElementById('hud-level-text'),
            progressBar: document.getElementById('hud-progress-fill'),
            progressPercent: document.getElementById('hud-progress-percent'),
            deathCount: document.getElementById('hud-deaths'),
            timer: document.getElementById('hud-timer'),
            bestTime: document.getElementById('hud-best-time'),
            tutorialTip: document.getElementById('tutorial-tip'),

            btnPause: document.getElementById('btn-hud-pause'),
            btnRestart: document.getElementById('btn-hud-restart'),
            btnAudio: document.getElementById('btn-hud-audio'),

            // Modals
            modalComplete: document.getElementById('modal-complete'),
            completeTitle: document.getElementById('complete-level-title'),
            completeStars: document.getElementById('complete-stars'),
            completeTime: document.getElementById('complete-time'),
            completeDeaths: document.getElementById('complete-deaths'),
            completeBestTime: document.getElementById('complete-best-time'),
            completeRecordBadge: document.getElementById('complete-record-badge'),
            btnCompleteReplay: document.getElementById('btn-complete-replay'),
            btnCompleteNext: document.getElementById('btn-complete-next'),
            btnCompleteSelect: document.getElementById('btn-complete-select'),

            // Pause Modal
            modalPause: document.getElementById('modal-pause'),
            btnResume: document.getElementById('btn-pause-resume'),
            btnPauseRestart: document.getElementById('btn-pause-restart'),
            btnPauseSelect: document.getElementById('btn-pause-select'),
            btnPauseSkins: document.getElementById('btn-pause-skins'),
            sliderSfx: document.getElementById('slider-sfx'),
            sliderMusic: document.getElementById('slider-music'),
            checkShake: document.getElementById('check-shake'),
            selectParticles: document.getElementById('select-particles'),

            // Level Select Modal
            modalSelect: document.getElementById('modal-select'),
            worldTabs: document.getElementById('select-world-tabs'),
            levelGrid: document.getElementById('select-level-grid'),
            totalStarsBadge: document.getElementById('select-total-stars'),
            btnCloseSelect: document.getElementById('btn-close-select'),
            btnEndlessMode: document.getElementById('btn-endless-mode'),

            // Skin Customizer Modal
            modalSkins: document.getElementById('modal-skins'),
            skinCards: document.getElementById('skin-cards'),
            skinCanvasPreview: document.getElementById('skin-preview-canvas'),
            btnCloseSkins: document.getElementById('btn-close-skins'),

            // Touch controls
            touchControls: document.getElementById('touch-controls'),
            btnTouchLeft: document.getElementById('touch-left'),
            btnTouchRight: document.getElementById('touch-right'),
            btnTouchJump: document.getElementById('touch-jump')
        };

        this.selectedWorldTab = 'city';
        this.previewRotation = 0;
        this.previewAnimFrame = null;

        this.bindEvents();
        this.initSettingsUI();
    }

    formatTime(seconds) {
        if (!seconds || seconds === Infinity || isNaN(seconds)) return '--:--.--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds * 100) % 100);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }

    bindEvents() {
        // HUD buttons
        this.dom.btnPause?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.game.togglePause();
        });

        this.dom.btnRestart?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.game.restartLevel();
        });

        this.dom.btnAudio?.addEventListener('click', () => {
            const muted = this.game.audio.toggleMute();
            this.game.audio.playButtonClick();
            this.updateAudioButtonIcon(muted);
        });

        // Level Complete Buttons
        this.dom.btnCompleteReplay?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.hideAllModals();
            this.game.restartLevel();
        });

        this.dom.btnCompleteNext?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.hideAllModals();
            this.game.loadLevel(this.game.currentLevelNumber + 1);
        });

        this.dom.btnCompleteSelect?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.hideAllModals();
            this.showLevelSelect();
        });

        // Pause Menu Buttons
        this.dom.btnResume?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.game.resume();
        });

        this.dom.btnPauseRestart?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.hideAllModals();
            this.game.restartLevel();
        });

        this.dom.btnPauseSelect?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.dom.modalPause.classList.add('hidden');
            this.showLevelSelect();
        });

        this.dom.btnPauseSkins?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.dom.modalPause.classList.add('hidden');
            this.showSkinCustomizer();
        });

        // Settings Listeners
        this.dom.sliderSfx?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.game.audio.setSfxVolume(val);
            StorageManager.updateSettings({ sfxVolume: val });
        });

        this.dom.sliderMusic?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.game.audio.setMusicVolume(val);
            StorageManager.updateSettings({ musicVolume: val });
        });

        this.dom.checkShake?.addEventListener('change', (e) => {
            this.game.settings.screenShake = e.target.checked;
            StorageManager.updateSettings({ screenShake: e.target.checked });
        });

        this.dom.selectParticles?.addEventListener('change', (e) => {
            this.game.particles.setQuality(e.target.value);
            StorageManager.updateSettings({ particles: e.target.value });
        });

        // Level Select Listeners
        this.dom.btnCloseSelect?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.dom.modalSelect.classList.add('hidden');
            if (this.game.isPaused) {
                this.dom.modalPause.classList.remove('hidden');
            }
        });

        this.dom.btnEndlessMode?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.dom.modalSelect.classList.add('hidden');
            this.game.startEndlessMode();
        });

        // Skin Customizer Listeners
        this.dom.btnCloseSkins?.addEventListener('click', () => {
            this.game.audio.playButtonClick();
            this.dom.modalSkins.classList.add('hidden');
            if (this.previewAnimFrame) cancelAnimationFrame(this.previewAnimFrame);
            if (this.game.isPaused) {
                this.dom.modalPause.classList.remove('hidden');
            }
        });

        // Touch Control Listeners
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        if (!this.dom.btnTouchLeft) return;

        const left = this.dom.btnTouchLeft;
        const right = this.dom.btnTouchRight;
        const jump = this.dom.btnTouchJump;

        const addHoldListener = (elem, onPress, onRelease) => {
            elem.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                onPress();
            });
            elem.addEventListener('pointerup', (e) => {
                e.preventDefault();
                onRelease();
            });
            elem.addEventListener('pointerleave', (e) => {
                onRelease();
            });
            elem.addEventListener('pointercancel', (e) => {
                onRelease();
            });
        };

        addHoldListener(
            left,
            () => this.game.input.setTouchMove('left', true),
            () => this.game.input.setTouchMove('left', false)
        );

        addHoldListener(
            right,
            () => this.game.input.setTouchMove('right', true),
            () => this.game.input.setTouchMove('right', false)
        );

        addHoldListener(
            jump,
            () => this.game.input.setTouchJump(true),
            () => this.game.input.setTouchJump(false)
        );
    }

    initSettingsUI() {
        const saved = StorageManager.load();
        if (saved.settings) {
            if (this.dom.sliderSfx) this.dom.sliderSfx.value = saved.settings.sfxVolume;
            if (this.dom.sliderMusic) this.dom.sliderMusic.value = saved.settings.musicVolume;
            if (this.dom.checkShake) this.dom.checkShake.checked = saved.settings.screenShake;
            if (this.dom.selectParticles) this.dom.selectParticles.value = saved.settings.particles;
        }
    }

    updateAudioButtonIcon(isMuted) {
        if (this.dom.btnAudio) {
            this.dom.btnAudio.innerHTML = isMuted
                ? '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H4v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
                : '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        }
    }

    updateHUD(level, progressPercent, deaths, timerSeconds, bestTimeSeconds) {
        const world = getWorldForLevel(level.number);
        if (this.dom.levelText) {
            this.dom.levelText.innerText = `LEVEL ${level.number} // ${world.name.toUpperCase()}`;
        }
        if (this.dom.progressBar) {
            this.dom.progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
        }
        if (this.dom.progressPercent) {
            this.dom.progressPercent.innerText = `${Math.floor(progressPercent)}%`;
        }
        if (this.dom.deathCount) {
            this.dom.deathCount.innerText = deaths;
        }
        if (this.dom.timer) {
            this.dom.timer.innerText = this.formatTime(timerSeconds);
        }
        if (this.dom.bestTime) {
            this.dom.bestTime.innerText = `Best: ${this.formatTime(bestTimeSeconds)}`;
        }

        // Tutorial tooltip banner
        if (this.dom.tutorialTip) {
            if (level.tip && timerSeconds < 14) {
                this.dom.tutorialTip.innerText = level.tip;
                this.dom.tutorialTip.classList.remove('hidden');
            } else {
                this.dom.tutorialTip.classList.add('hidden');
            }
        }
    }

    showLevelComplete(levelNumber, completionTime, deaths, stars, isNewRecord, bestTime) {
        if (!this.dom.modalComplete) return;

        this.dom.completeTitle.innerText = `LEVEL ${levelNumber} COMPLETED`;
        this.dom.completeTime.innerText = this.formatTime(completionTime);
        this.dom.completeDeaths.innerText = deaths;
        this.dom.completeBestTime.innerText = this.formatTime(bestTime);

        if (isNewRecord) {
            this.dom.completeRecordBadge.classList.remove('hidden');
        } else {
            this.dom.completeRecordBadge.classList.add('hidden');
        }

        // Animate stars sequentially
        this.dom.completeStars.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.className = `star-icon ${i < stars ? 'earned' : 'empty'}`;
            star.innerHTML = '★';
            this.dom.completeStars.appendChild(star);

            if (i < stars) {
                setTimeout(() => {
                    star.classList.add('pop');
                    this.game.audio.playStar(i);
                }, (i + 1) * 350);
            }
        }

        this.dom.modalComplete.classList.remove('hidden');
    }

    showPause() {
        this.dom.modalPause?.classList.remove('hidden');
    }

    hidePause() {
        this.dom.modalPause?.classList.add('hidden');
    }

    hideAllModals() {
        this.dom.modalComplete?.classList.add('hidden');
        this.dom.modalPause?.classList.add('hidden');
        this.dom.modalSelect?.classList.add('hidden');
        this.dom.modalSkins?.classList.add('hidden');
    }

    // ==========================================
    // LEVEL SELECT SCREEN
    // ==========================================
    showLevelSelect() {
        if (!this.dom.modalSelect) return;
        this.renderWorldTabs();
        this.renderLevelGrid();
        this.dom.modalSelect.classList.remove('hidden');
    }

    renderWorldTabs() {
        const saved = StorageManager.load();
        let totalStars = 0;
        Object.values(saved.levels || {}).forEach(rec => {
            totalStars += (rec.stars || 0);
        });
        if (this.dom.totalStarsBadge) {
            this.dom.totalStarsBadge.innerText = `★ ${totalStars}`;
        }

        this.dom.worldTabs.innerHTML = '';
        Object.values(WORLDS).forEach(w => {
            const tab = document.createElement('button');
            tab.className = `world-tab ${this.selectedWorldTab === w.id ? 'active' : ''}`;
            tab.innerText = w.name;
            tab.addEventListener('click', () => {
                this.game.audio.playButtonClick();
                this.selectedWorldTab = w.id;
                this.renderWorldTabs();
                this.renderLevelGrid();
            });
            this.dom.worldTabs.appendChild(tab);
        });
    }

    renderLevelGrid() {
        const saved = StorageManager.load();
        const world = WORLDS[this.selectedWorldTab];
        this.dom.levelGrid.innerHTML = '';

        for (let num = world.levels[0]; num <= world.levels[1]; num++) {
            const isUnlocked = num <= saved.highestUnlockedLevel;
            const record = saved.levels[num] || { completed: false, stars: 0, bestTime: Infinity };

            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${record.completed ? 'completed' : ''}`;

            card.innerHTML = `
                <div class="level-card-number">${num}</div>
                <div class="level-card-stars">
                    ${'★'.repeat(record.stars || 0)}${'☆'.repeat(3 - (record.stars || 0))}
                </div>
                <div class="level-card-time">${record.completed ? this.formatTime(record.bestTime) : isUnlocked ? 'READY' : 'LOCKED'}</div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.game.audio.playButtonClick();
                    this.hideAllModals();
                    this.game.loadLevel(num);
                });
            }

            this.dom.levelGrid.appendChild(card);
        }
    }

    // ==========================================
    // BALL SKIN CUSTOMIZER SCREEN
    // (Faithful to Reference Image 1)
    // ==========================================
    showSkinCustomizer() {
        if (!this.dom.modalSkins) return;
        this.renderSkinCards();
        this.startPreviewLoop();
        this.dom.modalSkins.classList.remove('hidden');
    }

    renderSkinCards() {
        const saved = StorageManager.load();
        const currentSkin = saved.selectedSkin || 'azure';
        const skins = this.game.player.skinConfig;

        this.dom.skinCards.innerHTML = '';

        Object.keys(skins).forEach(key => {
            const item = skins[key];
            const card = document.createElement('div');
            card.className = `skin-card ${currentSkin === key ? 'selected' : ''}`;

            card.innerHTML = `
                <div class="skin-color-pip" style="background: ${item.primary}; box-shadow: 0 0 10px ${item.primary}"></div>
                <div class="skin-name">${item.name}</div>
                <button class="btn-select-skin ${currentSkin === key ? 'active' : ''}">
                    ${currentSkin === key ? 'EQUIPPED' : 'EQUIP'}
                </button>
            `;

            card.querySelector('.btn-select-skin').addEventListener('click', () => {
                this.game.audio.playButtonClick();
                this.game.player.setSkin(key);
                StorageManager.setSkin(key);
                this.renderSkinCards();
            });

            this.dom.skinCards.appendChild(card);
        });
    }

    startPreviewLoop() {
        const canvas = this.dom.skinCanvasPreview;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const loop = () => {
            this.previewRotation += 0.035;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const r = 40;
            const colors = this.game.player.colors;

            ctx.save();
            ctx.translate(cx, cy);

            // Shadow / glow
            ctx.shadowColor = colors.primary;
            ctx.shadowBlur = 24;

            // Ball body
            const bodyGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r);
            bodyGrad.addColorStop(0, '#e2e8f0');
            bodyGrad.addColorStop(0.35, colors.casingGrad[0]);
            bodyGrad.addColorStop(0.8, colors.casingGrad[1]);
            bodyGrad.addColorStop(1, colors.casingGrad[2]);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            // Rotating plate grooves
            ctx.save();
            ctx.rotate(this.previewRotation);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                ctx.beginPath();
                ctx.arc(0, 0, r - 4, angle - 0.3, angle + 0.3);
                ctx.stroke();
            }
            // Hull vent lights
            ctx.fillStyle = colors.primary;
            ctx.shadowColor = colors.primary;
            ctx.shadowBlur = 10;
            ctx.fillRect(-r + 3, -4, 6, 8);
            ctx.fillRect(r - 9, -4, 6, 8);
            ctx.restore();

            // Eye Ring
            ctx.strokeStyle = colors.primary;
            ctx.shadowColor = colors.primary;
            ctx.shadowBlur = 16;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.stroke();

            // Eye Core Pupil
            ctx.fillStyle = colors.core;
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            // Highlight Glint
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Glass Specular
            const specGrad = ctx.createLinearGradient(0, -r, 0, 0);
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = specGrad;
            ctx.beginPath();
            ctx.ellipse(0, -r * 0.5, r * 0.65, r * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            if (!this.dom.modalSkins.classList.contains('hidden')) {
                this.previewAnimFrame = requestAnimationFrame(loop);
            }
        };

        if (this.previewAnimFrame) cancelAnimationFrame(this.previewAnimFrame);
        this.previewAnimFrame = requestAnimationFrame(loop);
    }
}
