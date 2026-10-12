// Gravity Rush - Input System
export class InputManager {
    constructor() {
        this.keys = {};
        this.justPressedKeys = {};
        this.justReleasedKeys = {};

        // Virtual touch/button states
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchJumpJustPressed = false;
        this.touchJumpJustReleased = false;

        this.setupKeyboardListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            const code = e.code;
            // Prevent default browser scrolling on Space and Arrow keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
                e.preventDefault();
            }

            if (!this.keys[code]) {
                this.justPressedKeys[code] = true;
            }
            this.keys[code] = true;
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;
            this.keys[code] = false;
            this.justReleasedKeys[code] = true;
        });

        window.addEventListener('blur', () => {
            this.reset();
        });
    }

    reset() {
        this.keys = {};
        this.justPressedKeys = {};
        this.justReleasedKeys = {};
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchJumpJustPressed = false;
        this.touchJumpJustReleased = false;
    }

    // Call at the very end of each game frame
    clearFrame() {
        this.justPressedKeys = {};
        this.justReleasedKeys = {};
        this.touchJumpJustPressed = false;
        this.touchJumpJustReleased = false;
    }

    // Movement checks
    get moveLeft() {
        return !!(this.keys['KeyA'] || this.keys['ArrowLeft'] || this.touchLeft);
    }

    get moveRight() {
        return !!(this.keys['KeyD'] || this.keys['ArrowRight'] || this.touchRight);
    }

    // Jump checks
    get jumpDown() {
        return !!(this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp'] || this.touchJump);
    }

    get jumpJustPressed() {
        return !!(
            this.justPressedKeys['Space'] ||
            this.justPressedKeys['KeyW'] ||
            this.justPressedKeys['ArrowUp'] ||
            this.touchJumpJustPressed
        );
    }

    get jumpJustReleased() {
        return !!(
            this.justReleasedKeys['Space'] ||
            this.justReleasedKeys['KeyW'] ||
            this.justReleasedKeys['ArrowUp'] ||
            this.touchJumpJustReleased
        );
    }

    // Restart check
    get restartJustPressed() {
        return !!this.justPressedKeys['KeyR'];
    }

    // Pause check
    get pauseJustPressed() {
        return !!(this.justPressedKeys['KeyP'] || this.justPressedKeys['Escape']);
    }

    // Touch API triggers (called from HUD touch buttons)
    setTouchMove(direction, active) {
        if (direction === 'left') this.touchLeft = active;
        if (direction === 'right') this.touchRight = active;
    }

    setTouchJump(active) {
        if (active && !this.touchJump) {
            this.touchJumpJustPressed = true;
        } else if (!active && this.touchJump) {
            this.touchJumpJustReleased = true;
        }
        this.touchJump = active;
    }
}
