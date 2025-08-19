import { supabase } from '../lib/supabase';
import { UserImage } from '../types';

export class ImageService {
  static async getUserImages(userId: string): Promise<UserImage[]> {
    const { data, error } = await supabase
      .from('user_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user images:', error);
      throw new Error('Failed to fetch images');
    }

    return data.map(this.mapToUserImage);
  }

  static async createUserImage(
    userId: string,
    name: string,
    originalImageUrl: string
  ): Promise<UserImage> {
    const { data, error } = await supabase
      .from('user_images')
      .insert({
        user_id: userId,
        name,
        original_image_url: originalImageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user image:', error);
      throw new Error('Failed to create image');
    }

    return this.mapToUserImage(data);
  }

  static async updateUserImage(
    imageId: string,
    updates: {
      editedImageUrl?: string;
      editType?: string;
      name?: string;
    }
  ): Promise<UserImage> {
    const updateData: any = {};
    
    if (updates.editedImageUrl !== undefined) {
      updateData.edited_image_url = updates.editedImageUrl;
    }
    if (updates.editType !== undefined) {
      updateData.edit_type = updates.editType;
    }
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    const { data, error } = await supabase
      .from('user_images')
      .update(updateData)
      .eq('id', imageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user image:', error);
      throw new Error('Failed to update image');
    }

    return this.mapToUserImage(data);
  }

  static async deleteUserImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from('user_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting user image:', error);
      throw new Error('Failed to delete image');
    }
  }

  static async getUserImage(imageId: string): Promise<UserImage | null> {
    const { data, error } = await supabase
      .from('user_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Image not found
      }
      console.error('Error fetching user image:', error);
      throw new Error('Failed to fetch image');
    }

    return this.mapToUserImage(data);
  }

  private static mapToUserImage(data: any): UserImage {
    return {
      id: data.id,
      name: data.name,
      originalImageUrl: data.original_image_url,
      editedImageUrl: data.edited_image_url,
      createdAt: data.created_at,
      editType: data.edit_type,
    };
  }
}