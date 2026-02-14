
export interface ProcessOptions {
    threshold: number;
    invert: boolean;
    targetWidth?: number; // if undefined, keep original aspect ratio based on height
    targetHeight?: number; // if undefined, keep original aspect ratio based on width
    smoothing?: number; // 0-5
}

export const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

export const processImage = (
    img: HTMLImageElement,
    options: ProcessOptions
): ImageData => {
    const { threshold, invert, targetWidth, targetHeight, smoothing } = options;

    // 1. Calculate dimensions
    let width = img.width;
    let height = img.height;

    if (targetWidth && targetHeight) {
        width = targetWidth;
        height = targetHeight;
    } else if (targetWidth) {
        const aspect = img.height / img.width;
        width = targetWidth;
        height = Math.round(width * aspect);
    }

    // 2. Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");

    // 3. Draw image (Scaling happens here via canvas draw)
    // For pixel art style, we might want to disable smoothing, but for stamps, 
    // slight smoothing during downscale is usually better before thresholding.
    ctx.drawImage(img, 0, 0, width, height);

    // 4. Get Data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 5. Pixel Processing
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Grayscale (luminance)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Threshold
        let val = gray < threshold ? 0 : 255;

        // Invert
        // Usually for stamps: Black = Ink (Raised), White = Background (Recessed)
        // If 'invert' is true, we swap. 
        // Let's standardize: 0 (Black) will be raised, 255 (White) will be flat.
        if (invert) {
            val = 255 - val;
        }

        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = a; // Keep alpha? Or force opaque?
        // For STL generation, we treat alpha as 0 height usually, or white.
        // Let's force alpha 255 for now to make visualization easier.
        data[i + 3] = 255;
    }

    // 6. Smoothing / Morphological operations (Simple erosion/dilation if requested)
    if (smoothing && smoothing > 0) {
        // TODO: Implement simple box blur or median filter if needed.
        // For now, we skip complex morphology in this basic version.
    }

    return imageData;
};

export const imageDataToDataUrl = (imageData: ImageData): string => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    }
    return '';
};
