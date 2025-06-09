import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import UserDashboard from '../components/UserDashboard';
import { useAuth } from '../context/AuthContext';
import { UserImage } from '../types';
import { getMockImages } from '../utils/imageUtils';

const Dashboard: React.FC = () => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch images (using mock data for now)
    const fetchImages = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockImages = getMockImages();
        setImages(mockImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user, navigate]);

  const handleSelectImage = (image: UserImage) => {
    // Open image detail view or navigate to editor with this image
    navigate(`/editor?id=${image.id}`);
  };

  const handleDeleteImage = (imageId: string) => {
    // Mock deletion
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleDownloadImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.editedImageUrl) return;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = image.editedImageUrl;
    link.download = image.name || 'smartpix-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditImage = (imageId: string) => {
    navigate(`/editor?id=${imageId}`);
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/editor')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Images
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {images.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Processed This Month
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {images.filter(img => img.editedImageUrl).length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Storage Used
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {(images.length * 2.5).toFixed(1)} MB
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <UserDashboard 
            images={images}
            onSelectImage={handleSelectImage}
            onDeleteImage={handleDeleteImage}
            onDownloadImage={handleDownloadImage}
            onEditImage={handleEditImage}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;