// Gravity Rush - 60 Comprehensive Handcrafted & Curated Levels across 8 Worlds
// Structured according to the progressive difficulty tiers and Reference Image 2 environments

export const WORLDS = {
    city: {
        id: 'city',
        name: 'Neo City (Night)',
        levels: [1, 7],
        bgTheme: 'city',
        primaryGlow: '#00e5ff',
        skyGradient: ['#030712', '#0f172a', '#1e1b4b']
    },
    cyber: {
        id: 'cyber',
        name: 'Virtual Cyber Grid',
        levels: [8, 15],
        bgTheme: 'cyber',
        primaryGlow: '#d946ef',
        skyGradient: ['#0f051d', '#1e0836', '#2e1065']
    },
    industrial: {
        id: 'industrial',
        name: 'Industrial Foundry',
        levels: [16, 23],
        bgTheme: 'industrial',
        primaryGlow: '#f97316',
        skyGradient: ['#1c0c04', '#431407', '#7c2d12']
    },
    space: {
        id: 'space',
        name: 'Deep Space Orbital',
        levels: [24, 31],
        bgTheme: 'space',
        primaryGlow: '#38bdf8',
        skyGradient: ['#020617', '#090d16', '#0f172a']
    },
    ice: {
        id: 'ice',
        name: 'Frozen Glacier Spire',
        levels: [32, 39],
        bgTheme: 'ice',
        primaryGlow: '#38bdf8',
        skyGradient: ['#030b14', '#082f49', '#0c4a6e']
    },
    lava: {
        id: 'lava',
        name: 'Magma Caldera',
        levels: [40, 47],
        bgTheme: 'lava',
        primaryGlow: '#ef4444',
        skyGradient: ['#1a0404', '#450a0a', '#7f1d1d']
    },
    sky: {
        id: 'sky',
        name: 'Floating Sky Islands',
        levels: [48, 54],
        bgTheme: 'sky',
        primaryGlow: '#10b981',
        skyGradient: ['#022c22', '#064e3b', '#065f46']
    },
    expert: {
        id: 'expert',
        name: 'Singularity Gauntlet',
        levels: [55, 60],
        bgTheme: 'expert',
        primaryGlow: '#a855f7',
        skyGradient: ['#050014', '#190038', '#3b0764']
    }
};

export function getWorldForLevel(levelNumber) {
    for (const key in WORLDS) {
        const w = WORLDS[key];
        if (levelNumber >= w.levels[0] && levelNumber <= w.levels[1]) {
            return w;
        }
    }
    return WORLDS.expert;
}

// Level builder helper to streamline writing 60 levels
function createLevel(def) {
    return {
        number: def.number,
        world: def.world || 'city',
        title: def.title || `Sector ${def.number}`,
        tip: def.tip || '',
        playerSpawn: def.playerSpawn || { x: 100, y: 380 },
        parTime: def.parTime || 15.0,
        platforms: def.platforms || [],
        movingPlatforms: def.movingPlatforms || [],
        fallingPlatforms: def.fallingPlatforms || [],
        rotatingPlatforms: def.rotatingPlatforms || [],
        spikes: def.spikes || [],
        blades: def.blades || [],
        lasers: def.lasers || [],
        bouncePads: def.bouncePads || [],
        speedBoosters: def.speedBoosters || [],
        gravityZones: def.gravityZones || [],
        breakablePlatforms: def.breakablePlatforms || [],
        timedDoors: def.timedDoors || [],
        checkpoints: def.checkpoints || [],
        finish: def.finish || { x: 900, y: 340, w: 48, h: 76 },
        bounds: def.bounds || { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    };
}

// 60 Crafted Levels
export const LEVELS = [
    // ==========================================
    // WORLD 1: TUTORIAL & BEGINNER (LEVELS 1 - 7)
    // ==========================================
    createLevel({
        number: 1,
        world: 'city',
        title: 'First Roll',
        tip: 'USE [A] / [D] OR [ARROW KEYS] TO ROLL',
        playerSpawn: { x: 80, y: 380 },
        parTime: 6.0,
        platforms: [
            [50, 420, 850, 40]
        ],
        finish: { x: 800, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1000, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 2,
        world: 'city',
        title: 'Ledge Hop',
        tip: 'PRESS [SPACE] TO JUMP (HOLD FOR HIGHER LEAP)',
        playerSpawn: { x: 80, y: 380 },
        parTime: 8.0,
        platforms: [
            [50, 420, 240, 40],
            [350, 420, 260, 40],
            [670, 420, 300, 40]
        ],
        finish: { x: 880, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 3,
        world: 'city',
        title: 'Step Ascent',
        tip: 'HOLD [SPACE] LONGER FOR MAXIMUM JUMP HEIGHT',
        playerSpawn: { x: 80, y: 440 },
        parTime: 10.0,
        platforms: [
            [50, 480, 200, 40],
            [300, 410, 160, 40],
            [510, 330, 160, 40],
            [720, 250, 250, 40]
        ],
        finish: { x: 880, y: 174, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 4,
        world: 'city',
        title: 'Hazard Crystal',
        tip: 'AVOID RED SPIKES! LEAP OVER THEM CAREFULLY',
        playerSpawn: { x: 80, y: 380 },
        parTime: 9.0,
        platforms: [
            [50, 420, 280, 40],
            [400, 420, 520, 40]
        ],
        spikes: [
            [520, 402, 3, 'up']
        ],
        finish: { x: 820, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1050, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 5,
        world: 'city',
        title: 'Sky Tram',
        tip: 'STAND ON MOVING PLATFORMS TO RIDE ACROSS',
        playerSpawn: { x: 80, y: 380 },
        parTime: 12.0,
        platforms: [
            [50, 420, 200, 40],
            [780, 420, 240, 40]
        ],
        movingPlatforms: [
            [290, 420, 120, 20, 620, 420, 110]
        ],
        finish: { x: 920, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 6,
        world: 'city',
        title: 'Precision Strides',
        parTime: 11.0,
        platforms: [
            [50, 440, 180, 40],
            [280, 390, 90, 20],
            [430, 340, 90, 20],
            [580, 290, 90, 20],
            [740, 250, 260, 40]
        ],
        spikes: [
            [30, 560, 30, 'up']
        ],
        finish: { x: 900, y: 174, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 7,
        world: 'city',
        title: 'City Skyline Gateway',
        tip: 'ACTIVATE THE CHECKPOINT TO SAVE YOUR SPOT',
        playerSpawn: { x: 80, y: 440 },
        parTime: 14.0,
        platforms: [
            [50, 480, 220, 40],
            [320, 420, 140, 20],
            [520, 360, 220, 40],
            [800, 300, 260, 40]
        ],
        movingPlatforms: [
            [320, 420, 120, 20, 320, 320, 70]
        ],
        checkpoints: [
            [610, 360, 1]
        ],
        spikes: [
            [550, 342, 2, 'up']
        ],
        finish: { x: 960, y: 224, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 650 }
    }),

    // ==========================================
    // WORLD 2: CYBER GRID (LEVELS 8 - 15)
    // ==========================================
    createLevel({
        number: 8,
        world: 'cyber',
        title: 'Bounce Vector',
        tip: 'STEP ON BOUNCE PADS TO LAUNCH HIGH',
        playerSpawn: { x: 80, y: 440 },
        parTime: 10.0,
        platforms: [
            [50, 480, 260, 40],
            [600, 240, 300, 40]
        ],
        bouncePads: [
            [240, 470, 56, 14, 820]
        ],
        finish: { x: 790, y: 164, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1050, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 9,
        world: 'cyber',
        title: 'Hyper Boost',
        tip: 'SPEED BOOSTERS LAUNCH YOU OVER GIGANTIC GAPS',
        playerSpawn: { x: 80, y: 400 },
        parTime: 9.0,
        platforms: [
            [50, 440, 300, 40],
            [760, 440, 320, 40]
        ],
        speedBoosters: [
            [260, 432, 64, 12, 1, 750]
        ],
        spikes: [
            [400, 560, 15, 'up']
        ],
        finish: { x: 970, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 10,
        world: 'cyber',
        title: 'Laser Circuit',
        tip: 'WAIT FOR THE RED LASER TO TURN OFF BEFORE JUMPING',
        playerSpawn: { x: 80, y: 380 },
        parTime: 13.0,
        platforms: [
            [50, 420, 220, 40],
            [350, 420, 220, 40],
            [650, 420, 260, 40]
        ],
        lasers: [
            [300, 280, 300, 440, 1.8, 1.5, 0]
        ],
        finish: { x: 820, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1050, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 11,
        world: 'cyber',
        title: 'Double Spring Run',
        parTime: 12.0,
        platforms: [
            [50, 480, 200, 40],
            [400, 380, 120, 20],
            [750, 220, 260, 40]
        ],
        bouncePads: [
            [180, 470, 54, 14, 780],
            [460, 370, 54, 14, 820]
        ],
        spikes: [
            [260, 540, 20, 'up']
        ],
        finish: { x: 910, y: 144, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 12,
        world: 'cyber',
        title: 'Data Corridor',
        parTime: 15.0,
        platforms: [
            [50, 420, 180, 40],
            [290, 420, 140, 20],
            [500, 360, 180, 40],
            [760, 360, 250, 40]
        ],
        lasers: [
            [250, 260, 250, 440, 1.6, 1.4, 0.3],
            [710, 220, 710, 380, 1.6, 1.4, 1.1]
        ],
        checkpoints: [
            [590, 360, 1]
        ],
        finish: { x: 920, y: 284, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 13,
        world: 'cyber',
        title: 'Quantum Leap',
        parTime: 14.0,
        platforms: [
            [50, 440, 240, 40],
            [780, 380, 260, 40]
        ],
        speedBoosters: [
            [210, 432, 60, 12, 1, 780]
        ],
        bouncePads: [
            [500, 500, 60, 14, 900]
        ],
        spikes: [
            [300, 570, 25, 'up']
        ],
        finish: { x: 940, y: 304, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1180, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 14,
        world: 'cyber',
        title: 'Laser Weave',
        parTime: 16.0,
        platforms: [
            [50, 440, 180, 40],
            [290, 400, 120, 20],
            [480, 340, 120, 20],
            [670, 280, 120, 20],
            [860, 240, 240, 40]
        ],
        lasers: [
            [430, 240, 430, 420, 1.5, 1.5, 0],
            [620, 180, 620, 360, 1.5, 1.5, 0.8]
        ],
        finish: { x: 980, y: 164, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 15,
        world: 'cyber',
        title: 'Virtual Core Breach',
        parTime: 17.0,
        platforms: [
            [50, 460, 200, 40],
            [520, 420, 180, 40],
            [900, 320, 250, 40]
        ],
        movingPlatforms: [
            [280, 460, 110, 20, 440, 460, 90]
        ],
        bouncePads: [
            [640, 410, 54, 14, 860]
        ],
        lasers: [
            [780, 180, 780, 380, 1.4, 1.4, 0.5]
        ],
        checkpoints: [
            [590, 420, 1]
        ],
        finish: { x: 1040, y: 244, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 650 }
    }),

    // ==========================================
    // WORLD 3: INDUSTRIAL MECHANICAL (LEVELS 16 - 23)
    // ==========================================
    createLevel({
        number: 16,
        world: 'industrial',
        title: 'Crumbling Foundry',
        tip: 'CRUMBLING PLATFORMS SHAKE AND FALL AFTER BEING TOUCHED',
        playerSpawn: { x: 80, y: 380 },
        parTime: 11.0,
        platforms: [
            [50, 420, 200, 40],
            [720, 420, 260, 40]
        ],
        fallingPlatforms: [
            [300, 420, 100, 18],
            [460, 420, 100, 18]
        ],
        finish: { x: 880, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 17,
        world: 'industrial',
        title: 'Clockwork Arm',
        tip: 'TIME YOUR HOP ONTO ROTATING ARMS',
        playerSpawn: { x: 80, y: 380 },
        parTime: 13.0,
        platforms: [
            [50, 420, 180, 40],
            [680, 420, 260, 40]
        ],
        rotatingPlatforms: [
            [430, 380, 90, 1.5, 90, 14]
        ],
        finish: { x: 840, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1080, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 18,
        world: 'industrial',
        title: 'Buzzsaw Trench',
        tip: 'ROTATING SAWS ARE DEADLY ON CONTACT',
        playerSpawn: { x: 80, y: 380 },
        parTime: 14.0,
        platforms: [
            [50, 420, 200, 40],
            [340, 360, 140, 20],
            [640, 420, 260, 40]
        ],
        blades: [
            [260, 430, 26, 4],
            [550, 430, 26, -4]
        ],
        finish: { x: 800, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1050, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 19,
        world: 'industrial',
        title: 'Piston Lift',
        parTime: 15.0,
        platforms: [
            [50, 480, 180, 40],
            [740, 220, 250, 40]
        ],
        movingPlatforms: [
            [280, 480, 100, 20, 280, 320, 75],
            [480, 340, 100, 20, 480, 200, 80]
        ],
        spikes: [
            [200, 580, 25, 'up']
        ],
        finish: { x: 880, y: 144, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 20,
        world: 'industrial',
        title: 'Security Gate',
        tip: 'SLIP THROUGH TIMED DOORS BEFORE THEY SHUT',
        playerSpawn: { x: 80, y: 380 },
        parTime: 16.0,
        platforms: [
            [50, 420, 320, 40],
            [420, 420, 450, 40]
        ],
        timedDoors: [
            [370, 330, 18, 90, 2.2, 1.8, 0]
        ],
        spikes: [
            [520, 402, 3, 'up']
        ],
        finish: { x: 780, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1050, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 21,
        world: 'industrial',
        title: 'Sawblade Gauntlet',
        parTime: 18.0,
        platforms: [
            [50, 440, 180, 40],
            [320, 440, 140, 20],
            [580, 440, 140, 20],
            [840, 440, 250, 40]
        ],
        blades: [
            [250, 420, 28, 4.5],
            [510, 420, 28, -4.5],
            [770, 420, 28, 4.5]
        ],
        checkpoints: [
            [390, 440, 1]
        ],
        finish: { x: 980, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 22,
        world: 'industrial',
        title: 'Chain Reaction',
        parTime: 19.0,
        platforms: [
            [50, 460, 180, 40],
            [880, 300, 250, 40]
        ],
        fallingPlatforms: [
            [280, 440, 90, 18],
            [420, 400, 90, 18],
            [560, 360, 90, 18]
        ],
        rotatingPlatforms: [
            [740, 330, 80, 1.6, 85, 14]
        ],
        spikes: [
            [200, 580, 30, 'up']
        ],
        finish: { x: 1020, y: 224, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 23,
        world: 'industrial',
        title: 'The Steel Core',
        parTime: 22.0,
        platforms: [
            [50, 440, 200, 40],
            [480, 400, 160, 40],
            [940, 340, 260, 40]
        ],
        timedDoors: [
            [400, 320, 18, 90, 2.0, 2.0, 0],
            [750, 320, 18, 90, 2.0, 2.0, 1.0]
        ],
        blades: [
            [660, 420, 26, 4]
        ],
        bouncePads: [
            [560, 390, 54, 14, 820]
        ],
        checkpoints: [
            [540, 400, 1]
        ],
        finish: { x: 1080, y: 264, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1300, minY: 0, maxY: 600 }
    }),

    // ==========================================
    // WORLD 4: DEEP SPACE (LEVELS 24 - 31)
    // ==========================================
    createLevel({
        number: 24,
        world: 'space',
        title: 'Zero G Primer',
        tip: 'PURPLE VORTEX ZONES INVERT GRAVITY UPWARD!',
        playerSpawn: { x: 80, y: 380 },
        parTime: 12.0,
        platforms: [
            [50, 420, 240, 40],
            [750, 180, 300, 40] // Ceiling finish platform
        ],
        gravityZones: [
            [340, 100, 240, 380, -1.0]
        ],
        finish: { x: 920, y: 190, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 25,
        world: 'space',
        title: 'Ceiling Runner',
        parTime: 15.0,
        platforms: [
            [50, 420, 200, 40],
            [300, 160, 400, 30], // Inverted ceiling runway
            [800, 420, 260, 40]
        ],
        gravityZones: [
            [240, 100, 160, 380, -1.0],
            [720, 100, 140, 380, 1.0] // Invert back down
        ],
        finish: { x: 950, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 26,
        world: 'space',
        title: 'Asteroid Hop',
        parTime: 14.0,
        platforms: [
            [50, 420, 160, 40],
            [270, 360, 80, 16],
            [430, 300, 80, 16],
            [590, 240, 80, 16],
            [750, 180, 80, 16],
            [900, 220, 220, 40]
        ],
        finish: { x: 1020, y: 144, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 27,
        world: 'space',
        title: 'Cosmic Slalom',
        parTime: 16.0,
        platforms: [
            [50, 420, 200, 40],
            [350, 340, 140, 20],
            [650, 280, 140, 20],
            [900, 400, 240, 40]
        ],
        lasers: [
            [270, 200, 270, 480, 1.7, 1.4, 0],
            [570, 140, 570, 420, 1.7, 1.4, 0.8]
        ],
        checkpoints: [
            [420, 340, 1]
        ],
        finish: { x: 1040, y: 324, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 28,
        world: 'space',
        title: 'Dual Polarity',
        parTime: 18.0,
        platforms: [
            [50, 440, 180, 40],
            [300, 140, 220, 30],
            [600, 440, 220, 40],
            [920, 200, 250, 40]
        ],
        gravityZones: [
            [220, 80, 120, 400, -1.0],
            [540, 80, 120, 400, 1.0],
            [850, 80, 120, 400, -1.0]
        ],
        spikes: [
            [360, 172, 2, 'down'],
            [660, 422, 2, 'up']
        ],
        finish: { x: 1060, y: 210, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1300, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 29,
        world: 'space',
        title: 'Orbital Catapult',
        parTime: 17.0,
        platforms: [
            [50, 460, 220, 40],
            [880, 320, 250, 40]
        ],
        speedBoosters: [
            [200, 452, 60, 12, 1, 800]
        ],
        bouncePads: [
            [460, 540, 60, 14, 950]
        ],
        movingPlatforms: [
            [660, 340, 110, 20, 660, 200, 80]
        ],
        spikes: [
            [320, 620, 30, 'up']
        ],
        finish: { x: 1020, y: 244, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 700 }
    }),

    createLevel({
        number: 30,
        world: 'space',
        title: 'Event Horizon Approach',
        parTime: 20.0,
        platforms: [
            [50, 440, 180, 40],
            [440, 360, 180, 30],
            [860, 260, 260, 40]
        ],
        rotatingPlatforms: [
            [280, 400, 75, 1.8, 80, 14]
        ],
        lasers: [
            [680, 180, 680, 420, 1.6, 1.4, 0.4]
        ],
        checkpoints: [
            [520, 360, 1]
        ],
        finish: { x: 1010, y: 184, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 31,
        world: 'space',
        title: 'Deep Singularity Gateway',
        parTime: 22.0,
        platforms: [
            [50, 440, 160, 40],
            [960, 320, 240, 40]
        ],
        gravityZones: [
            [220, 100, 180, 380, -1.0],
            [720, 100, 180, 380, 1.0]
        ],
        movingPlatforms: [
            [460, 160, 120, 20, 650, 160, 100] // moving along ceiling
        ],
        spikes: [
            [300, 580, 28, 'up']
        ],
        finish: { x: 1090, y: 244, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1300, minY: 0, maxY: 650 }
    }),

    // ==========================================
    // WORLD 5: FROZEN ICE SPIRE (LEVELS 32 - 39)
    // ==========================================
    createLevel({
        number: 32,
        world: 'ice',
        title: 'Permafrost Cracks',
        tip: 'CRACKED BLUE PLATFORMS SHATTER ON STEP',
        playerSpawn: { x: 80, y: 380 },
        parTime: 12.0,
        platforms: [
            [50, 420, 200, 40],
            [750, 420, 250, 40]
        ],
        breakablePlatforms: [
            [300, 420, 80, 14],
            [440, 420, 80, 14],
            [580, 420, 80, 14]
        ],
        finish: { x: 890, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 33,
        world: 'ice',
        title: 'Narrow Glacier Needle',
        tip: 'PRECISION LANDINGS ON NARROW NEEDLES',
        playerSpawn: { x: 80, y: 440 },
        parTime: 14.0,
        platforms: [
            [50, 480, 180, 40],
            [280, 420, 50, 16],
            [400, 360, 50, 16],
            [520, 300, 50, 16],
            [660, 260, 250, 40]
        ],
        spikes: [
            [200, 580, 26, 'up']
        ],
        finish: { x: 810, y: 184, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1050, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 34,
        world: 'ice',
        title: 'Frost Saw Drift',
        parTime: 15.0,
        platforms: [
            [50, 420, 180, 40],
            [300, 380, 120, 20],
            [520, 340, 120, 20],
            [740, 420, 260, 40]
        ],
        blades: [
            [240, 420, 26, 4],
            [460, 380, 26, -4],
            [680, 420, 26, 4]
        ],
        finish: { x: 900, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 35,
        world: 'ice',
        title: 'Sub-Zero Spring',
        parTime: 16.0,
        platforms: [
            [50, 460, 200, 40],
            [440, 280, 140, 30],
            [840, 220, 250, 40]
        ],
        bouncePads: [
            [200, 450, 54, 14, 860],
            [520, 270, 54, 14, 820]
        ],
        spikes: [
            [280, 580, 26, 'up']
        ],
        finish: { x: 980, y: 144, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 36,
        world: 'ice',
        title: 'Avalanche Ledge',
        parTime: 18.0,
        platforms: [
            [50, 440, 160, 40],
            [840, 360, 250, 40]
        ],
        fallingPlatforms: [
            [260, 440, 80, 16],
            [390, 410, 80, 16]
        ],
        breakablePlatforms: [
            [520, 380, 80, 14],
            [660, 360, 80, 14]
        ],
        checkpoints: [
            [560, 380, 1]
        ],
        finish: { x: 980, y: 284, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 37,
        world: 'ice',
        title: 'Glacial Pendulum',
        parTime: 19.0,
        platforms: [
            [50, 440, 160, 40],
            [840, 440, 250, 40]
        ],
        rotatingPlatforms: [
            [300, 400, 85, 1.7, 85, 14],
            [580, 400, 85, -1.7, 85, 14]
        ],
        blades: [
            [440, 420, 28, 5]
        ],
        finish: { x: 980, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 38,
        world: 'ice',
        title: 'Cryo Security Grid',
        parTime: 20.0,
        platforms: [
            [50, 440, 200, 40],
            [380, 440, 220, 40],
            [740, 440, 260, 40]
        ],
        timedDoors: [
            [320, 340, 18, 90, 2.0, 2.0, 0],
            [660, 340, 18, 90, 2.0, 2.0, 1.0]
        ],
        lasers: [
            [490, 240, 490, 440, 1.5, 1.5, 0.5]
        ],
        checkpoints: [
            [440, 440, 1]
        ],
        finish: { x: 890, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1150, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 39,
        world: 'ice',
        title: 'Apex Glacier Spire',
        parTime: 22.0,
        platforms: [
            [50, 460, 180, 40],
            [920, 180, 250, 40]
        ],
        bouncePads: [
            [180, 450, 54, 14, 820]
        ],
        breakablePlatforms: [
            [360, 300, 70, 14],
            [540, 240, 70, 14]
        ],
        movingPlatforms: [
            [700, 200, 100, 20, 700, 340, 90]
        ],
        finish: { x: 1060, y: 104, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1280, minY: 0, maxY: 650 }
    }),

    // ==========================================
    // WORLD 6: MAGMA CALDERA (LEVELS 40 - 47)
    // ==========================================
    createLevel({
        number: 40,
        world: 'lava',
        title: 'Magma Chamber',
        tip: 'HEAT HAZARDS EVERYWHERE - KEEP ROLLING!',
        playerSpawn: { x: 80, y: 380 },
        parTime: 12.0,
        platforms: [
            [50, 420, 240, 40],
            [400, 420, 220, 40],
            [720, 420, 260, 40]
        ],
        spikes: [
            [0, 580, 55, 'up'],
            [510, 402, 3, 'up']
        ],
        finish: { x: 880, y: 344, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1100, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 41,
        world: 'lava',
        title: 'Thermal Jet Stream',
        parTime: 14.0,
        platforms: [
            [50, 440, 200, 40],
            [800, 440, 260, 40]
        ],
        speedBoosters: [
            [190, 432, 60, 12, 1, 820]
        ],
        spikes: [
            [260, 580, 25, 'up']
        ],
        fallingPlatforms: [
            [480, 440, 100, 18]
        ],
        finish: { x: 960, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 42,
        world: 'lava',
        title: 'Obsidian Crushes',
        parTime: 17.0,
        platforms: [
            [50, 440, 180, 40],
            [300, 440, 160, 30],
            [560, 440, 160, 30],
            [820, 440, 250, 40]
        ],
        timedDoors: [
            [240, 340, 18, 90, 1.8, 1.8, 0],
            [500, 340, 18, 90, 1.8, 1.8, 0.9],
            [760, 340, 18, 90, 1.8, 1.8, 0]
        ],
        checkpoints: [
            [380, 440, 1]
        ],
        finish: { x: 960, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 43,
        world: 'lava',
        title: 'Molten Blades',
        parTime: 16.0,
        platforms: [
            [50, 440, 180, 40],
            [320, 380, 120, 20],
            [600, 380, 120, 20],
            [880, 440, 240, 40]
        ],
        blades: [
            [240, 400, 28, 4.5],
            [480, 380, 30, -5],
            [760, 400, 28, 4.5]
        ],
        finish: { x: 1010, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1220, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 44,
        world: 'lava',
        title: 'Inverted Magma Well',
        parTime: 18.0,
        platforms: [
            [50, 440, 180, 40],
            [320, 160, 320, 30], // Ceiling runway
            [800, 440, 260, 40]
        ],
        gravityZones: [
            [240, 100, 120, 380, -1.0],
            [680, 100, 120, 380, 1.0]
        ],
        blades: [
            [480, 200, 26, 4]
        ],
        spikes: [
            [0, 580, 45, 'up']
        ],
        finish: { x: 960, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 45,
        world: 'lava',
        title: 'Pumice Collapse',
        parTime: 19.0,
        platforms: [
            [50, 440, 180, 40],
            [860, 440, 250, 40]
        ],
        fallingPlatforms: [
            [280, 440, 80, 16],
            [420, 400, 80, 16],
            [560, 360, 80, 16],
            [700, 400, 80, 16]
        ],
        lasers: [
            [490, 200, 490, 360, 1.6, 1.4, 0]
        ],
        checkpoints: [
            [460, 400, 1]
        ],
        finish: { x: 1000, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1220, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 46,
        world: 'lava',
        title: 'The Crucible',
        parTime: 21.0,
        platforms: [
            [50, 460, 180, 40],
            [500, 380, 160, 30],
            [940, 300, 260, 40]
        ],
        movingPlatforms: [
            [260, 460, 100, 20, 400, 460, 80]
        ],
        bouncePads: [
            [580, 370, 54, 14, 880]
        ],
        blades: [
            [740, 280, 30, 5]
        ],
        checkpoints: [
            [530, 380, 1]
        ],
        finish: { x: 1090, y: 224, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1300, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 47,
        world: 'lava',
        title: 'Core Eruption',
        parTime: 24.0,
        platforms: [
            [50, 460, 180, 40],
            [1050, 220, 250, 40]
        ],
        speedBoosters: [
            [180, 452, 60, 12, 1, 840]
        ],
        fallingPlatforms: [
            [420, 440, 90, 16],
            [640, 360, 90, 16]
        ],
        rotatingPlatforms: [
            [850, 300, 80, 2.0, 85, 14]
        ],
        spikes: [
            [0, 580, 55, 'up']
        ],
        finish: { x: 1190, y: 144, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1400, minY: 0, maxY: 650 }
    }),

    // ==========================================
    // WORLD 7: SKY ISLANDS (LEVELS 48 - 54)
    // ==========================================
    createLevel({
        number: 48,
        world: 'sky',
        title: 'Zephyr Leap',
        tip: 'HIGH ALTITUDE WINDS - PRECISE JUMP TIMING NEEDED',
        playerSpawn: { x: 80, y: 440 },
        parTime: 14.0,
        platforms: [
            [50, 480, 200, 40],
            [350, 420, 120, 20],
            [570, 360, 120, 20],
            [790, 300, 120, 20],
            [1010, 240, 240, 40]
        ],
        finish: { x: 1140, y: 164, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1350, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 49,
        world: 'sky',
        title: 'Floating Conveyor',
        parTime: 16.0,
        platforms: [
            [50, 440, 180, 40],
            [860, 440, 250, 40]
        ],
        movingPlatforms: [
            [280, 440, 100, 20, 520, 440, 110],
            [580, 380, 100, 20, 780, 380, 110]
        ],
        finish: { x: 990, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1200, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 50,
        world: 'sky',
        title: 'Cloudburst Launch',
        parTime: 17.0,
        platforms: [
            [50, 460, 180, 40],
            [460, 260, 120, 20],
            [880, 200, 250, 40]
        ],
        bouncePads: [
            [180, 450, 54, 14, 880],
            [520, 250, 54, 14, 880]
        ],
        spikes: [
            [260, 580, 25, 'up']
        ],
        finish: { x: 1010, y: 124, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 51,
        world: 'sky',
        title: 'Rotor Island',
        parTime: 19.0,
        platforms: [
            [50, 440, 160, 40],
            [860, 440, 250, 40]
        ],
        rotatingPlatforms: [
            [290, 400, 80, 1.8, 85, 14],
            [580, 400, 80, -1.8, 85, 14]
        ],
        blades: [
            [435, 400, 28, 4]
        ],
        checkpoints: [
            [540, 400, 1]
        ],
        finish: { x: 1000, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1220, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 52,
        world: 'sky',
        title: 'Skyfall Ledges',
        parTime: 20.0,
        platforms: [
            [50, 440, 160, 40],
            [900, 300, 240, 40]
        ],
        fallingPlatforms: [
            [260, 440, 80, 16],
            [400, 400, 80, 16],
            [540, 360, 80, 16]
        ],
        movingPlatforms: [
            [700, 320, 100, 20, 700, 440, 90]
        ],
        finish: { x: 1030, y: 224, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1250, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 53,
        world: 'sky',
        title: 'The Stratosphere',
        parTime: 22.0,
        platforms: [
            [50, 460, 180, 40],
            [500, 360, 160, 30],
            [960, 220, 250, 40]
        ],
        speedBoosters: [
            [170, 452, 60, 12, 1, 800]
        ],
        bouncePads: [
            [560, 350, 54, 14, 900]
        ],
        lasers: [
            [350, 220, 350, 460, 1.5, 1.5, 0],
            [760, 160, 760, 380, 1.5, 1.5, 0.7]
        ],
        checkpoints: [
            [530, 360, 1]
        ],
        finish: { x: 1100, y: 144, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1300, minY: 0, maxY: 650 }
    }),

    createLevel({
        number: 54,
        world: 'sky',
        title: 'Celestial Spire Crossing',
        parTime: 24.0,
        platforms: [
            [50, 440, 160, 40],
            [1040, 320, 240, 40]
        ],
        rotatingPlatforms: [
            [270, 400, 80, 2.0, 80, 14],
            [500, 340, 80, -2.0, 80, 14]
        ],
        fallingPlatforms: [
            [720, 340, 80, 16],
            [870, 340, 80, 16]
        ],
        checkpoints: [
            [580, 340, 1]
        ],
        finish: { x: 1170, y: 244, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1380, minY: 0, maxY: 600 }
    }),

    // ==========================================
    // WORLD 8: SINGULARITY GAUNTLET (LEVELS 55 - 60)
    // EXPERT TIER (Combines All Mechanics)
    // ==========================================
    createLevel({
        number: 55,
        world: 'expert',
        title: 'Singularity Ingress',
        tip: 'EXPERT DIFFICULTY: PRECISE TIMING AND SPEED REQUIRED',
        playerSpawn: { x: 80, y: 440 },
        parTime: 18.0,
        platforms: [
            [50, 480, 180, 40],
            [960, 360, 240, 40]
        ],
        speedBoosters: [
            [170, 472, 60, 12, 1, 840]
        ],
        bouncePads: [
            [440, 520, 54, 14, 950]
        ],
        lasers: [
            [680, 220, 680, 440, 1.4, 1.3, 0]
        ],
        timedDoors: [
            [860, 280, 18, 90, 1.8, 1.8, 0.4]
        ],
        spikes: [
            [240, 620, 30, 'up']
        ],
        finish: { x: 1090, y: 284, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1300, minY: 0, maxY: 680 }
    }),

    createLevel({
        number: 56,
        world: 'expert',
        title: 'Vortex Overdrive',
        parTime: 20.0,
        platforms: [
            [50, 440, 160, 40],
            [320, 140, 260, 30], // Inverted ceiling
            [700, 440, 180, 30],
            [1040, 200, 240, 40]
        ],
        gravityZones: [
            [220, 80, 120, 400, -1.0],
            [600, 80, 120, 400, 1.0],
            [940, 80, 120, 400, -1.0]
        ],
        blades: [
            [450, 180, 28, 5],
            [800, 420, 28, -5]
        ],
        checkpoints: [
            [750, 440, 1]
        ],
        finish: { x: 1180, y: 210, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1400, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 57,
        world: 'expert',
        title: 'Temporal Labyrinth',
        parTime: 22.0,
        platforms: [
            [50, 440, 180, 40],
            [320, 440, 160, 30],
            [600, 440, 160, 30],
            [880, 440, 160, 30],
            [1140, 440, 240, 40]
        ],
        timedDoors: [
            [260, 340, 18, 90, 1.6, 1.6, 0],
            [540, 340, 18, 90, 1.6, 1.6, 0.6],
            [820, 340, 18, 90, 1.6, 1.6, 1.2],
            [1080, 340, 18, 90, 1.6, 1.6, 0.3]
        ],
        lasers: [
            [420, 260, 420, 440, 1.4, 1.4, 0.4],
            [700, 260, 700, 440, 1.4, 1.4, 1.0]
        ],
        checkpoints: [
            [650, 440, 1]
        ],
        finish: { x: 1270, y: 364, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1450, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 58,
        world: 'expert',
        title: 'The Saw Gauntlet',
        parTime: 21.0,
        platforms: [
            [50, 440, 160, 40],
            [300, 380, 100, 20],
            [520, 340, 100, 20],
            [740, 300, 100, 20],
            [960, 260, 100, 20],
            [1180, 240, 240, 40]
        ],
        blades: [
            [230, 420, 28, 4.5],
            [410, 360, 28, -5],
            [630, 320, 28, 5],
            [850, 280, 28, -5],
            [1070, 250, 28, 5]
        ],
        checkpoints: [
            [770, 300, 1]
        ],
        finish: { x: 1310, y: 164, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1500, minY: 0, maxY: 600 }
    }),

    createLevel({
        number: 59,
        world: 'expert',
        title: 'Cosmic Dissolution',
        parTime: 25.0,
        platforms: [
            [50, 460, 160, 40],
            [1260, 240, 240, 40]
        ],
        fallingPlatforms: [
            [240, 460, 75, 16],
            [360, 420, 75, 16]
        ],
        breakablePlatforms: [
            [480, 380, 75, 14],
            [600, 340, 75, 14]
        ],
        rotatingPlatforms: [
            [770, 340, 80, 2.2, 80, 14],
            [980, 280, 80, -2.2, 80, 14]
        ],
        bouncePads: [
            [1100, 360, 54, 14, 920]
        ],
        spikes: [
            [0, 620, 60, 'up']
        ],
        checkpoints: [
            [620, 340, 1]
        ],
        finish: { x: 1390, y: 164, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1600, minY: 0, maxY: 680 }
    }),

    createLevel({
        number: 60,
        world: 'expert',
        title: 'Master of Gravity',
        parTime: 28.0,
        playerSpawn: { x: 80, y: 440 },
        platforms: [
            [50, 480, 160, 40],
            [300, 140, 240, 30], // Inverted section
            [650, 440, 180, 30],
            [1380, 240, 260, 40]
        ],
        speedBoosters: [
            [160, 472, 60, 12, 1, 860]
        ],
        gravityZones: [
            [220, 80, 100, 440, -1.0],
            [560, 80, 100, 440, 1.0],
            [940, 80, 100, 440, -1.0]
        ],
        timedDoors: [
            [440, 80, 18, 90, 1.5, 1.5, 0]
        ],
        lasers: [
            [780, 220, 780, 440, 1.4, 1.4, 0.4]
        ],
        rotatingPlatforms: [
            [1080, 280, 85, 2.4, 85, 14]
        ],
        bouncePads: [
            [1220, 380, 56, 14, 920]
        ],
        spikes: [
            [0, 640, 70, 'up']
        ],
        checkpoints: [
            [690, 440, 1]
        ],
        finish: { x: 1520, y: 164, w: 48, h: 76 },
        bounds: { minX: 0, maxX: 1750, minY: 0, maxY: 700 }
    })
];
