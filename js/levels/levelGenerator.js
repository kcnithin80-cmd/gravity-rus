// Gravity Rush - Procedural Level Generator & Module System
// Generates infinite dynamically scalable levels (for level 61+ or Endless Challenge Mode)
import { WORLDS, getWorldForLevel } from './levelData.js';

export class LevelGenerator {
    static generate(levelNumber) {
        const worldKeys = Object.keys(WORLDS);
        const worldKey = worldKeys[(levelNumber - 1) % worldKeys.length];
        const world = WORLDS[worldKey];

        // Progressive difficulty scalers
        const difficulty = Math.min(1.0, (levelNumber - 1) / 80); // 0.0 to 1.0
        const segmentCount = 6 + Math.floor(difficulty * 6);      // 6 to 12 challenge segments
        const segmentWidth = 180 + Math.floor(Math.random() * 40);

        let curX = 80;
        let curY = 440;

        const platforms = [];
        const movingPlatforms = [];
        const fallingPlatforms = [];
        const rotatingPlatforms = [];
        const spikes = [];
        const blades = [];
        const lasers = [];
        const bouncePads = [];
        const speedBoosters = [];
        const gravityZones = [];
        const breakablePlatforms = [];
        const timedDoors = [];
        const checkpoints = [];

        // 1. Initial safe spawn platform
        platforms.push([curX - 40, curY + 40, 200, 40]);
        curX += 200;

        // 2. Generate progressive obstacle segments
        for (let s = 0; s < segmentCount; s++) {
            const gap = 110 + Math.floor(difficulty * 70); // 110px to 180px gap
            const elevationChange = (Math.random() - 0.45) * 120;
            curY = Math.max(180, Math.min(480, curY + elevationChange));
            curX += gap;

            const segmentType = Math.floor(Math.random() * 8);

            switch (segmentType) {
                case 0: // Normal platform with spikes
                    platforms.push([curX, curY + 40, 180, 40]);
                    if (Math.random() < 0.6 + difficulty * 0.4) {
                        spikes.push([curX + 60, curY + 22, 2, 'up']);
                    }
                    curX += 180;
                    break;

                case 1: // Moving platform
                    const moveRange = 100 + Math.floor(difficulty * 60);
                    movingPlatforms.push([curX, curY + 40, 110, 20, curX + moveRange, curY + 40, 80 + difficulty * 40]);
                    curX += 110 + moveRange;
                    platforms.push([curX + 50, curY + 40, 140, 40]);
                    curX += 190;
                    break;

                case 2: // Bounce pad launch
                    platforms.push([curX, curY + 40, 120, 40]);
                    bouncePads.push([curX + 30, curY + 30, 56, 14, 850 + difficulty * 100]);
                    curX += 120;
                    const highY = Math.max(140, curY - 180);
                    platforms.push([curX + 80, highY + 40, 160, 40]);
                    curX += 240;
                    curY = highY;
                    break;

                case 3: // Speed booster bridge
                    platforms.push([curX, curY + 40, 180, 40]);
                    speedBoosters.push([curX + 50, curY + 32, 60, 12, 1, 800]);
                    curX += 180;
                    // Giant hazard pit
                    spikes.push([curX, 580, 18, 'up']);
                    curX += 280;
                    platforms.push([curX, curY + 40, 180, 40]);
                    curX += 180;
                    break;

                case 4: // Falling & breakable ledges
                    fallingPlatforms.push([curX, curY + 40, 80, 16]);
                    curX += 130;
                    breakablePlatforms.push([curX, curY + 30, 80, 14]);
                    curX += 130;
                    platforms.push([curX, curY + 40, 140, 40]);
                    curX += 140;
                    break;

                case 5: // Rotating blade hazard
                    platforms.push([curX, curY + 40, 140, 40]);
                    blades.push([curX + 190, curY + 10, 28, 4 + difficulty * 2]);
                    curX += 240;
                    platforms.push([curX, curY + 40, 140, 40]);
                    curX += 140;
                    break;

                case 6: // Laser barrier
                    platforms.push([curX, curY + 40, 200, 40]);
                    lasers.push([curX + 100, curY - 140, curX + 100, curY + 40, 1.5, 1.4, Math.random() * 2]);
                    curX += 200;
                    break;

                case 7: // Timed security door
                    platforms.push([curX, curY + 40, 240, 40]);
                    timedDoors.push([curX + 110, curY - 50, 18, 90, 1.8, 1.8, Math.random()]);
                    curX += 240;
                    break;
            }

            // Place a checkpoint halfway through the level
            if (s === Math.floor(segmentCount / 2)) {
                checkpoints.push([curX - 60, curY + 40, 1]);
            }
        }

        // 3. Final finish platform
        curX += 120;
        platforms.push([curX, curY + 40, 250, 40]);
        const finishX = curX + 120;
        const finishY = curY - 36;

        return {
            number: levelNumber,
            world: worldKey,
            title: `Singularity Wave ${levelNumber}`,
            tip: levelNumber > 60 ? 'PROCEDURAL EXPERT RUN' : '',
            playerSpawn: { x: 80, y: 440 },
            parTime: 15.0 + segmentCount * 2.5,
            platforms,
            movingPlatforms,
            fallingPlatforms,
            rotatingPlatforms,
            spikes,
            blades,
            lasers,
            bouncePads,
            speedBoosters,
            gravityZones,
            breakablePlatforms,
            timedDoors,
            checkpoints,
            finish: { x: finishX, y: finishY, w: 48, h: 76 },
            bounds: { minX: 0, maxX: finishX + 300, minY: 0, maxY: 700 }
        };
    }
}
