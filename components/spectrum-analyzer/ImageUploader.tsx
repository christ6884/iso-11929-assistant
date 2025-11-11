import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageLoaded: (imageDataUrl: string) => void;
  t: any;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoaded, t }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageLoaded(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload-input')?.click()}
      className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 w-full max-w-lg
        ${isDragging ? 'border-indigo-400 bg-indigo-900/30' : 'border-gray-600 hover:border-indigo-500 hover:bg-gray-800'}`}
    >
      <input
        id="file-upload-input"
        type="file"
        accept="image/png, image/jpeg"
        onChange={onFileSelect}
        className="hidden"
      />
      <div className="flex flex-col items-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="font-semibold">{t('uploadInstruction')}</p>
      </div>
    </div>
  );
};

export default ImageUploader;