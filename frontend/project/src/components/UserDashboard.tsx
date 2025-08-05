//components\UserDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Clock, Download, Edit2, Trash2 } from 'lucide-react';
import { UserImage } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserDashboardProps {
  onSelectImage: (image: UserImage) => void;
  onDeleteImage: (imageId: string) => void;
  onDownloadImage: (imageId: string) => void;
  onEditImage: (imageId: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  onSelectImage,
  onDeleteImage,
  onDownloadImage,
  onEditImage
}) => {
  const [images, setImages] = useState<UserImage[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchImages = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/user-images/${user.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error('Error fetching user images:', err);
      }
    };

    fetchImages();
  }, [user]);


  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your Images</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your edited images
        </p>
      </div>

      {images.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No images yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload and edit your first image to see it here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div 
              key={image.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div 
                className="h-48 w-full overflow-hidden cursor-pointer"
                onClick={() => onSelectImage(image)}
              >
                <img 
                  src={`${image.originalImageUrl}`} 
                  alt={image.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {image.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(image.createdAt)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate">
                  {image.editType ? `Edited with: ${image.editType}` : 'Original image'}
                </p>
                
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEditImage(image.id)}
                      className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDownloadImage(image.id)}
                      className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onDeleteImage(image.id)}
                    className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
