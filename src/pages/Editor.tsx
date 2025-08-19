import ImageComparison from '../components/ImageComparison';
import { useAuth } from '../context/AuthContext';
import { getMockImages } from '../utils/imageUtils';

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
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if we're editing an existing image
    const searchParams = new URLSearchParams(location.search);
    const imageId = searchParams.get('id');
    
    if (imageId) {
      // Load the image data
      const mockImages = getMockImages();
      const image = mockImages.find(img => img.id === imageId);
      
      if (image) {
        setOriginalImage(image.originalImageUrl);
        setEditedImage(image.editedImageUrl);
        setIsProcessed(!!image.editedImageUrl);
      }
    }
  }, [user, navigate, location.search]);

  const handleImageSelected = (file: File, preview: string) => {
    setSelectedFile(file);
    setOriginalImage(preview);
    setEditedImage(null);
    setIsProcessed(false);
  };

  const handleApplyEdit = async () => {
    if (!originalImage || !selectedOption) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call to AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For mock purposes, just use the original image with slight modifications
      // In a real app, this would be the result from the AI service
      setEditedImage(originalImage);
      setIsProcessed(true);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToProfile = () => {
    // Would save to user's profile in a real app
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