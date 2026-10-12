# 🌌 Gravity Rush - Modern 2D Physics Arcade Game

**Gravity Rush** is a high-octane, modern futuristic 2D physics-based arcade platformer. Control an agile cyber hover-ball traveling through hazardous sectors, mastering momentum, variable jumping, gravity inversions, and high-speed maneuvers.

Inspired by the provided concept character and world reference sheets:
- **Character:** Segmented metallic armor plating, rotating hull seams, reactive cyan/color core eye, directional expressions (normal, happy idle, jump stretch, hyper-boost flames, damage alert, checkpoint glow), and 6 selectable skins.
- **Visuals & Worlds:** 8 distinct worlds (Neo City, Virtual Cyber Grid, Industrial Foundry, Deep Space Orbital, Frozen Glacier Spire, Magma Caldera, Floating Sky Islands, and the Singularity Gauntlet) with multi-layered parallax backgrounds and atmospheric ambient particles.
- **Audio:** 100% synthesized real-time procedural Web Audio sound design and progressive multi-track electronic synthwave music (no external audio files required!).

---

## 🎮 Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` or `Left` / `Right Arrow` | On-screen `◀` / `▶` buttons |
| **Jump** | `Space` / `W` / `Up Arrow` | On-screen `▲` Jump button |
| **Variable Jump Height** | Hold `Space` longer for higher leap | Hold Jump button longer |
| **Restart Level** | `R` | Top HUD `↺` button |
| **Pause / Menu** | `P` or `Escape` | Top HUD `⏸` button |

---

## ⚙️ Physics & Game Feel Highlights

- **Variable Jump Height:** Holding Space applies upward acceleration for up to 180ms. Releasing early cuts vertical velocity for precise short hops.
- **Coyote Time:** 120ms grace window after rolling off ledges where jumping remains valid.
- **Jump Buffering:** Pressing jump up to 140ms before landing triggers the jump instantly on touchdown.
- **Continuous Collision Resolution:** Multi-step collision sub-stepping eliminates high-speed clipping through thin ledges.
- **Dynamic Squash & Stretch:** Elongates along velocity vectors during flight and squashes horizontally on landing impacts.
- **Platform Physics:** Smooth momentum inheritance when jumping off moving or rotating platforms.
- **Dramatic Slow-Motion:** Near-misses and level completions trigger cinematic time dilation.

---

## 🧩 Modular Obstacles & Level Elements

1. **Static Platforms:** High-tech metallic ledges with neon edge trims and corner rivets.
2. **Moving Platforms:** Horizontal, vertical, and diagonal oscillating hover tracks.
3. **Rotating Platforms:** Revolving arms with central glowing hubs.
4. **Falling Platforms:** Vibrates for 0.55s upon contact before dropping, respawns after 3s.
5. **Spikes (Hazard Crystals):** Glowing neon crystalline hazards.
6. **Rotating Blades:** Spinning serrated circular sawblades.
7. **Lasers:** Pulsating synchronized energy beams with warning blink states.
8. **Bounce Pads:** High-restitution spring pads with shockwave VFX and boing audio.
9. **Speed Boosters:** Directional chevron acceleration pads with turbo jet flame trails.
10. **Gravity Zones:** Swirling purple vortex fields that invert or modify gravity.
11. **Breakable Platforms:** Fragile crystalline platforms that crumble upon contact.
12. **Timed Doors:** Sliding security barriers on cyclical timers.
13. **Checkpoints:** Holographic pylon beacons that pulse green and store respawn points.
14. **Finish Portals:** Grand dimensional portals with checkered headers and event horizon vortex suction.

---

## 🌟 Difficulty Tiers & Level Progression

- **Levels 1–5 (Beginner):** Tutorial mechanics, jump height variation, gentle gaps.
- **Levels 6–15 (Easy):** Bounce pads, moving platforms, small spikes, speed boosters.
- **Levels 16–30 (Medium):** Falling platforms, rotating saw blades, timed doors, gravity zones.
- **Levels 31–50 (Hard):** Precision jumps, laser gates, crushers, combined obstacle sequences.
- **Levels 51–60 (Expert):** High-octane gauntlets requiring momentum mastery.
- **Level 61+ (Endless Challenge Mode):** Infinite procedurally-generated challenge sectors!

---

## 🚀 How to Run the Game

### Method 1: Instant Launch (Double Click)
Double-click `start.bat` in this folder. It starts the local HTTP server and automatically opens `http://localhost:8080` in your default browser.

### Method 2: Manual Terminal
```powershell
& "C:\Users\USER\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
```
Then navigate to: **`http://localhost:8080`**
