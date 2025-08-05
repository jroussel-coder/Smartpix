import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { validateImage } from '../utils/imageUtils';

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFiles = (file: File) => {
    setError(null);
    setUploading(true);
    
    try {
      const validationResult = validateImage(file);
      
      if (validationResult.valid) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreview(result);
          onImageSelected(file, result);
          setUploading(false);
        };
        
        reader.readAsDataURL(file);
      } else {
        setError(validationResult.error);
        setUploading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 
            ${dragActive 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }
            ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          
          <div className="text-center">
            <Upload 
              className={`mx-auto h-12 w-12 mb-4 
                ${error 
                  ? 'text-red-500' 
                  : dragActive 
                    ? 'text-purple-500' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} 
            />
            
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {error ? error : 'Drag & drop your image here'}
            </p>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              PNG, JPG, WEBP up to 5MB
            </p>
            
            <button
              type="button"
              onClick={handleButtonClick}
              className={`px-4 py-2 rounded-md text-sm font-medium 
                ${error 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              disabled={uploading}
            >
              {uploading ? 'Processing...' : 'Select Image'}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto object-contain"
          />
          <button
            type="button"
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-800/70 text-white hover:bg-gray-900/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;