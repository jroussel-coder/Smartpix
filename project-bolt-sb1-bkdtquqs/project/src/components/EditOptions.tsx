import React, { useState } from 'react';
import { Sliders, Sparkles, Palette, Brush, RefreshCw, PenTool, Layers } from 'lucide-react';

export type EditOption = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings?: {
    intensity?: number;
    // Other settings specific to this edit option
  };
};

interface EditOptionsProps {
  onSelectOption: (option: EditOption) => void;
  selectedOption: EditOption | null;
  onApplyEdit: () => void;
  isProcessing: boolean;
}

const EditOptions: React.FC<EditOptionsProps> = ({ 
  onSelectOption, 
  selectedOption, 
  onApplyEdit,
  isProcessing
}) => {
  const [intensity, setIntensity] = useState(50);

  const options: EditOption[] = [
    {
      id: 'enhance',
      name: 'Auto Enhance',
      description: 'Automatically improve colors, contrast, and details',
      icon: <Sparkles className="h-5 w-5" />,
      settings: { intensity: 50 }
    },
    {
      id: 'style',
      name: 'Style Transfer',
      description: 'Apply artistic styles to your image',
      icon: <Palette className="h-5 w-5" />,
      settings: { intensity: 50 }
    },
    {
      id: 'colorize',
      name: 'Colorize',
      description: 'Add color to black and white images',
      icon: <Brush className="h-5 w-5" />,
      settings: { intensity: 50 }
    },
    {
      id: 'restore',
      name: 'Restore',
      description: 'Fix damaged or old photographs',
      icon: <RefreshCw className="h-5 w-5" />,
      settings: { intensity: 50 }
    },
    {
      id: 'retouch',
      name: 'Retouch',
      description: 'Remove blemishes and imperfections',
      icon: <PenTool className="h-5 w-5" />,
      settings: { intensity: 50 }
    },
    {
      id: 'background',
      name: 'Background',
      description: 'Change or remove image background',
      icon: <Layers className="h-5 w-5" />,
      settings: { intensity: 50 }
    }
  ];

  const handleSelectOption = (option: EditOption) => {
    if (selectedOption?.id === option.id) {
      onSelectOption({ ...option, settings: { ...option.settings, intensity } });
    } else {
      // Reset intensity when selecting a new option
      setIntensity(50);
      onSelectOption({ ...option, settings: { ...option.settings, intensity: 50 } });
    }
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = parseInt(e.target.value);
    setIntensity(newIntensity);
    
    if (selectedOption) {
      onSelectOption({
        ...selectedOption,
        settings: { ...selectedOption.settings, intensity: newIntensity }
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
          <Sliders className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
          Edit Options
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select an AI-powered enhancement to apply to your image
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
              selectedOption?.id === option.id
                ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 dark:border-purple-500'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            <div className={`p-2 rounded-full mb-2 ${
              selectedOption?.id === option.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {option.icon}
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {option.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {option.description}
            </span>
          </button>
        ))}
      </div>
      
      {selectedOption && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="mb-4">
            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intensity: {intensity}%
            </label>
            <input
              id="intensity"
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={handleIntensityChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <button
            onClick={onApplyEdit}
            disabled={isProcessing}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              isProcessing
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isProcessing ? 'Processing...' : `Apply ${selectedOption.name}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default EditOptions;