/**
 * ImageUploader Component
 * Multi-image upload with compression and preview
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, Loader2, GripVertical } from 'lucide-react';

interface ImageUploaderProps {
    images: File[];
    onImagesChange: (images: File[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false
}: ImageUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((files: FileList) => {
        if (disabled) return;

        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;
        const filesToProcess = fileArray.slice(0, remainingSlots);

        if (filesToProcess.length === 0) {
            setError(`Maximal ${maxImages} Bilder erlaubt`);
            return;
        }

        setError(null);

        // Validate files
        const validFiles: File[] = [];
        for (const file of filesToProcess) {
            if (!file.type.startsWith('image/')) {
                setError(`${file.name} ist kein Bild`);
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} ist zu groß (max. 10MB)`);
                return;
            }

            validFiles.push(file);
        }

        onImagesChange([...images, ...validFiles]);
    }, [images, onImagesChange, maxImages, disabled]);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [handleFileSelect]);

    const handleFileDragOver = useCallback((e: React.DragEvent) => {
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

    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            moveImage(draggedIndex, dropIndex);
        }

        setDraggedIndex(null);
    }, [draggedIndex, moveImage]);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
    }, []);

    const openFileDialog = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${disabled
                        ? 'border-muted bg-muted/50 cursor-not-allowed'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30 cursor-pointer'
                    }
        `}
                onDrop={handleFileDrop}
                onDragOver={handleFileDragOver}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>

                    <div>
                        <p className="text-lg font-medium">Bilder auswählen</p>
                        <p className="text-sm text-muted-foreground">
                            Ziehe Bilder hierher oder klicke zum Auswählen
                        </p>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>Maximal {maxImages} Bilder</p>
                        <p>JPEG, PNG, WebP, GIF bis 10MB</p>
                        <p>Bilder werden erst beim Veröffentlichen hochgeladen</p>
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((file, index) => (
                        <div
                            key={index}
                            className={`
                                relative group cursor-move
                                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                                ${draggedIndex !== null && draggedIndex !== index ? 'hover:scale-105' : ''}
                                transition-all duration-200
                            `}
                            draggable={!disabled}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleImageDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary/20 transition-colors">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Drag Handle */}
                                {!disabled && (
                                    <div className="absolute top-2 left-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="w-3 h-3" />
                                    </div>
                                )}
                            </div>

                            {/* Image Number Badge */}
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {index + 1}
                            </div>

                            {!disabled && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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

            {/* Reorder Info */}
            {images.length > 1 && (
                <div className="text-sm text-muted-foreground">
                    <p>💡 <strong>Tipp:</strong> Ziehe die Bilder per Drag & Drop, um die Reihenfolge zu ändern</p>
                </div>
            )}
        </div>
    );
}