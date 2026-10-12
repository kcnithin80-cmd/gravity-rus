// Gravity Rush - Smooth Dynamic Camera System
export class Camera {
    constructor(viewportWidth = 1280, viewportHeight = 720) {
        this.width = viewportWidth;
        this.height = viewportHeight;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        // Smooth follow settings
        this.lerpSpeed = 0.08;
        this.lookAheadDistance = 90; // Pixels to look ahead horizontally based on velocity
        this.currentLookAhead = 0;

        // Dynamic zoom
        this.zoom = 1;
        this.targetZoom = 1;
        this.zoomLerp = 0.04;

        // Bounds
        this.bounds = {
            minX: 0,
            maxX: 5000,
            minY: -2000,
            maxY: 2000
        };

        // Screen Shake
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeDecay = 0.9;
        this.shakeFrequency = 24;
        this.shakeTimer = 0;
    }

    resize(viewportWidth, viewportHeight) {
        this.width = viewportWidth;
        this.height = viewportHeight;
    }

    setBounds(minX, maxX, minY, maxY) {
        this.bounds = { minX, maxX, minY, maxY };
    }

    shake(intensity = 6, duration = 0.3) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    update(target, dt = 1 / 60) {
        if (!target) return;

        // 1. Calculate velocity-based lookahead
        const velX = target.vx || 0;
        const targetLook = Math.max(-1, Math.min(1, velX / 300)) * this.lookAheadDistance;
        this.currentLookAhead += (targetLook - this.currentLookAhead) * 0.08;

        // 2. Desired camera center
        const desiredCenterX = target.x + this.currentLookAhead;
        const desiredCenterY = target.y - 40; // Look slightly above player

        // 3. Dynamic Zoom: zoom out slightly if moving very fast
        const speed = Math.hypot(target.vx || 0, target.vy || 0);
        if (speed > 550) {
            this.targetZoom = 0.88;
        } else if (speed > 350) {
            this.targetZoom = 0.94;
        } else {
            this.targetZoom = 1.0;
        }

        this.zoom += (this.targetZoom - this.zoom) * this.zoomLerp;

        // 4. Smooth lerp position
        const targetCamX = desiredCenterX - (this.width / this.zoom) / 2;
        const targetCamY = desiredCenterY - (this.height / this.zoom) / 2;

        this.x += (targetCamX - this.x) * this.lerpSpeed;
        this.y += (targetCamY - this.y) * this.lerpSpeed;

        // 5. Bounds Clamping (with padding)
        const visibleW = this.width / this.zoom;
        const visibleH = this.height / this.zoom;

        if (this.bounds.maxX - this.bounds.minX > visibleW) {
            this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX - visibleW, this.x));
        }
        if (this.bounds.maxY - this.bounds.minY > visibleH) {
            this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY - visibleH, this.y));
        }

        // 6. Shake decay & calculation
        if (this.shakeIntensity > 0.1) {
            this.shakeTimer += dt * this.shakeFrequency;
            this.shakeOffsetX = (Math.sin(this.shakeTimer * 1.7) + (Math.random() - 0.5) * 0.5) * this.shakeIntensity;
            this.shakeOffsetY = (Math.cos(this.shakeTimer * 2.1) + (Math.random() - 0.5) * 0.5) * this.shakeIntensity;
            this.shakeIntensity *= Math.pow(this.shakeDecay, dt * 60);
        } else {
            this.shakeIntensity = 0;
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    snapTo(target) {
        if (!target) return;
        this.currentLookAhead = 0;
        const visibleW = this.width / this.zoom;
        const visibleH = this.height / this.zoom;
        this.x = target.x - visibleW / 2;
        this.y = target.y - visibleH / 2;
    }

    apply(ctx) {
        ctx.save();
        // Translate to center for zoom scale, then offset
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(
            -this.width / 2 - this.x - this.shakeOffsetX,
            -this.height / 2 - this.y - this.shakeOffsetY
        );
    }

    restore(ctx) {
        ctx.restore();
    }
}
