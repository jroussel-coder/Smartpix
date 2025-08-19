@@ .. @@
-import { UserImage } from '../types';

 /**
@@ .. @@
     error: null,
   };
-};
-
-/**
- * Generates mock image data for testing
- * @returns Array of mock UserImage objects
- */
-export const getMockImages = (): UserImage[] => {
-  return [
-    {
-      id: '1',
-      name: 'Mountain Landscape',
-      originalImageUrl: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
-      editedImageUrl: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2&sat=1.2',
-      createdAt: '2025-05-15T10:30:00Z',
-      editType: 'Auto Enhance',
-    },
-    {
-      id: '2',
-      name: 'Portrait',
-      originalImageUrl: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
-      editedImageUrl: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2&blur=20',
-      createdAt: '2025-05-12T08:45:00Z',
-      editType: 'Style Transfer',
-    },
-    {
-      id: '3',
-      name: 'City Scene',
-      originalImageUrl: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
-      editedImageUrl: null,
-      createdAt: '2025-05-10T15:20:00Z',
-      editType: null,
-    },
-    {
-      id: '4',
-      name: 'Ocean Sunset',
-      originalImageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
-      editedImageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2&contrast=1.3',
-      createdAt: '2025-05-08T19:15:00Z',
-      editType: 'Colorize',
-    },
-    {
-      id: '5',
-      name: 'Abstract Art',
-      originalImageUrl: 'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
-      editedImageUrl: 'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2&grayscale=1',
-      createdAt: '2025-05-05T11:30:00Z',
-      editType: 'Background',
-    },
-  ];
 };