/**
 * ImageKit Integration for Image Compression and Optimization
 * Handles client-side compression before Supabase Storage upload
 */

export interface ImageCompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
}

export interface CompressedImage {
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    url: string;
}

/**
 * Compress image using Canvas API
 */
export async function compressImage(
    file: File,
    options: ImageCompressionOptions = {}
): Promise<CompressedImage> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    const compressedFile = new File([blob], file.name, {
                        type: `image/${format}`,
                        lastModified: Date.now(),
                    });

                    const originalSize = file.size;
                    const compressedSize = blob.size;
                    const compressionRatio = (1 - compressedSize / originalSize) * 100;

                    resolve({
                        file: compressedFile,
                        originalSize,
                        compressedSize,
                        compressionRatio,
                        url: URL.createObjectURL(blob),
                    });
                },
                `image/${format}`,
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Generate ImageKit URL with transformations
 */
export function generateImageKitUrl(
    imagePath: string,
    transformations: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'webp' | 'jpeg' | 'png';
        crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
        focus?: 'auto' | 'face' | 'center';
    } = {}
): string {
    const {
        width,
        height,
        quality = 80,
        format = 'webp',
        crop = 'maintain_ratio',
        focus = 'auto'
    } = transformations;

    const baseUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL || 'https://ik.imagekit.io/your_id';
    const path = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    const params = new URLSearchParams();

    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality !== 80) params.append('q', quality.toString());
    if (format !== 'webp') params.append('f', format);
    if (crop !== 'maintain_ratio') params.append('c', crop);
    if (focus !== 'auto') params.append('fo', focus);

    const queryString = params.toString();
    return `${baseUrl}/${path}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Generate thumbnail URL for listing images
 */
export function generateThumbnailUrl(imagePath: string, size: number = 300): string {
    return generateImageKitUrl(imagePath, {
        width: size,
        height: size,
        quality: 75,
        format: 'webp',
        crop: 'maintain_ratio',
        focus: 'auto'
    });
}

/**
 * Generate medium-sized URL for listing cards
 */
export function generateMediumUrl(imagePath: string, width: number = 600): string {
    return generateImageKitUrl(imagePath, {
        width,
        quality: 80,
        format: 'webp',
        crop: 'maintain_ratio',
        focus: 'auto'
    });
}

/**
 * Generate full-size URL for listing detail view
 */
export function generateFullSizeUrl(imagePath: string, maxWidth: number = 1200): string {
    return generateImageKitUrl(imagePath, {
        width: maxWidth,
        quality: 85,
        format: 'webp',
        crop: 'maintain_ratio',
        focus: 'auto'
    });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
        return { valid: false, error: 'Image size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
    }

    return { valid: true };
}

/**
 * Get optimal compression settings based on file size
 */
export function getOptimalCompressionSettings(fileSize: number): ImageCompressionOptions {
    if (fileSize < 500 * 1024) { // < 500KB
        return { quality: 0.9, maxWidth: 1920, maxHeight: 1920 };
    } else if (fileSize < 2 * 1024 * 1024) { // < 2MB
        return { quality: 0.8, maxWidth: 1920, maxHeight: 1920 };
    } else if (fileSize < 5 * 1024 * 1024) { // < 5MB
        return { quality: 0.7, maxWidth: 1600, maxHeight: 1600 };
    } else { // >= 5MB
        return { quality: 0.6, maxWidth: 1200, maxHeight: 1200 };
    }
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
    files: File[],
    options: ImageCompressionOptions = {}
): Promise<CompressedImage[]> {
    const results = await Promise.allSettled(
        files.map(file => compressImage(file, options))
    );

    return results
        .filter((result): result is PromiseFulfilledResult<CompressedImage> =>
            result.status === 'fulfilled'
        )
        .map(result => result.value);
}

/**
 * Calculate total compression savings
 */
export function calculateCompressionSavings(images: CompressedImage[]): {
    originalTotal: number;
    compressedTotal: number;
    savingsBytes: number;
    savingsPercent: number;
} {
    const originalTotal = images.reduce((sum, img) => sum + img.originalSize, 0);
    const compressedTotal = images.reduce((sum, img) => sum + img.compressedSize, 0);
    const savingsBytes = originalTotal - compressedTotal;
    const savingsPercent = (savingsBytes / originalTotal) * 100;

    return {
        originalTotal,
        compressedTotal,
        savingsBytes,
        savingsPercent
    };
}
