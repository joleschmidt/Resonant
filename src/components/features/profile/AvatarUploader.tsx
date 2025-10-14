'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon, Loader2 } from 'lucide-react';

type Props = {
    currentUrl?: string | null;
};

export function AvatarUploader({ currentUrl }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFiles = useCallback(async (file?: File) => {
        if (!file) return;

        setError(null);
        setSuccess(null);

        // Pre-validate before upload
        if (file.size > 5 * 1024 * 1024) {
            setError('Datei zu groß (max. 5MB)');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError('Nur Bilddateien sind erlaubt');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Upload with 30s timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Upload fehlgeschlagen');
                return;
            }

            setPreview(data.url);
            setSuccess('Avatar gespeichert');
        } catch (e: any) {
            if (e.name === 'AbortError') {
                setError('Upload Timeout (30s)');
            } else {
                setError(`Unerwarteter Fehler: ${e.message || 'Unbekannt'}`);
            }
        } finally {
            setUploading(false);
        }
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        void handleFiles(file);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        void handleFiles(file);
    };

    const onOpenFile = () => fileInputRef.current?.click();

    return (
        <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={preview || undefined} alt="Avatar" />
                <AvatarFallback>
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>

            <div className="flex-1">
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-muted/30"
                >
                    <ImageIcon className="h-5 w-5" />
                    <p>
                        Bild hierher ziehen oder{' '}
                        <button type="button" onClick={onOpenFile} className="underline">
                            auswählen
                        </button>
                    </p>
                    <p className="text-xs">PNG, JPG. Max 5MB.</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileChange}
                        disabled={uploading}
                    />
                </div>
                <div className="mt-2 flex gap-2">
                    <Button type="button" variant="secondary" onClick={onOpenFile} disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {uploading ? 'Upload …' : 'Bild auswählen'}
                    </Button>
                    {preview && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setPreview(null)}
                            disabled={uploading}
                        >
                            Entfernen
                        </Button>
                    )}
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
            </div>
        </div>
    );
}
