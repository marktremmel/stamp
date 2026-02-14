import { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { Layers, Download } from 'lucide-react';
import { loadImage, processImage, imageDataToDataUrl, type ProcessOptions } from './utils/imageProcessor';
import { saveAs } from 'file-saver';
import { generateSVG } from './utils/svgGenerator';
import { generateSTL } from './utils/stlGenerator';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [threshold, setThreshold] = useState(128);
  const [invert, setInvert] = useState(false);
  const [outputSize, setOutputSize] = useState(35); // mm
  const [smoothing, setSmoothing] = useState(0);
  const [fixManifold, setFixManifold] = useState(true); // Default to true as it's better

  // State for processed results
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (file) {
      loadImage(file).then(img => {
        setOriginalImage(img);
      });
    }
  }, [file]);

  // Process image when settings or image changes
  useEffect(() => {
    if (!originalImage) return;

    setIsProcessing(true);

    // logic: 35mm -> ~88px (assuming 0.4mm nozzle as 1px)
    // resolution = 1 / 0.4 = 2.5 px/mm
    const pixelRatio = 1 / 0.4;
    const targetWidth = Math.round(outputSize * pixelRatio);

    const options: ProcessOptions = {
      threshold,
      invert,
      targetWidth, // Maintain aspect ratio
      smoothing
    };

    // Use a timeout to avoid blocking UI on slider changes
    const timer = setTimeout(() => {
      try {
        const data = processImage(originalImage, options);
        setProcessedData(data);
        setPreviewUrl(imageDataToDataUrl(data));
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    }, 100);

    return () => clearTimeout(timer);

  }, [originalImage, threshold, invert, outputSize, smoothing]);


  const handleImageUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleExportSVG = async () => {
    if (!processedData) return;
    try {
      const svgString = await generateSVG(processedData);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      saveAs(blob, "stamp.svg");
    } catch (e) {
      console.error("Export SVG failed", e);
      alert("Export SVG failed. See console.");
    }
  };

  const handleExportSTL = async () => {
    if (!processedData) return;
    try {
      // Defaults: 2mm base, 1mm extrusion
      const stlBlob = await generateSTL(processedData, {
        baseHeight: 2,
        extrusionHeight: 1,
        pixelSize: 0.4, // mm
        fixNonManifold: fixManifold
      });
      saveAs(stlBlob, "stamp.stl");
    } catch (e) {
      console.error("Export STL failed", e);
      alert("Export STL failed. See console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-2 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-600" />
              Stamp Ready
            </h1>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl">
            Convert images to 3D printable stamps. Optimized for 0.4mm nozzles.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <ImageUploader onImageUpload={handleImageUpload} />

            <ControlPanel
              threshold={threshold}
              setThreshold={setThreshold}
              invert={invert}
              setInvert={setInvert}
              outputSize={outputSize}
              setOutputSize={setOutputSize}
              smoothing={smoothing}
              setSmoothing={setSmoothing}
              fixManifold={fixManifold}
              setFixManifold={setFixManifold}
              onExportSVG={handleExportSVG}
              onExportSTL={handleExportSTL}
            />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Preview</h2>
              {processedData && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {processedData.width} x {processedData.height} px
                  <span className="mx-2 text-indigo-300">|</span>
                  ~{(processedData.width * 0.4).toFixed(1)} mm wide
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative p-8">
              <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none"></div>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={`max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-200 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}
                  style={{
                    imageRendering: 'pixelated' // improved visibility for low-res stamps
                  }}
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <Layers className="w-16 h-16 mx-auto mb-2 opacity-20" />
                  <p>Upload an image to start</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Preview
              </h3>
              <p>
                Ensure black areas (ink) are continuous. Isolated white pixels might cause printing issues.
                Use smoothing to remove noise.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
