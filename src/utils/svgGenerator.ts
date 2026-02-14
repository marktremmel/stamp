// @ts-ignore
import ImageTracer from 'imagetracerjs';

export const generateSVG = (imageData: ImageData): Promise<string> => {
    return new Promise((resolve) => {
        // Imagetracerjs expects an object with width, height, data
        // The data array should be RGBA

        // We can pass the ImageData directly to imagetracerjs if we use the right method
        // Or we can create a placeholder generic object

        const options = {
            ltr: true,
            numberofcolors: 2,
            pathomit: 1, // Only very small specks
            blurradius: 0,
            blurdelta: 20
        };

        // ImageTracer.imagedataToSVG( imageData, options );
        const svgstr = ImageTracer.imagedataToSVG(imageData, options);
        resolve(svgstr);
    });
};
