/**
 * File Upload Validation
 * Validates file signatures (magic numbers) to prevent malicious uploads
 */

import { fileTypeFromBuffer } from 'file-type';

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

// Allowed image extensions
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;

// Maximum file sizes
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_LISTING_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates file signature (magic numbers) to ensure file type matches content
 */
export async function validateFileSignature(
  file: File | Buffer,
  allowedTypes: readonly string[]
): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  try {
    // Convert File to Buffer if needed
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    // Detect actual file type from magic numbers
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      return {
        valid: false,
        error: 'Could not determine file type',
      };
    }

    // Check if detected type is in allowed list
    if (!allowedTypes.includes(fileType.mime)) {
      return {
        valid: false,
        detectedType: fileType.mime,
        error: `File type ${fileType.mime} is not allowed`,
      };
    }

    return {
      valid: true,
      detectedType: fileType.mime,
    };
  } catch (error) {
    console.error('File signature validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate file',
    };
  }
}

/**
 * Validates image file for upload
 */
export async function validateImageUpload(file: File, maxSize: number): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Datei zu groß (max. ${Math.round(maxSize / 1024 / 1024)}MB)`,
    };
  }

  // Check MIME type (first line of defense)
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Ungültiger Dateityp. Nur Bilder erlaubt.',
    };
  }

  // Validate file signature (second line of defense)
  const signatureValidation = await validateFileSignature(file, ALLOWED_IMAGE_TYPES);

  if (!signatureValidation.valid) {
    return {
      valid: false,
      error: signatureValidation.error || 'Ungültiger Dateityp',
    };
  }

  // Check if MIME type matches detected type
  if (signatureValidation.detectedType && file.type !== signatureValidation.detectedType) {
    return {
      valid: false,
      error: 'Dateityp stimmt nicht mit Dateiinhalt überein',
    };
  }

  return { valid: true };
}

/**
 * Generates a safe filename with proper extension
 */
export function generateSafeFilename(originalFilename: string, detectedMime?: string): string {
  const uuid = crypto.randomUUID();

  // Determine extension from detected MIME type or original filename
  let ext = 'jpg'; // default
  
  if (detectedMime) {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    ext = mimeToExt[detectedMime] || ext;
  } else {
    const parts = originalFilename.split('.');
    if (parts.length > 1) {
      const originalExt = parts.pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (originalExt && ALLOWED_IMAGE_EXTENSIONS.includes(originalExt as any)) {
        ext = originalExt;
      }
    }
  }

  return `${uuid}.${ext}`;
}

