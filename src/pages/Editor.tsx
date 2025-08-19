import ImageComparison from '../components/ImageComparison';
import { useAuth } from '../context/AuthContext';
import { ImageService } from '../services/imageService';

const Editor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState<EditOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if we're editing an existing image
    const searchParams = new URLSearchParams(location.search);
    const imageId = searchParams.get('id');
    
    if (imageId) {
      // Load the image data
      const loadImage = async () => {
        try {
          const image = await ImageService.getUserImage(imageId);
          if (image) {
            setOriginalImage(image.originalImageUrl);
            setEditedImage(image.editedImageUrl);
            setIsProcessed(!!image.editedImageUrl);
            setCurrentImageId(image.id);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setError('Failed to load image');
        }
      };
      
      loadImage();
    }
  }, [user, navigate, location.search]);

  const uploadImageToStorage = async (file: File): Promise<string> => {
    // In a real implementation, you would upload to Supabase Storage
    // For now, we'll use a data URL as a placeholder
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelected = async (file: File, preview: string) => {
    try {
      setSelectedFile(file);
      setOriginalImage(preview);
      setEditedImage(null);
      setIsProcessed(false);
      setError(null);
      
      // Upload image and create database record
      if (user) {
        const imageUrl = await uploadImageToStorage(file);
        const newImage = await ImageService.createUserImage(
          user.id,
          file.name,
          imageUrl
        );
        setCurrentImageId(newImage.id);
      }
    } catch (error) {
      console.error('Error handling image selection:', error);
      setError('Failed to process image. Please try again.');
    }
  };

  const handleApplyEdit = async () => {
    if (!originalImage || !selectedOption || !currentImageId) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate API call to AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, just use the original image
      // In a real app, this would be the result from the AI service
      const editedImageUrl = originalImage; // This would be the actual edited image URL
      
      // Update the database record
      await ImageService.updateUserImage(currentImageId, {
        editedImageUrl,
        editType: selectedOption.name,
      });
      
      setEditedImage(editedImageUrl);
      setIsProcessed(true);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToProfile = () => {
    // Image is already saved to the database, just navigate back
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Image Editor
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Upload an image and apply AI-powered edits
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>