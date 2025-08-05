export interface UserImage {
  id: string;
  name: string;
  originalImageUrl: string;
  editedImageUrl: string | null;
  createdAt: string;
  editType: string | null;
}