import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import UserDashboard from '../components/UserDashboard';
import { useAuth } from '../context/AuthContext';
import { UserImage } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard: React.FC = () => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.token || !user.id) {
      navigate('/login');
      return;
    }

    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/user-images/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user images');
        }

        const data: UserImage[] = await response.json();

        const fullData = data.map(image => ({
          ...image,
          originalImageUrl: image.originalImageUrl,
          editedImageUrl: image.editedImageUrl || null,
        }));

        setImages(fullData);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user, navigate]);

  const handleSelectImage = (image: UserImage) => {
    navigate(`/editor?id=${image.id}`);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!user || !user.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete image');
    }
  };

  const handleDownloadImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image?.editedImageUrl) return;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
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
          <StatCard icon={<ImageIcon className="h-6 w-6 text-gray-400" />} title="Total Images" value={images.length} />
          <StatCard
            icon={<RefreshCw className="h-6 w-6 text-gray-400" />}
            title="Processed This Month"
            value={images.filter(img => img.editedImageUrl).length}
          />
          <StatCard
            icon={<BarChart2 className="h-6 w-6 text-gray-400" />}
            title="Storage Used"
            value={`${(images.length * 2.5).toFixed(1)} MB`}
          />
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

const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;