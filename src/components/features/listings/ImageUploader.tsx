/**
 * ImageUploader Component
 * Multi-image upload with compression and preview
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(async (files: FileList) => {
        if (disabled || uploading) return;

        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;
        const filesToProcess = fileArray.slice(0, remainingSlots);

        if (filesToProcess.length === 0) {
            setError(`Maximal ${maxImages} Bilder erlaubt`);
            return;
        }

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const uploadPromises = filesToProcess.map(async (file, index) => {
                // Validate file
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} ist kein Bild`);
                }

                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`${file.name} ist zu groß (max. 10MB)`);
                }

                // Upload to Supabase
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload/listing-images', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload fehlgeschlagen');
                }

                const data = await response.json();

                // Update progress
                setUploadProgress(((index + 1) / filesToProcess.length) * 100);

                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onImagesChange([...images, ...uploadedUrls]);

        } catch (err: any) {
            setError(err.message || 'Upload fehlgeschlagen');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [images, onImagesChange, maxImages, disabled, uploading]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileSelect(e.target.files);
        }
    }, [handleFileSelect]);

    const removeImage = useCallback((index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    const openFileDialog = useCallback(() => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    }, [disabled, uploading]);

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${disabled || uploading
                        ? 'border-muted bg-muted/50 cursor-not-allowed'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30 cursor-pointer'
                    }
        `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    disabled={disabled || uploading}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>

                    <div>
                        <p className="text-lg font-medium">
                            {uploading ? 'Bilder werden hochgeladen...' : 'Bilder hochladen'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {uploading
                                ? 'Bitte warten...'
                                : 'Ziehe Bilder hierher oder klicke zum Auswählen'
                            }
                        </p>
                    </div>

                    {!uploading && (
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Maximal {maxImages} weitere Bilder</p>
                            <p>JPEG, PNG, WebP, GIF bis 10MB</p>
                        </div>
                    )}

                    {uploading && (
                        <div className="w-full max-w-xs mx-auto">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {Math.round(uploadProgress)}% abgeschlossen
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                <img
                                    src={url}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {!disabled && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Upload Info */}
            {!uploading && images.length === 0 && (
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Mindestens 1 Bild erforderlich, maximal {maxImages} Bilder</p>
                    <p>• Bilder werden automatisch komprimiert und optimiert</p>
                    <p>• Erste Bilder werden als Hauptbilder verwendet</p>
                </div>
            )}
        </div>
    );
}