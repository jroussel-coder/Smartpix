import React, { useState, useRef, useEffect } from 'react';
import { Download, Maximize, Minimize } from 'lucide-react';

interface ImageComparisonProps {
  originalSrc: string;
  editedSrc: string | null;
  onDownload: () => void;
  isProcessed: boolean;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalSrc,
  editedSrc,
  onDownload,
  isProcessed
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = (x / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(position, 0), 100));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const position = (x / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(position, 0), 100));
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!editedSrc) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex justify-center items-center">
        <img 
          src={originalSrc} 
          alt="Original" 
          className="max-w-full max-h-[500px] object-contain rounded"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-4' : ''}`}>
      <div 
        ref={containerRef}
        className={`relative w-full ${isFullscreen ? 'h-full' : 'h-[500px]'} overflow-hidden select-none ${isFullscreen ? '' : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'}`}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Original image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={originalSrc} 
            alt="Original" 
            className="w-full h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          />
        </div>

        {/* Edited image (partial view) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={editedSrc} 
              alt="Edited" 
              className="h-full object-contain"
              style={{ 
                width: sliderPosition > 0 ? `${100 / (sliderPosition / 100)}%` : '100%',
                maxHeight: '100%',
                maxWidth: 'none'
              }}
            />
          </div>
        </div>

        {/* Slider handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-md"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-400 rounded"></div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Original
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Edited
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          
          {isProcessed && (
            <button
              onClick={onDownload}
              className="p-2 rounded-full bg-purple-600/90 text-white shadow-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageComparison;
