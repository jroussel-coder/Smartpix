import { UserImage } from '../types';

/**
 * Validates an image file
 * @param file The file to validate
 * @returns Object containing validation result and error message if any
 */
export const validateImage = (file: File): { valid: boolean; error: string | null } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload a JPG, PNG, or WEBP image.',
    };
  }

  // Check file size (4MB max)
  const maxSize = 4 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB. Please upload a smaller image.',
    };
  }

  return {
    valid: true,
    error: null,
  };
};
