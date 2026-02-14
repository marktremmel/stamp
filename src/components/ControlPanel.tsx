import React from 'react';
import { Sliders, Maximize } from 'lucide-react';

interface ControlPanelProps {
    threshold: number;
    setThreshold: (value: number) => void;
    invert: boolean;
    setInvert: (value: boolean) => void;
    outputSize: number; // in mm
    setOutputSize: (value: number) => void;
    smoothing: number;
    setSmoothing: (value: number) => void;
    fixManifold: boolean;
    setFixManifold: (value: boolean) => void;
    onExportSVG: () => void;
    onExportSTL: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    threshold, setThreshold,
    invert, setInvert,
    outputSize, setOutputSize,
    smoothing, setSmoothing,
    fixManifold, setFixManifold,
    onExportSVG, onExportSTL
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="w-5 h-5" /> Settings
            </h2>

            {/* Threshold Control */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                    <span>Threshold (B&W Cutoff)</span>
                    <span className="text-slate-500">{threshold}</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="255"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            {/* Smoothing Control */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                    <span>Smoothing (Denoise)</span>
                    <span className="text-slate-500">{smoothing}px</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={smoothing}
                    onChange={(e) => setSmoothing(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            {/* Size Control */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                    <span>Output Size (mm)</span>
                    <span className="text-slate-500">{outputSize}mm</span>
                </label>
                <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-slate-400" />
                    <input
                        type="number"
                        value={outputSize}
                        onChange={(e) => setOutputSize(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Toggle Invert */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Invert Colors</label>
                <button
                    onClick={() => setInvert(!invert)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${invert ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invert ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {/* Manifold Fix */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Fix Non-Manifold (Cull Faces)</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                        type="checkbox"
                        name="toggle"
                        id="manifold-toggle"
                        checked={fixManifold}
                        onChange={(e) => setFixManifold(e.target.checked)}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-slate-100 border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-indigo-600 focus:outline-none"
                        style={{ right: fixManifold ? '0' : 'auto', left: fixManifold ? 'auto' : '0' }}
                    />
                    <label
                        htmlFor="manifold-toggle"
                        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${fixManifold ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    ></label>
                </div>
            </div>

            <div className="pt-4 space-y-3">
                <button onClick={onExportSVG} className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                    Download SVG
                </button>
                <button onClick={onExportSTL} className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                    Download STL (3D)
                </button>
            </div>
        </div>
    );
};
