'use client';

import { useRouter } from 'next/navigation';
import { AvatarUploader } from './AvatarUploader';

type Props = {
    initialAvatarUrl?: string | null;
};

export function AvatarEditSection({ initialAvatarUrl }: Props) {
    const router = useRouter();

    const handleUploadSuccess = () => {
        // Refresh the page to get the latest avatar URL
        router.refresh();
    };

    return (
        <AvatarUploader
            currentUrl={initialAvatarUrl}
            onUploadSuccess={handleUploadSuccess}
        />
    );
}
