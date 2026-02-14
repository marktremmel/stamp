
export interface STLOptions {
    baseHeight: number; // mm
    extrusionHeight: number; // mm
    pixelSize: number; // mm, usually 0.4
    fixNonManifold?: boolean; // Now defaults to "Heightmap" mode which is always manifold
}

export const generateSTL = (imageData: ImageData, options: STLOptions): Blob => {
    const { width, height, data } = imageData;
    const { baseHeight, extrusionHeight, pixelSize } = options;



    const triangles: number[] = [];

    // Helper to push a triangle with automatic normal calculation
    const pushTriangle = (v1: number[], v2: number[], v3: number[]) => {
        const ux = v2[0] - v1[0], uy = v2[1] - v1[1], uz = v2[2] - v1[2];
        const vx = v3[0] - v1[0], vy = v3[1] - v1[1], vz = v3[2] - v1[2];

        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) { nx /= len; ny /= len; nz /= len; }

        triangles.push(nx, ny, nz, ...v1, ...v2, ...v3);
    };

    const pushQuad = (v1: number[], v2: number[], v3: number[], v4: number[]) => {
        // CCW winding
        pushTriangle(v1, v2, v3);
        pushTriangle(v1, v3, v4);
    };

    // Get height at x,y. Returns 0 if OOB.
    const getHeight = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return 0;
        const idx = (y * width + x) * 4;
        // If black (<128), it's raised (ink). If white, it's just base.
        const isInk = data[idx] < 128;
        return isInk ? baseHeight + extrusionHeight : baseHeight;
    };

    // Iterate grid
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const h = getHeight(x, y);

            const x0 = x * pixelSize;
            const x1 = (x + 1) * pixelSize;
            const y0 = y * pixelSize;
            const y1 = (y + 1) * pixelSize;

            // 1. Top Face (at z = h) - Facing Up
            pushQuad([x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]);

            // 2. Bottom Face (at z = 0) - Facing Down
            // Note: To match STL requirements for a solid, this should be wound CW if looking from top, 
            // or CCW looking from bottom.
            // Standard CCW rule: v1-v2-v3.
            // y1->y0 reverses the order.
            pushQuad([x0, y1, 0], [x1, y1, 0], [x1, y0, 0], [x0, y0, 0]);

            // 3. Side Walls (only if neighbor is lower)
            // We only generate "outward" facing walls. A wall exists if my height > neighbor height.
            // The wall goes from neighbor_h to my_h.

            // North (y-1)
            const nh_n = getHeight(x, y - 1);
            if (h > nh_n) {
                // Wall facing -Y.
                // Vertices: x0->x1 at z=h (top), x0->x1 at z=nh (bottom)
                pushQuad([x0, y0, nh_n], [x1, y0, nh_n], [x1, y0, h], [x0, y0, h]);
            }

            // South (y+1)
            const nh_s = getHeight(x, y + 1);
            if (h > nh_s) {
                // Wall facing +Y
                pushQuad([x1, y1, nh_s], [x0, y1, nh_s], [x0, y1, h], [x1, y1, h]);
            }

            // West (x-1)
            const nh_w = getHeight(x - 1, y);
            if (h > nh_w) {
                // Wall facing -X
                pushQuad([x0, y1, nh_w], [x0, y0, nh_w], [x0, y0, h], [x0, y1, h]);
            }

            // East (x+1)
            const nh_e = getHeight(x + 1, y);
            if (h > nh_e) {
                // Wall facing +X
                pushQuad([x1, y0, nh_e], [x1, y1, nh_e], [x1, y1, h], [x1, y0, h]);
            }
        }
    }

    // Convert float array to Binary STL
    const numTriangles = triangles.length / 12;
    const bufferSize = 80 + 4 + numTriangles * 50;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    view.setUint32(80, numTriangles, true);

    let offset = 84;
    for (let i = 0; i < triangles.length; i += 12) {
        // Normal
        view.setFloat32(offset, triangles[i], true);
        view.setFloat32(offset + 4, triangles[i + 1], true);
        view.setFloat32(offset + 8, triangles[i + 2], true);

        // V1
        view.setFloat32(offset + 12, triangles[i + 3], true);
        view.setFloat32(offset + 16, triangles[i + 4], true);
        view.setFloat32(offset + 20, triangles[i + 5], true);

        // V2
        view.setFloat32(offset + 24, triangles[i + 6], true);
        view.setFloat32(offset + 28, triangles[i + 7], true);
        view.setFloat32(offset + 32, triangles[i + 8], true);

        // V3
        view.setFloat32(offset + 36, triangles[i + 9], true);
        view.setFloat32(offset + 40, triangles[i + 10], true);
        view.setFloat32(offset + 44, triangles[i + 11], true);

        view.setUint16(offset + 48, 0, true);

        offset += 50;
    }

    return new Blob([buffer], { type: 'application/octet-stream' });
};
