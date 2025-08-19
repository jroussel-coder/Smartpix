@@ .. @@
 import { Plus, BarChart2, Image as ImageIcon, RefreshCw } from 'lucide-react';
 import UserDashboard from '../components/UserDashboard';
 import { useAuth } from '../context/AuthContext';
 import { UserImage } from '../types';
-import { getMockImages } from '../utils/imageUtils';
+import { ImageService } from '../services/imageService';

 const Dashboard: React.FC = () => {
   const [images, setImages] = useState<UserImage[]>([]);
   const [loading, setLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
   const { user } = useAuth();
   const navigate = useNavigate();

@@ .. @@
     }

-    // Fetch images (using mock data for now)
+    // Fetch user images from Supabase
     const fetchImages = async () => {
       try {
         setLoading(true);
-        // Simulate API call delay
-        await new Promise(resolve => setTimeout(resolve, 800));
-        const mockImages = getMockImages();
-        setImages(mockImages);
+        setError(null);
+        const userImages = await ImageService.getUserImages(user.id);
+        setImages(userImages);
       } catch (error) {
         console.error('Error fetching images:', error);
+        setError('Failed to load images. Please try again.');
       } finally {
         setLoading(false);
       }
@@ .. @@
   };

-  const handleDeleteImage = (imageId: string) => {
-    // Mock deletion
-    setImages(images.filter(img => img.id !== imageId));
+  const handleDeleteImage = async (imageId: string) => {
+    try {
+      await ImageService.deleteUserImage(imageId);
+      setImages(images.filter(img => img.id !== imageId));
+    } catch (error) {
+      console.error('Error deleting image:', error);
+      setError('Failed to delete image. Please try again.');
+    }
   };

   const handleDownloadImage = (imageId: string) => {
@@ .. @@
         {loading ? (
           <div className="flex justify-center items-center py-12">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
           </div>
+        ) : error ? (
+          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
+            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
+            <button
+              onClick={() => window.location.reload()}
+              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
+            >
+              Try Again
+            </button>
+          </div>
         ) : (
           <UserDashboard