// Gravity Rush - Player Entity (Futuristic Cyber Ball)
import { Physics } from '../engine/physics.js';

export class Player {
    constructor(x = 100, y = 300) {
        // Spawn and spawn save point
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y;
        this.radius = 16; // Hitbox radius

        // Movement Physics
        this.vx = 0;
        this.vy = 0;
        this.moveSpeed = 340;     // Max horizontal speed
        this.accel = 2400;        // Ground acceleration
        this.airAccel = 1500;     // Air acceleration
        this.friction = 2000;     // Ground braking friction
        this.airDrag = 0.985;     // Air drag

        // Jump Physics
        this.jumpImpulse = -370;        // Base jump impulse
        this.jumpHoldThrust = -620;     // Additional sustained upward thrust while holding space
        this.maxJumpHoldTime = 0.18;    // Max duration for variable jump hold (seconds)
        this.jumpHoldTimer = 0;
        this.isJumpHolding = false;
        this.coyoteTime = 0.12;          // Seconds grace period after leaving ledge
        this.coyoteTimer = 0;
        this.jumpBufferTime = 0.14;     // Seconds grace period for early jump press
        this.jumpBufferTimer = 0;

        // Ground & Slope State
        this.onGround = false;
        this.wasOnGround = false;
        this.groundNormalX = 0;
        this.groundNormalY = -1;
        this.currentPlatform = null;
        this.gravityScale = 1.0; // Normal = 1, Inverted = -1, Low = 0.5

        // Visual Presentation & Polish
        this.rotation = 0;
        this.squashX = 1;
        this.squashY = 1;
        this.targetSquashX = 1;
        this.targetSquashY = 1;
        this.idleTimer = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.state = 'normal'; // 'normal', 'happy', 'jumping', 'boosting', 'damaged', 'checkpoint'
        this.stateTimer = 0;

        // Color Skin Variant (Referenced from Design Sheet)
        this.skin = 'azure'; // 'azure', 'crimson', 'emerald', 'violet', 'solar', 'silver'
        this.skinConfig = {
            azure: {
                primary: '#00e5ff',
                core: '#38bdf8',
                accent: '#0284c7',
                casingGrad: ['#334155', '#1e293b', '#0f172a'],
                plate: '#64748b',
                trail: '#00e5ff',
                name: 'Cyber Azure'
            },
            crimson: {
                primary: '#ff3366',
                core: '#fb7185',
                accent: '#e11d48',
                casingGrad: ['#3f1b24', '#281218', '#14080c'],
                plate: '#7f2e41',
                trail: '#ff3366',
                name: 'Neon Crimson'
            },
            emerald: {
                primary: '#10b981',
                core: '#34d399',
                accent: '#059669',
                casingGrad: ['#1e3a34', '#112923', '#091814'],
                plate: '#3b7062',
                trail: '#10b981',
                name: 'Emerald Pulse'
            },
            violet: {
                primary: '#a855f7',
                core: '#c084fc',
                accent: '#9333ea',
                casingGrad: ['#3b1f50', '#261334', '#13081b'],
                plate: '#774797',
                trail: '#c084fc',
                name: 'Void Violet'
            },
            solar: {
                primary: '#f59e0b',
                core: '#fbbf24',
                accent: '#d97706',
                casingGrad: ['#452f1b', '#2e1e0f', '#190f07'],
                plate: '#8a623a',
                trail: '#f59e0b',
                name: 'Solar Flare'
            },
            silver: {
                primary: '#ffffff',
                core: '#e2e8f0',
                accent: '#94a3b8',
                casingGrad: ['#475569', '#334155', '#1e293b'],
                plate: '#94a3b8',
                trail: '#ffffff',
                name: 'Quantum Silver'
            }
        };

        // Life state
        this.isAlive = true;
        this.boostTimer = 0;
    }

    setSkin(skinId) {
        if (this.skinConfig[skinId]) {
            this.skin = skinId;
        }
    }

    get colors() {
        return this.skinConfig[this.skin] || this.skinConfig.azure;
    }

    respawn(useCheckpoint = true) {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.onGround = false;
        this.currentPlatform = null;
        this.gravityScale = 1.0;
        this.boostTimer = 0;
        this.state = 'normal';
        this.stateTimer = 0;
        this.squashX = 1;
        this.squashY = 1;
    }

    setCheckpoint(x, y) {
        this.spawnX = x;
        this.spawnY = y;
        this.state = 'checkpoint';
        this.stateTimer = 1.2;
    }

    triggerDeath() {
        if (!this.isAlive) return false;
        this.isAlive = false;
        this.state = 'damaged';
        return true;
    }

    applySpeedBoost(dirX = 1, strength = 620) {
        this.vx = dirX * strength;
        this.boostTimer = 0.55;
        this.state = 'boosting';
        this.targetSquashX = 1.45;
        this.targetSquashY = 0.65;
    }

    applyBouncePad(strength = 720) {
        this.vy = -strength * Math.sign(this.gravityScale || 1);
        this.onGround = false;
        this.coyoteTimer = 0;
        this.targetSquashX = 0.65;
        this.targetSquashY = 1.45;
        this.state = 'jumping';
    }

    update(dt, input, audio, particles) {
        if (!this.isAlive) return;

        // Timers
        if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
        if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
        if (this.boostTimer > 0) {
            this.boostTimer -= dt;
            if (this.boostTimer <= 0 && this.state === 'boosting') {
                this.state = 'normal';
            }
        }
        if (this.stateTimer > 0) {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0 && (this.state === 'checkpoint' || this.state === 'damaged')) {
                this.state = 'normal';
            }
        }

        // Variable Jump Buffer check
        if (input.jumpJustPressed) {
            this.jumpBufferTimer = this.jumpBufferTime;
        }

        // ==========================================
        // 1. HORIZONTAL MOVEMENT
        // ==========================================
        let moveDir = 0;
        if (input.moveLeft) moveDir -= 1;
        if (input.moveRight) moveDir += 1;

        const currentAccel = this.onGround ? this.accel : this.airAccel;

        if (moveDir !== 0) {
            this.idleTimer = 0;
            // Accelerate
            this.vx += moveDir * currentAccel * dt;
            const maxSpd = this.boostTimer > 0 ? this.moveSpeed * 1.85 : this.moveSpeed;
            if (Math.abs(this.vx) > maxSpd) {
                this.vx = Math.sign(this.vx) * Math.max(maxSpd, Math.abs(this.vx) - this.friction * 0.4 * dt);
            }
        } else {
            // Decelerate / Friction
            if (this.onGround) {
                if (Math.abs(this.vx) > 0.1) {
                    const decel = this.friction * dt;
                    if (Math.abs(this.vx) <= decel) {
                        this.vx = 0;
                    } else {
                        this.vx -= Math.sign(this.vx) * decel;
                    }
                } else {
                    this.vx = 0;
                }
            } else {
                this.vx *= Math.pow(this.airDrag, dt * 60);
            }
            this.idleTimer += dt;
        }

        // Rolling rotation
        this.rotation += (this.vx / this.radius) * dt;

        // ==========================================
        // 2. JUMPING LOGIC (With Variable Height & Coyote Time)
        // ==========================================
        const effectiveGravityDir = Math.sign(this.gravityScale || 1);

        // Can we trigger a jump?
        const canJump = this.onGround || this.coyoteTimer > 0;
        if (this.jumpBufferTimer > 0 && canJump) {
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
            this.onGround = false;

            // Apply base jump velocity
            this.vy = this.jumpImpulse * effectiveGravityDir;
            this.isJumpHolding = true;
            this.jumpHoldTimer = this.maxJumpHoldTime;

            // Squash & stretch on jump
            this.targetSquashX = 0.72;
            this.targetSquashY = 1.35;
            this.state = 'jumping';

            // Audio & VFX
            audio.playJump();
            particles.emitJump(this.x, this.y + this.radius * effectiveGravityDir, this.colors.primary);
        }

        // Variable Jump Holding: continue thrusting upward as long as Space is held
        if (this.isJumpHolding) {
            if (input.jumpDown && this.jumpHoldTimer > 0) {
                this.jumpHoldTimer -= dt;
                this.vy += this.jumpHoldThrust * effectiveGravityDir * dt;
            } else {
                this.isJumpHolding = false;
                // Cut upward velocity slightly for snappy responsive short hops
                if (effectiveGravityDir > 0 && this.vy < -120) {
                    this.vy *= 0.55;
                } else if (effectiveGravityDir < 0 && this.vy > 120) {
                    this.vy *= 0.55;
                }
            }
        }

        // ==========================================
        // 3. GRAVITY & TERMINAL VELOCITY
        // ==========================================
        const effGravity = Physics.GRAVITY * this.gravityScale;
        this.vy += effGravity * dt;

        // Clamp fall speed
        if (this.gravityScale > 0 && this.vy > Physics.MAX_FALL_SPEED) {
            this.vy = Physics.MAX_FALL_SPEED;
        } else if (this.gravityScale < 0 && this.vy < -Physics.MAX_FALL_SPEED) {
            this.vy = -Physics.MAX_FALL_SPEED;
        }

        // ==========================================
        // 4. MOVING PLATFORM RIDE INHERITANCE
        // ==========================================
        if (this.onGround && this.currentPlatform && this.currentPlatform.dx !== undefined) {
            this.x += this.currentPlatform.dx;
            this.y += this.currentPlatform.dy;
        }

        // Apply velocities to position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // ==========================================
        // 5. SQUASH & STRETCH EASING
        // ==========================================
        this.squashX += (this.targetSquashX - this.squashX) * 0.22;
        this.squashY += (this.targetSquashY - this.squashY) * 0.22;
        this.targetSquashX += (1 - this.targetSquashX) * 0.12;
        this.targetSquashY += (1 - this.targetSquashY) * 0.12;

        // Dynamic stretching while airborne
        if (!this.onGround) {
            const verticalSpeed = Math.abs(this.vy);
            if (verticalSpeed > 200) {
                const stretch = Math.min(0.28, (verticalSpeed - 200) / 1200);
                this.squashX = 1 - stretch * 0.6;
                this.squashY = 1 + stretch;
            }
        }

        // ==========================================
        // 6. EXPRESSIONS & IDLE REACTIONS
        // ==========================================
        if (this.onGround && Math.abs(this.vx) < 5 && this.state !== 'checkpoint' && this.state !== 'damaged') {
            if (this.idleTimer > 2.0) {
                this.state = 'happy'; // Cute idle smile
            } else {
                this.state = 'normal';
            }
        }

        // Trailing particles
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > 240 || this.boostTimer > 0) {
            particles.emitTrail(this.x, this.y, this.colors.trail, this.radius);
        }
        if (this.boostTimer > 0) {
            particles.emitSpeedBoost(this.x, this.y, Math.sign(this.vx) || 1, this.colors.primary);
        }

        // Landing Detection
        if (this.onGround && !this.wasOnGround) {
            const impactSpeed = Math.abs(this.vy);
            audio.playLand(impactSpeed);
            particles.emitLand(this.x, this.y + this.radius * effectiveGravityDir, impactSpeed, this.colors.primary);
            this.targetSquashX = 1.35;
            this.targetSquashY = 0.72;
            if (this.state === 'jumping') {
                this.state = 'normal';
            }
        }

        this.wasOnGround = this.onGround;
        // Reset ground check for next collision resolution step
        this.onGround = false;
        this.currentPlatform = null;
    }

    // Called by collision resolvers
    setGrounded(platform = null, normalX = 0, normalY = -1) {
        this.onGround = true;
        this.coyoteTimer = this.coyoteTime;
        this.currentPlatform = platform;
        this.groundNormalX = normalX;
        this.groundNormalY = normalY;
        this.isJumpHolding = false;
    }

    // ==========================================
    // RENDERING THE FUTURISTIC CYBER BALL
    // (Faithful to Reference Image 1)
    // ==========================================
    draw(ctx) {
        if (!this.isAlive && this.state === 'damaged') return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Apply squash & stretch
        ctx.scale(this.squashX, this.squashY);

        const r = this.radius;
        const colors = this.colors;

        // Outer Glow / Atmosphere
        ctx.save();
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = this.boostTimer > 0 ? 25 : 12;

        // 1. Base Ball Shadow & Ambient Occlusion Gradient
        const bodyGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r);
        bodyGrad.addColorStop(0, '#e2e8f0');
        bodyGrad.addColorStop(0.35, colors.casingGrad[0]);
        bodyGrad.addColorStop(0.8, colors.casingGrad[1]);
        bodyGrad.addColorStop(1, colors.casingGrad[2]);

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Rotating Segmented Casing Plates (Rolls with ball rotation)
        ctx.save();
        ctx.rotate(this.rotation);

        // Outer Metallic Rim
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, r - 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Segment seam grooves
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.arc(0, 0, r - 2, angle - 0.32, angle + 0.32);
            ctx.stroke();
        }

        // Side Thruster Vent Lights (Reference Image 1: horizontal light bars on hull)
        ctx.fillStyle = colors.primary;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 8;
        ctx.fillRect(-r + 2, -1.8, 3.5, 3.6);
        ctx.fillRect(r - 5.5, -1.8, 3.5, 3.6);

        ctx.restore();

        // 3. Central Eye & Core (Facing forward / tracking direction)
        // Eye offset shifts slightly towards movement velocity
        const eyeShiftX = Math.max(-3.5, Math.min(3.5, this.vx * 0.01));
        const eyeShiftY = Math.max(-3, Math.min(3, this.vy * 0.008));

        ctx.save();
        ctx.translate(eyeShiftX, eyeShiftY);

        // Determine Eye Ring Color
        let eyeRingColor = colors.primary;
        let eyeCoreColor = colors.core;

        if (this.state === 'checkpoint') {
            eyeRingColor = '#10b981';
            eyeCoreColor = '#34d399';
        } else if (this.state === 'damaged') {
            eyeRingColor = '#ff3366';
            eyeCoreColor = '#fb7185';
        }

        // Glowing Outer Ring
        ctx.shadowColor = eyeRingColor;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = eyeRingColor;
        ctx.lineWidth = 2.4;

        if (this.state === 'happy') {
            // Cute crescent / smile eye (Reference Image 1: Happy Idle expression)
            ctx.beginPath();
            ctx.arc(0, 1, 7, 0.2, Math.PI - 0.2, false);
            ctx.stroke();
        } else {
            // Normal / Jumping / Boosting circular glowing eye
            ctx.beginPath();
            ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
            ctx.stroke();

            // Inner Pupil Core
            ctx.fillStyle = eyeCoreColor;
            ctx.beginPath();
            const pupilRadius = (this.state === 'jumping' || this.boostTimer > 0) ? 4.2 : 3.0;
            ctx.arc(0, 0, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            // Specular Glint Reflection
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-2, -2, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // 4. Top Glass Specular Arc Highlight
        const specGrad = ctx.createLinearGradient(0, -r, 0, 0);
        specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.52, r * 0.65, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
