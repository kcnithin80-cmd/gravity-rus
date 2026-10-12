// Gravity Rush - 2D Physics & Collision System
export class Physics {
    static GRAVITY = 980; // Pixels / sec^2
    static MAX_FALL_SPEED = 750;
    static SUB_STEPS = 2; // Collision sub-stepping for anti-tunneling

    // Clamp helper
    static clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // Distance squared
    static distSq(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    // Circle vs Axis-Aligned Bounding Box (AABB)
    static testCircleAABB(cx, cy, radius, rx, ry, rw, rh) {
        // Find closest point on rectangle to circle center
        const closestX = this.clamp(cx, rx, rx + rw);
        const closestY = this.clamp(cy, ry, ry + rh);

        const dx = cx - closestX;
        const dy = cy - closestY;
        const dSq = dx * dx + dy * dy;

        if (dSq < radius * radius) {
            const dist = Math.sqrt(dSq);
            let nx = 0;
            let ny = 0;
            let overlap = 0;

            if (dist > 0.0001) {
                nx = dx / dist;
                ny = dy / dist;
                overlap = radius - dist;
            } else {
                // Circle center is inside rectangle: push along shallowest axis
                const left = cx - rx;
                const right = (rx + rw) - cx;
                const top = cy - ry;
                const bottom = (ry + rh) - cy;

                const minOverlap = Math.min(left, right, top, bottom);
                if (minOverlap === top) {
                    nx = 0; ny = -1; overlap = radius + top;
                } else if (minOverlap === bottom) {
                    nx = 0; ny = 1; overlap = radius + bottom;
                } else if (minOverlap === left) {
                    nx = -1; ny = 0; overlap = radius + left;
                } else {
                    nx = 1; ny = 0; overlap = radius + right;
                }
            }

            return {
                collided: true,
                normalX: nx,
                normalY: ny,
                overlap: overlap,
                contactX: closestX,
                contactY: closestY
            };
        }

        return { collided: false };
    }

    // Circle vs Line Segment (Slopes and arbitrary angled platforms)
    static testCircleSegment(cx, cy, radius, x1, y1, x2, y2) {
        const segDx = x2 - x1;
        const segDy = y2 - y1;
        const segLenSq = segDx * segDx + segDy * segDy;

        if (segLenSq === 0) {
            const dSq = this.distSq(cx, cy, x1, y1);
            if (dSq < radius * radius) {
                const dist = Math.sqrt(dSq);
                return {
                    collided: true,
                    normalX: dist > 0.001 ? (cx - x1) / dist : 0,
                    normalY: dist > 0.001 ? (cy - y1) / dist : -1,
                    overlap: radius - dist,
                    contactX: x1,
                    contactY: y1
                };
            }
            return { collided: false };
        }

        // Project circle center onto segment
        let t = ((cx - x1) * segDx + (cy - y1) * segDy) / segLenSq;
        t = this.clamp(t, 0, 1);

        const projX = x1 + t * segDx;
        const projY = y1 + t * segDy;

        const dx = cx - projX;
        const dy = cy - projY;
        const dSq = dx * dx + dy * dy;

        if (dSq < radius * radius) {
            const dist = Math.sqrt(dSq);
            let nx = 0;
            let ny = 0;

            if (dist > 0.0001) {
                nx = dx / dist;
                ny = dy / dist;
            } else {
                // Perpendicular to segment
                const len = Math.sqrt(segLenSq);
                nx = -segDy / len;
                ny = segDx / len;
            }

            return {
                collided: true,
                normalX: nx,
                normalY: ny,
                overlap: radius - dist,
                contactX: projX,
                contactY: projY
            };
        }

        return { collided: false };
    }

    // Circle vs Circle
    static testCircleCircle(c1x, c1y, r1, c2x, c2y, r2) {
        const dx = c1x - c2x;
        const dy = c1y - c2y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = r1 + r2;

        if (distSq < radiusSum * radiusSum) {
            const dist = Math.sqrt(distSq);
            let nx = 0;
            let ny = -1;
            if (dist > 0.0001) {
                nx = dx / dist;
                ny = dy / dist;
            }
            return {
                collided: true,
                normalX: nx,
                normalY: ny,
                overlap: radiusSum - dist
            };
        }
        return { collided: false };
    }
}
