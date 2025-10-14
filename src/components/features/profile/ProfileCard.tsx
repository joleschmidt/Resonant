/**
 * Profile Card Component
 * Display public profile information
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VerificationBadge } from './VerificationBadge';
import { UserStats } from './UserStats';
import type { Profile } from '@/types';
import { MapPin, Calendar } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  showStats?: boolean;
}

export function ProfileCard({ profile, showStats = true }: ProfileCardProps) {
  const initials = profile.username?.substring(0, 2).toUpperCase() || 'U';
  const memberSince = new Date(profile.created_at).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              {profile.full_name && (
                <p className="text-sm text-muted-foreground">{profile.full_name}</p>
              )}
            </div>

            <VerificationBadge status={profile.verification_status} />

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Dabei seit {memberSince}</span>
              </div>
            </div>
            {profile.bio && (
              <div className="mt-4">
                <p className="text-sm leading-relaxed ">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>


      </CardHeader>

      {showStats && (
        <CardContent>
          <UserStats profile={profile} />
        </CardContent>
      )}
    </Card>
  );
}

