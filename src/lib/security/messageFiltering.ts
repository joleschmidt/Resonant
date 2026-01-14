/**
 * Message Filtering & Safety
 * Protects users from scams in messaging
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FilterResult {
  filtered: string;
  blocked: boolean;
  warnings: string[];
  flags: MessageFlag[];
}

export interface MessageFlag {
  type: MessageFlagType;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export type MessageFlagType =
  | 'phone_number_redacted'
  | 'email_redacted'
  | 'external_link_blocked'
  | 'scam_phrase_detected'
  | 'payment_request_detected';

// ============================================================================
// PHONE NUMBER REDACTION
// ============================================================================

export function redactPhoneNumbers(text: string): {
  redacted: string;
  count: number;
} {
  const phonePatterns = [
    // German phone formats
    /\b(\+?49[-.\s]?)?\d{3,4}[-.\s]?\d{6,8}\b/g,
    // International formats
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    // Mobile formats
    /\b01[5-7]\d[-.\s]?\d{7}\b/g,
  ];

  let redacted = text;
  let totalCount = 0;

  phonePatterns.forEach((pattern) => {
    const matches = redacted.match(pattern);
    if (matches) {
      totalCount += matches.length;
      redacted = redacted.replace(pattern, '***-***-****');
    }
  });

  return { redacted, count: totalCount };
}

// ============================================================================
// EMAIL REDACTION
// ============================================================================

export function redactEmails(text: string): {
  redacted: string;
  count: number;
} {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailPattern);
  const count = matches ? matches.length : 0;

  const redacted = text.replace(emailPattern, '***@***.***');

  return { redacted, count };
}

// ============================================================================
// EXTERNAL LINK DETECTION & BLOCKING
// ============================================================================

export function detectAndBlockExternalLinks(
  text: string,
  messageNumber: number
): {
  filtered: string;
  blocked: boolean;
  links: string[];
} {
  // Block external links in first 3 messages
  const shouldBlock = messageNumber <= 3;

  const urlPattern =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-z0-9]+\.(com|de|net|org|io)\b)/gi;
  const matches = text.match(urlPattern) || [];

  if (shouldBlock && matches.length > 0) {
    const filtered = text.replace(urlPattern, '[Link entfernt]');
      return {
      filtered,
        blocked: true,
      links: matches,
    };
  }

  return {
    filtered: text,
    blocked: false,
    links: matches,
  };
}

// ============================================================================
// SCAM PHRASE DETECTION
// ============================================================================

export function detectScamPhrases(text: string): {
  detected: boolean;
  phrases: string[];
} {
  const scamPhrases = [
    // Payment scams
    'paypal freunde',
    'paypal familie',
    'nur vorkasse',
    'western union',
    'moneygram',
    'bargeld vorab',
    'anzahlung erforderlich',
    
    // Urgency tactics
    'sofort kaufen',
    'letzte chance',
    'heute noch',
    'nur für kurze zeit',
    
    // Off-platform communication
    'whatsapp mir',
    'ruf mich an',
    'schreib mir auf',
    'kontaktiere mich außerhalb',
    
    // Shipping scams
    'versand per nachnahme',
    'zahlung nach erhalt',
    'treuhänder',
    
    // Too good to be true
    'original verpackt',
    'nie benutzt',
    'wie neu',
    'neupreis war',
  ];

  const lowerText = text.toLowerCase();
  const detectedPhrases = scamPhrases.filter((phrase) =>
    lowerText.includes(phrase.toLowerCase())
  );

  return {
    detected: detectedPhrases.length > 0,
    phrases: detectedPhrases,
  };
}

// ============================================================================
// PAYMENT REQUEST DETECTION
// ============================================================================

export function detectPaymentRequests(text: string): boolean {
  const paymentKeywords = [
    'überweise',
    'zahle',
    'bezahle',
    'iban',
    'kontonummer',
    'paypal',
    'vorkasse',
    'anzahlung',
    'kaution',
  ];

  const lowerText = text.toLowerCase();
  return paymentKeywords.some((keyword) => lowerText.includes(keyword));
}

// ============================================================================
// BOT DETECTION (Rapid Copy-Paste Replies)
// ============================================================================

export function detectBotBehavior(params: {
  messages: Array<{ content: string; timestamp: Date }>;
  userId: string;
}): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for very rapid responses (< 5 seconds)
  const rapidResponses = params.messages.filter((msg, idx) => {
    if (idx === 0) return false;
    const prev = params.messages[idx - 1];
    const timeDiff = msg.timestamp.getTime() - prev.timestamp.getTime();
    return timeDiff < 5000; // Less than 5 seconds
  });

  if (rapidResponses.length >= 3) {
    reasons.push('Sehr schnelle Antworten (möglicherweise automatisiert)');
  }

  // Check for identical messages
  const uniqueMessages = new Set(params.messages.map((m) => m.content));
  if (uniqueMessages.size < params.messages.length / 2) {
    reasons.push('Viele identische Nachrichten');
  }

  // Check for very long messages in rapid succession
  const longMessages = params.messages.filter((m) => m.content.length > 500);
  if (longMessages.length >= 2) {
    const timeDiff =
      longMessages[1].timestamp.getTime() - longMessages[0].timestamp.getTime();
    if (timeDiff < 10000) {
      // Less than 10 seconds between long messages
      reasons.push('Sehr lange Nachrichten in kurzer Zeit (copy-paste?)');
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

// ============================================================================
// MAIN FILTER FUNCTION
// ============================================================================

export function filterMessage(params: {
  content: string;
  messageNumber: number; // Position in conversation
  conversationAge: number; // Days since conversation started
  userAccountAge: number; // Days since user registered
}): FilterResult {
  const flags: MessageFlag[] = [];
  const warnings: string[] = [];
  let filtered = params.content;
  let blocked = false;

  // 1. Redact phone numbers
  const phoneResult = redactPhoneNumbers(filtered);
  if (phoneResult.count > 0) {
    filtered = phoneResult.redacted;
    flags.push({
      type: 'phone_number_redacted',
      severity: 'info',
      message: `${phoneResult.count} Telefonnummer(n) entfernt`,
    });
    warnings.push('⚠️ Tausche keine Kontaktdaten zu früh aus');
  }

  // 2. Redact emails
  const emailResult = redactEmails(filtered);
  if (emailResult.count > 0) {
    filtered = emailResult.redacted;
    flags.push({
      type: 'email_redacted',
      severity: 'info',
      message: `${emailResult.count} E-Mail-Adresse(n) entfernt`,
    });
    warnings.push('⚠️ Kommuniziere über die Plattform');
  }

  // 3. Block external links in first 3 messages
  const linkResult = detectAndBlockExternalLinks(filtered, params.messageNumber);
  if (linkResult.blocked) {
    filtered = linkResult.filtered;
    blocked = true;
    flags.push({
      type: 'external_link_blocked',
      severity: 'error',
      message: `${linkResult.links.length} externe Link(s) blockiert`,
    });
    warnings.push('🚫 Externe Links sind in den ersten Nachrichten nicht erlaubt');
  }

  // 4. Detect scam phrases
  const scamResult = detectScamPhrases(filtered);
  if (scamResult.detected) {
    flags.push({
      type: 'scam_phrase_detected',
      severity: 'warning',
      message: `Verdächtige Phrasen erkannt: ${scamResult.phrases.join(', ')}`,
    });
    warnings.push('⚠️ Sei vorsichtig - diese Nachricht enthält verdächtige Begriffe');
  }

  // 5. Detect payment requests
  if (detectPaymentRequests(filtered)) {
    flags.push({
      type: 'payment_request_detected',
      severity: 'error',
      message: 'Zahlungsanfrage erkannt',
    });
    warnings.push('🚫 NIEMALS außerhalb der Plattform zahlen!');
    
    // Block message if it's very early in conversation
    if (params.messageNumber <= 5) {
      blocked = true;
      warnings.push('Diese Nachricht wurde blockiert (zu frühe Zahlungsanfrage)');
    }
  }

  return {
    filtered,
    blocked,
    warnings,
    flags,
  };
}

// ============================================================================
// EXPORT FILTER PRESETS
// ============================================================================

export const FILTER_PRESETS = {
  STRICT: {
    redactPhone: true,
    redactEmail: true,
    blockLinksUntilMessage: 5,
    blockPaymentRequests: true,
  },
  MODERATE: {
    redactPhone: true,
    redactEmail: false,
    blockLinksUntilMessage: 3,
    blockPaymentRequests: true,
  },
  RELAXED: {
    redactPhone: false,
    redactEmail: false,
    blockLinksUntilMessage: 1,
    blockPaymentRequests: false,
  },
} as const;
