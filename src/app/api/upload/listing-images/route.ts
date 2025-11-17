import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
    validateImageUpload, 
    generateSafeFilename, 
    MAX_LISTING_IMAGE_SIZE 
} from '@/lib/security/fileValidation';
import { checkRateLimit, uploadRatelimit, getRateLimitIdentifier } from '@/lib/ratelimit';
import { logAuditEvent, getIpAddress, getUserAgent } from '@/lib/security/auditLog';

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

        // Rate limiting
        const identifier = getRateLimitIdentifier(req, user.id);
        const rateLimitResult = await checkRateLimit(uploadRatelimit, identifier, 10, 60000);
        
        if (!rateLimitResult.success) {
            await logAuditEvent({
                eventType: 'rate_limit_exceeded',
                userId: user.id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                eventData: { endpoint: '/api/upload/listing-images' },
                severity: 'warning',
            });
            
            return NextResponse.json(
                { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
                { status: 429 }
            );
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        // Validate image with signature checking
        const validation = await validateImageUpload(file, MAX_LISTING_IMAGE_SIZE);
        
        if (!validation.valid) {
            await logAuditEvent({
                eventType: 'file_upload_failed',
                userId: user.id,
                ipAddress: getIpAddress(req),
                eventData: { error: validation.error, filename: file.name },
                severity: 'warning',
            });
            
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Generate safe filename
        const filename = generateSafeFilename(file.name, file.type);
        const path = `${user.id}/${filename}`;

        // Convert File to ArrayBuffer then to Buffer for Supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(path, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('[listing image upload] storage error:', uploadError);
            return NextResponse.json(
                { error: 'Upload fehlgeschlagen' },
                { status: 500 }
            );
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('listing-images').getPublicUrl(path);

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
            { error: 'Unerwarteter Fehler beim Upload' },
            { status: 500 }
        );
    }
}