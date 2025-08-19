@@ .. @@
 import { Plus, BarChart2, Image as ImageIcon, RefreshCw } from 'lucide-react';
 import UserDashboard from '../components/UserDashboard';
 import { useAuth } from '../context/AuthContext';
 import { UserImage } from '../types';
import { getMockImages } from '../utils/imageUtils';
+import { ImageService } from '../services/imageService';

 const Dashboard: React.FC = () => {
   const [images, setImages] = useState<UserImage[]>([]);
   const [loading, setLoading] = useState(true);
   const { user } = useAuth();
   const navigate = useNavigate();

@@ .. @@
     }

    // Fetch images (using mock data for now)
+    // Fetch user images from Supabase
     const fetchImages = async () => {
       try {
         setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockImages = getMockImages();
        setImages(mockImages);
-        setImages(mockImages);
+        setError(null);
+        const userImages = await ImageService.getUserImages(user.id);
+        setImages(userImages);
       } catch (error) {
         console.error('Error fetching images:', error);
       } finally {
         setLoading(false);
       }
@@ .. @@
   };

-  const handleDeleteImage = (imageId: string) => {
-    // Mock deletion
-    setImages(images.filter(img => img.id !== imageId));
  const handleDeleteImage = (imageId: string) => {
    // Mock deletion
    setImages(images.filter(img => img.id !== imageId));
   };

   const handleDownloadImage = (imageId: string) => {
@@ .. @@
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