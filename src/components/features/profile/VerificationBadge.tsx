/**
 * Verification Badge Component
 * Display user verification status
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, ShieldCheck } from 'lucide-react';
import type { VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const statusConfig = {
  unverified: {
    label: 'Nicht verifiziert',
    variant: 'secondary' as const,
    icon: null,
  },
  email_verified: {
    label: 'E-Mail verifiziert',
    variant: 'default' as const,
    icon: CheckCircle2,
  },
  phone_verified: {
    label: 'Telefon verifiziert',
    variant: 'default' as const,
    icon: Shield,
  },
  identity_verified: {
    label: 'Identität verifiziert',
    variant: 'default' as const,
    icon: ShieldCheck,
  },
  fully_verified: {
    label: 'Vollständig verifiziert',
    variant: 'default' as const,
    icon: ShieldCheck,
  },
};

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

