// Gravity Rush - Main Game Coordinator & Game Loop Engine
import { InputManager } from './engine/input.js';
import { AudioManager } from './engine/audio.js';
import { ParticleSystem } from './engine/particles.js';
import { Camera } from './engine/camera.js';
import { Player } from './entities/player.js';
import {
    Platform,
    MovingPlatform,
    FallingPlatform,
    RotatingPlatform,
    Spikes,
    RotatingBlade,
    Laser,
    BouncePad,
    SpeedBooster,
    GravityZone,
    BreakablePlatform,
    TimedDoor,
    Checkpoint,
    FinishPortal
} from './entities/obstacles.js';
import { LEVELS, WORLDS, getWorldForLevel } from './levels/levelData.js';
import { LevelGenerator } from './levels/levelGenerator.js';
import { StorageManager } from './ui/storage.js';
import { UIManager } from './ui/ui.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Subsystems
        this.input = new InputManager();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.camera = new Camera(window.innerWidth, window.innerHeight);
        this.player = new Player(100, 300);

        // Load saved state
        const savedData = StorageManager.load();
        this.currentLevelNumber = savedData.highestUnlockedLevel || 1;
        this.settings = savedData.settings || { screenShake: true };
        this.player.setSkin(savedData.selectedSkin || 'azure');
        this.particles.setQuality(this.settings.particles || 'high');

        // Level state
        this.currentLevel = null;
        this.levelStartTime = 0;
        this.levelTimer = 0;
        this.levelDeaths = 0;
        this.isLevelActive = false;
        this.isPaused = false;
        this.isEndlessMode = false;

        // Entities collections
        this.platforms = [];
        this.movingPlatforms = [];
        this.fallingPlatforms = [];
        this.rotatingPlatforms = [];
        this.spikes = [];
        this.blades = [];
        this.lasers = [];
        this.bouncePads = [];
        this.speedBoosters = [];
        this.gravityZones = [];
        this.breakablePlatforms = [];
        this.timedDoors = [];
        this.checkpoints = [];
        this.finishPortal = null;

        // Timing & Slow-Mo
        this.lastTime = 0;
        this.timeScale = 1.0;
        this.targetTimeScale = 1.0;
        this.deathRespawnTimer = 0;

        // UI Manager
        this.ui = new UIManager(this);

        this.initCanvas();
        this.loadLevel(this.currentLevelNumber);
        this.startLoop();
    }

    initCanvas() {
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.ctx.resetTransform();
            this.ctx.scale(dpr, dpr);
            this.camera.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', resize);
        resize();
    }

    loadLevel(levelNumber) {
        this.currentLevelNumber = levelNumber;
        this.isEndlessMode = levelNumber > LEVELS.length;

        let levelData;
        if (levelNumber <= LEVELS.length) {
            levelData = LEVELS[levelNumber - 1];
        } else {
            levelData = LevelGenerator.generate(levelNumber);
        }

        this.currentLevel = levelData;
        this.levelDeaths = 0;
        this.levelTimer = 0;
        this.timeScale = 1.0;
        this.targetTimeScale = 1.0;
        this.deathRespawnTimer = 0;

        // Reset player & camera
        this.player.spawnX = levelData.playerSpawn.x;
        this.player.spawnY = levelData.playerSpawn.y;
        this.player.respawn();
        this.camera.setBounds(
            levelData.bounds.minX,
            levelData.bounds.maxX,
            levelData.bounds.minY,
            levelData.bounds.maxY
        );
        this.camera.snapTo(this.player);

        // Instantiate Level Elements
        this.platforms = levelData.platforms.map(p => new Platform(...p));
        this.movingPlatforms = levelData.movingPlatforms.map(p => new MovingPlatform(...p));
        this.fallingPlatforms = levelData.fallingPlatforms.map(p => new FallingPlatform(...p));
        this.rotatingPlatforms = levelData.rotatingPlatforms.map(p => new RotatingPlatform(...p));
        this.spikes = levelData.spikes.map(p => new Spikes(...p));
        this.blades = levelData.blades.map(p => new RotatingBlade(...p));
        this.lasers = levelData.lasers.map(p => new Laser(...p));
        this.bouncePads = levelData.bouncePads.map(p => new BouncePad(...p));
        this.speedBoosters = levelData.speedBoosters.map(p => new SpeedBooster(...p));
        this.gravityZones = levelData.gravityZones.map(p => new GravityZone(...p));
        this.breakablePlatforms = levelData.breakablePlatforms.map(p => new BreakablePlatform(...p));
        this.timedDoors = levelData.timedDoors.map(p => new TimedDoor(...p));
        this.checkpoints = levelData.checkpoints.map(p => new Checkpoint(...p));
        this.finishPortal = new FinishPortal(
            levelData.finish.x,
            levelData.finish.y,
            levelData.finish.w,
            levelData.finish.h
        );

        // Reset particles & ambient weather
        this.particles.reset();
        this.particles.initAmbientWorld(levelData.world, window.innerWidth, window.innerHeight);

        // Music for current world
        this.audio.startMusic(levelData.world, levelNumber);

        this.isLevelActive = true;
        this.isPaused = false;
        this.ui.hideAllModals();
    }

    startEndlessMode() {
        this.loadLevel(61);
    }

    restartLevel() {
        this.loadLevel(this.currentLevelNumber);
    }

    togglePause() {
        if (!this.isLevelActive) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.ui.showPause();
        } else {
            this.ui.hidePause();
        }
    }

    resume() {
        this.isPaused = false;
        this.ui.hidePause();
    }

    // ==========================================
    // MAIN LOOP
    // ==========================================
    startLoop() {
        this.lastTime = performance.now();
        const frame = (timestamp) => {
            const rawDt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
            this.lastTime = timestamp;

            // Smooth Time Dilation
            this.timeScale += (this.targetTimeScale - this.timeScale) * 0.1;
            const dt = rawDt * this.timeScale;

            this.handleGlobalInputs();

            if (!this.isPaused && this.isLevelActive) {
                this.update(dt);
            }

            this.render();
            this.input.clearFrame();

            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    handleGlobalInputs() {
        if (this.input.restartJustPressed) {
            this.audio.playButtonClick();
            this.restartLevel();
        }
        if (this.input.pauseJustPressed) {
            this.audio.playButtonClick();
            this.togglePause();
        }
    }

    // ==========================================
    // UPDATE LOGIC
    // ==========================================
    update(dt) {
        this.levelTimer += dt;

        // Death respawn sequence
        if (!this.player.isAlive) {
            this.deathRespawnTimer -= dt;
            if (this.deathRespawnTimer <= 0) {
                this.player.respawn(true);
            }
        }

        // 1. Update Dynamic Obstacles
        this.movingPlatforms.forEach(mp => mp.update(dt));
        this.fallingPlatforms.forEach(fp => fp.update(dt, this.player, this.audio, this.particles));
        this.rotatingPlatforms.forEach(rp => rp.update(dt));
        this.blades.forEach(b => b.update(dt));
        this.lasers.forEach(l => l.update(dt));
        this.bouncePads.forEach(bp => bp.update(dt));
        this.speedBoosters.forEach(sb => sb.update(dt));
        this.gravityZones.forEach(gz => gz.update(dt));
        this.breakablePlatforms.forEach(bp => bp.update(dt));
        this.timedDoors.forEach(td => td.update(dt));
        this.checkpoints.forEach(cp => cp.update(dt));
        if (this.finishPortal) this.finishPortal.update(dt, this.particles);

        // 2. Player Update with sub-stepping for tunneling prevention
        const subSteps = 2;
        const subDt = dt / subSteps;
        for (let s = 0; s < subSteps; s++) {
            if (this.player.isAlive) {
                this.player.update(subDt, this.input, this.audio, this.particles);
                this.resolveCollisions();
            }
        }

        // 3. Hazard checks
        if (this.player.isAlive) {
            this.checkHazards();
        }

        // 4. Gravity zones check
        if (this.player.isAlive) {
            let inAnyGravityZone = false;
            for (const gz of this.gravityZones) {
                if (gz.checkZone(this.player)) {
                    inAnyGravityZone = true;
                    break;
                }
            }
            if (!inAnyGravityZone) {
                this.player.gravityScale = 1.0;
            }
        }

        // 5. Checkpoints check
        this.checkpoints.forEach(cp => cp.checkActivation(this.player, this.audio, this.particles));

        // 6. Level completion check
        if (this.player.isAlive && this.finishPortal && this.finishPortal.checkCompletion(this.player)) {
            this.onLevelComplete();
        }

        // 7. Update Particles & Camera
        this.particles.update(dt);
        this.camera.update(this.player, dt);

        // 8. Update HUD
        const startX = this.currentLevel.playerSpawn.x;
        const finishX = this.currentLevel.finish.x;
        const progress = Math.max(0, Math.min(100, ((this.player.x - startX) / (finishX - startX)) * 100));

        const saved = StorageManager.load();
        const bestTime = saved.levels[this.currentLevelNumber]?.bestTime || Infinity;

        this.ui.updateHUD(
            this.currentLevel,
            progress,
            this.levelDeaths,
            this.levelTimer,
            bestTime
        );
    }

    resolveCollisions() {
        const player = this.player;

        // Static platforms
        this.platforms.forEach(p => p.resolveCollision(player));

        // Moving platforms
        this.movingPlatforms.forEach(mp => mp.resolveCollision(player));

        // Falling platforms
        this.fallingPlatforms.forEach(fp => fp.resolveCollision(player));

        // Rotating platforms
        this.rotatingPlatforms.forEach(rp => rp.resolveCollision(player));

        // Breakable platforms
        this.breakablePlatforms.forEach(bp => bp.resolveCollision(player, this.audio, this.particles));

        // Timed doors
        this.timedDoors.forEach(td => td.resolveCollision(player));

        // Bounce pads
        this.bouncePads.forEach(bp => bp.resolveCollision(player, this.audio, this.particles));

        // Speed boosters
        this.speedBoosters.forEach(sb => sb.resolveCollision(player, this.audio, this.particles));
    }

    checkHazards() {
        const player = this.player;

        // Fall into bottom void / out of bounds
        if (player.y > this.currentLevel.bounds.maxY + 120 || player.y < this.currentLevel.bounds.minY - 300) {
            this.onPlayerDeath();
            return;
        }

        // Spikes
        for (const spike of this.spikes) {
            if (spike.checkHazard(player)) {
                this.onPlayerDeath();
                return;
            }
        }

        // Saw blades
        for (const blade of this.blades) {
            if (blade.checkHazard(player)) {
                this.onPlayerDeath();
                return;
            }
        }

        // Lasers
        for (const laser of this.lasers) {
            if (laser.checkHazard(player)) {
                this.onPlayerDeath();
                return;
            }
        }
    }

    onPlayerDeath() {
        if (!this.player.triggerDeath()) return;

        this.levelDeaths++;
        StorageManager.recordDeath();
        this.audio.playDeath();
        this.particles.emitDeath(this.player.x, this.player.y, this.player.colors.primary);

        if (this.settings.screenShake) {
            this.camera.shake(14, 0.4);
        }

        this.deathRespawnTimer = 0.65;
    }

    onLevelComplete() {
        this.isLevelActive = false;
        this.targetTimeScale = 0.35; // Dramatic slow-mo!

        this.audio.playLevelComplete();
        this.particles.emitJump(this.player.x, this.player.y, '#ffffff');

        // Star rating calculation
        let stars = 1; // Completed
        const par = this.currentLevel.parTime;
        if (this.levelTimer <= par) {
            stars = 2; // Beat par time
            if (this.levelDeaths === 0) {
                stars = 3; // Flawless speed run!
            }
        } else if (this.levelDeaths === 0) {
            stars = 2;
        }

        const res = StorageManager.recordLevelComplete(
            this.currentLevelNumber,
            this.levelTimer,
            this.levelDeaths,
            stars
        );

        setTimeout(() => {
            this.ui.showLevelComplete(
                this.currentLevelNumber,
                this.levelTimer,
                this.levelDeaths,
                stars,
                res.isNewBestTime,
                res.bestTime
            );
        }, 300);
    }

    // ==========================================
    // RENDERING PIPELINE
    // ==========================================
    render() {
        const ctx = this.ctx;
        const width = window.innerWidth;
        const height = window.innerHeight;

        ctx.clearRect(0, 0, width, height);

        // 1. Parallax Multi-layer Background
        this.drawParallaxBackground(ctx, width, height);

        // 2. Camera View Transform
        this.camera.apply(ctx);

        // 3. Draw Level Elements (Layered)
        this.gravityZones.forEach(gz => gz.draw(ctx));
        this.platforms.forEach(p => p.draw(ctx));
        this.movingPlatforms.forEach(mp => mp.draw(ctx));
        this.fallingPlatforms.forEach(fp => fp.draw(ctx));
        this.rotatingPlatforms.forEach(rp => rp.draw(ctx));
        this.breakablePlatforms.forEach(bp => bp.draw(ctx));
        this.timedDoors.forEach(td => td.draw(ctx));
        this.bouncePads.forEach(bp => bp.draw(ctx));
        this.speedBoosters.forEach(sb => sb.draw(ctx));
        this.spikes.forEach(s => s.draw(ctx));
        this.blades.forEach(b => b.draw(ctx));
        this.lasers.forEach(l => l.draw(ctx));
        this.checkpoints.forEach(cp => cp.draw(ctx));
        if (this.finishPortal) this.finishPortal.draw(ctx);

        // 4. Draw Particles (Behind player / world)
        this.particles.draw(ctx, this.camera);

        // 5. Draw Player
        this.player.draw(ctx);

        // Restore Camera
        this.camera.restore(ctx);
    }

    // ==========================================
    // PARALLAX BACKGROUNDS
    // (Faithful to Reference Image 2 World Themes)
    // ==========================================
    drawParallaxBackground(ctx, w, h) {
        const world = getWorldForLevel(this.currentLevelNumber);
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, world.skyGradient[0]);
        grad.addColorStop(0.5, world.skyGradient[1]);
        grad.addColorStop(1, world.skyGradient[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const camX = this.camera.x;
        const camY = this.camera.y;

        ctx.save();

        if (world.bgTheme === 'city') {
            // Far skyline silhouettes
            ctx.fillStyle = '#090d16';
            const bWidth = 80;
            const offset = (camX * 0.1) % (bWidth * 4);
            for (let x = -bWidth * 2; x < w + bWidth * 2; x += bWidth) {
                const drawX = x - offset;
                const hVar = 140 + Math.sin(x * 12.3) * 60;
                ctx.fillRect(drawX, h - hVar, bWidth - 4, hVar);

                // Neon window dots
                ctx.fillStyle = '#00e5ff';
                ctx.globalAlpha = 0.25;
                for (let wy = h - hVar + 10; wy < h - 20; wy += 22) {
                    ctx.fillRect(drawX + 12, wy, 4, 6);
                    ctx.fillRect(drawX + 32, wy, 4, 6);
                }
                ctx.globalAlpha = 1.0;
                ctx.fillStyle = '#090d16';
            }
        } else if (world.bgTheme === 'cyber') {
            // Synthwave horizon grid
            ctx.strokeStyle = 'rgba(217, 70, 239, 0.22)';
            ctx.lineWidth = 1.5;
            const horizon = h * 0.65;

            // Horizontal lines
            for (let y = horizon; y < h; y += 18) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            // Vertical perspective rays
            const vOffset = (camX * 0.2) % 60;
            for (let x = -60; x < w + 60; x += 60) {
                ctx.beginPath();
                ctx.moveTo(w / 2, horizon);
                ctx.lineTo(x - vOffset, h);
                ctx.stroke();
            }
        } else if (world.bgTheme === 'space') {
            // Giant distant ringed planet
            ctx.save();
            ctx.translate(w * 0.75 - camX * 0.03, h * 0.3 - camY * 0.03);
            const pGrad = ctx.createRadialGradient(-20, -20, 10, 0, 0, 90);
            pGrad.addColorStop(0, '#38bdf8');
            pGrad.addColorStop(0.6, '#0f172a');
            pGrad.addColorStop(1, '#020617');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 80, 0, Math.PI * 2);
            ctx.fill();
            // Planetary Ring
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(0, 0, 140, 28, -0.4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (world.bgTheme === 'lava') {
            // Molten glow along bottom
            const lGrad = ctx.createLinearGradient(0, h - 140, 0, h);
            lGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
            lGrad.addColorStop(1, 'rgba(239, 68, 68, 0.45)');
            ctx.fillStyle = lGrad;
            ctx.fillRect(0, h - 140, w, 140);
        } else if (world.bgTheme === 'ice') {
            // Crystalline mountain silhouettes
            ctx.fillStyle = '#082f49';
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let x = 0; x <= w + 100; x += 120) {
                const py = h - 160 - Math.sin((x + camX * 0.08) * 0.02) * 90;
                ctx.lineTo(x, py);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

// Start Game upon DOM readiness
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
