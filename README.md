# Stamp Ready

A simple client-side tool to convert images into 3D printable stamps.

## Features
- **Smart Resizing**: Optimized for 0.4mm nozzles.
- **Contrast Control**: Adjust threshold for perfect black & white stamps.
- **Manifold Fix**: Generates watertight heightmaps.

## ⚠️ Non-Manifold Edges Disclaimer
While this tool uses a heightmap algorithm to generate watertight meshes, some slicers might still flag "non-manifold edges" due to the way vertical walls are generated on pixel boundaries.

**If your slicer complains or the print fails:**
Please run the exported STL through **[Formware Online STL Repair](https://www.formware.co/onlinestlrepair)**. It is free and fixes these edge cases perfectly.

## How to Run
1. `npm install`
2. `npm run dev`
