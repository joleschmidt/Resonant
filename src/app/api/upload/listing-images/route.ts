import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Ungültiger Dateityp. Nur Bilder erlaubt.' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Datei zu groß (max. 10MB)' },
                { status: 400 }
            );
        }

        // Generate safe filename
        const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const uuid = crypto.randomUUID();
        const path = `${user.id}/${uuid}.${ext}`;

        // Convert File to ArrayBuffer then to Buffer for Supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('listing_images')
            .upload(path, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('[listing image upload] storage error:', uploadError);
            return NextResponse.json(
                { error: `Upload fehlgeschlagen: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('listing_images').getPublicUrl(path);

        if (!publicUrl) {
            return NextResponse.json(
                { error: 'Public URL konnte nicht generiert werden' },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('[listing image upload] unexpected error:', error);
        return NextResponse.json(
            { error: `Unerwarteter Fehler: ${error?.message || 'Unbekannt'}` },
            { status: 500 }
        );
    }
}