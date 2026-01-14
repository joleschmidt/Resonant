/**
 * Trust Badges Component
 * Displays user verification status and trust indicators
 */

'use client';

import { Badge } from '@/components/ui/badge';
import {
  calculateTrustScore,
  formatAccountAge,
  getTrustLevelColor,
  getTrustLevelBgColor,
  type UserTrustData,
  type TrustScoreResult,
} from '@/lib/utils/trustScore';
import {
  CheckCircle2,
  Shield,
  ShieldCheck,
  Star,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface TrustBadgesProps {
  trustData: UserTrustData;
  variant?: 'full' | 'compact' | 'inline';
  showScore?: boolean;
  showWarnings?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const TrustBadges: React.FC<TrustBadgesProps> = ({
  trustData,
  variant = 'full',
  showScore = true,
  showWarnings = false,
  className = '',
}) => {
  // Calculate trust score
  const trustScore = calculateTrustScore(trustData);

  // Render variants
  if (variant === 'inline') {
    return <InlineVariant trustScore={trustScore} className={className} />;
  }

  if (variant === 'compact') {
    return (
      <CompactVariant
        trustScore={trustScore}
        trustData={trustData}
        showScore={showScore}
        className={className}
      />
    );
  }

  // Full variant
  return (
    <FullVariant
      trustScore={trustScore}
      trustData={trustData}
      showScore={showScore}
      showWarnings={showWarnings}
      className={className}
    />
  );
};

TrustBadges.displayName = 'TrustBadges';

export default TrustBadges;

// ============================================================================
// INLINE VARIANT (just badges, no extra info)
// ============================================================================

const InlineVariant: React.FC<{
  trustScore: TrustScoreResult;
  className?: string;
}> = ({ trustScore, className }) => {
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {trustScore.badges.map((badge) => (
        <span
          key={badge.id}
          className="text-base cursor-help"
          role="img"
          aria-label={badge.label}
          title={badge.label}
        >
          {badge.icon}
        </span>
      ))}
    </div>
  );
};

InlineVariant.displayName = 'InlineVariant';

// ============================================================================
// COMPACT VARIANT (badges + account age + rating)
// ============================================================================

const CompactVariant: React.FC<{
  trustScore: TrustScoreResult;
  trustData: UserTrustData;
  showScore: boolean;
  className?: string;
}> = ({ trustScore, trustData, showScore, className }) => {
  const averageRating = (trustData.sellerRating + trustData.buyerRating) / 2;
  const totalTransactions = trustData.totalSales + trustData.totalPurchases;

  return (
    <div className={cn('flex items-center gap-3 flex-wrap', className)}>
      {/* Badges */}
      <div className="flex items-center gap-1.5">
        {trustScore.badges.slice(0, 4).map((badge) => (
          <span
            key={badge.id}
            className="text-base cursor-help"
            role="img"
            aria-label={badge.label}
            title={badge.label}
          >
            {badge.icon}
          </span>
        ))}
      </div>

      {/* Account age */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>Mitglied seit {formatAccountAge(trustData.accountAgeInDays)}</span>
      </div>

      {/* Rating */}
      {totalTransactions > 0 && (
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          <span className="font-medium">{averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            ({totalTransactions} {totalTransactions === 1 ? 'Transaktion' : 'Transaktionen'})
          </span>
        </div>
      )}

      {/* Trust score (optional) */}
      {showScore && (
        <Badge
          variant="secondary"
          className={cn('text-xs font-semibold', getTrustLevelBgColor(trustScore.level))}
        >
          <Shield className="h-3 w-3 mr-1" />
          {trustScore.score}/100
        </Badge>
      )}
    </div>
  );
};

CompactVariant.displayName = 'CompactVariant';

// ============================================================================
// FULL VARIANT (all details)
// ============================================================================

const FullVariant: React.FC<{
  trustScore: TrustScoreResult;
  trustData: UserTrustData;
  showScore: boolean;
  showWarnings: boolean;
  className?: string;
}> = ({ trustScore, trustData, showScore, showWarnings, className }) => {
  const averageRating = (trustData.sellerRating + trustData.buyerRating) / 2;
  const totalTransactions = trustData.totalSales + trustData.totalPurchases;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Trust Score Header */}
      {showScore && (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2',
              getTrustLevelBgColor(trustScore.level),
              'border-current'
            )}
          >
            <ShieldCheck className={cn('h-5 w-5', getTrustLevelColor(trustScore.level))} />
            <div>
              <div className="text-sm font-semibold text-muted-foreground">
                Vertrauenswürdigkeit
              </div>
              <div className={cn('text-2xl font-bold', getTrustLevelColor(trustScore.level))}>
                {trustScore.score}/100
              </div>
            </div>
          </div>
          <div>
            <Badge
              variant="outline"
              className={cn('text-sm', getTrustLevelColor(trustScore.level))}
            >
              {getTrustLevelLabel(trustScore.level)}
            </Badge>
          </div>
        </div>
      )}

      {/* Verification Badges */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Verifizierungen</h4>
        <div className="grid grid-cols-2 gap-2">
          {trustScore.badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="flex-1">{badge.label}</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Account Metrics */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/30">
          <span className="text-muted-foreground">Mitglied seit</span>
          <span className="font-semibold">{formatAccountAge(trustData.accountAgeInDays)}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/30">
          <span className="text-muted-foreground">Bewertung</span>
          <span className="font-semibold flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            {averageRating.toFixed(1)}
            {totalTransactions > 0 && <span className="text-xs">({totalTransactions})</span>}
          </span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/30">
          <span className="text-muted-foreground">Verkäufe</span>
          <span className="font-semibold">{trustData.totalSales}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/30">
          <span className="text-muted-foreground">Käufe</span>
          <span className="font-semibold">{trustData.totalPurchases}</span>
        </div>
      </div>

      {/* Response Metrics */}
      {trustData.responseRate > 0 && (
        <div className="flex items-center justify-between p-3 rounded-md bg-muted/30 text-sm">
          <span className="text-muted-foreground">Antwortrate</span>
          <span className="font-semibold">{trustData.responseRate}%</span>
        </div>
      )}

      {/* Warnings */}
      {showWarnings && trustScore.warnings.length > 0 && (
        <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-yellow-800 mb-1">Hinweise</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {trustScore.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FullVariant.displayName = 'FullVariant';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTrustLevelLabel(level: TrustScoreResult['level']): string {
  const labels = {
    unverified: 'Nicht verifiziert',
    basic: 'Basis',
    verified: 'Verifiziert',
    trusted: 'Vertrauenswürdig',
    premium: 'Premium',
  };
  return labels[level];
}

// ============================================================================
// EXPORT
// ============================================================================

export { TrustBadges };
