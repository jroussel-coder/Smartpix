import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import EditOptions, { EditOption } from '../components/EditOptions';
import ImageComparison from '../components/ImageComparison';
import { useAuth } from '../context/AuthContext';

const Editor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState<EditOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const imageId = searchParams.get('id');
    if (imageId) {
      // You can fetch and preload image data here if needed
    }
  }, [user, navigate, location.search]);

  const handleImageSelected = (file: File, preview: string) => {
    setSelectedFile(file);
    setOriginalImage(preview);
    setEditedImage(null);
    setIsProcessed(false);
    setSelectedOption(null);
  };

  const handleSelectOption = (option: EditOption) => {
    setSelectedOption(option);
  };

  const handleApplyEdit = async () => {
    if (!selectedFile || !selectedOption || !user) return;

    setIsProcessing(true);

    try {
      // 1. Upload the image
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", user.id);

      const uploadRes = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadRes.json();
      const imageId = uploadData.image_id;

      // 2. Apply edit
      const editForm = new FormData();
      editForm.append("image_id", imageId);
      editForm.append("edit_type", selectedOption.id); 
      editForm.append( "intensity",String(selectedOption.settings?.intensity ?? 50) );
      editForm.append("user_id", user.id);

      const editRes = await fetch("http://localhost:8000/api/edit", {
        method: "POST",
        body: editForm,
      });

      if (!editRes.ok) {
        throw new Error("Edit failed");
      }

      const editData = await editRes.json();
      const fullURL = `http://localhost:8000${editData.edited_url}`;

      setEditedImage(fullURL);
      setIsProcessed(true);
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Something went wrong during image editing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = selectedFile?.name || 'smartpix-edited.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToProfile = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Image Editor
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Upload an image and apply AI-powered edits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {originalImage ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <ImageComparison 
                  originalSrc={originalImage}
                  editedSrc={editedImage}
                  onDownload={handleDownload}
                  isProcessed={isProcessed}
                />
                {selectedOption && (
                  <p className="text-sm text-gray-500 mt-2">
                    Edit type: <strong>{selectedOption.name}</strong><br />
                    Description: <em>{selectedOption.description}</em>
                  </p>
                )}
                {isProcessed && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleSaveToProfile}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save to Profile
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <ImageUploader 
                  onImageSelected={handleImageSelected}
                  className="max-w-md mx-auto"
                />
              </div>
            )}
          </div>

          <div>
            {originalImage && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <EditOptions
                  onSelectOption={handleSelectOption}
                  selectedOption={selectedOption}
                  onApplyEdit={handleApplyEdit}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
