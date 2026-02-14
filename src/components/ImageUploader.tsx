import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, className }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImageUpload(acceptedFiles[0]);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.svg']
        },
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-4",
                isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className="p-4 bg-slate-100 rounded-full">
                {isDragActive ? <FileImage className="w-8 h-8 text-indigo-500" /> : <Upload className="w-8 h-8 text-slate-500" />}
            </div>
            <div>
                <p className="text-lg font-medium text-slate-700">
                    {isDragActive ? "Drop the image here" : "Click or drag image to upload"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                    Supports PNG, JPG, SVG
                </p>
            </div>
        </div>
    );
};
