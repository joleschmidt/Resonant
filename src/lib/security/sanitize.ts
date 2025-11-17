/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks in user-generated content
 */

import sanitizeHtml from 'sanitize-html';

// Strict sanitization - removes all HTML tags
export function sanitizeText(dirty: string | null | undefined): string {
  if (!dirty) return '';
  
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}

// Allow basic formatting for descriptions
export function sanitizeDescription(dirty: string | null | undefined): string {
  if (!dirty) return '';
  
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},
    allowedSchemes: [],
    disallowedTagsMode: 'discard',
  });
}

// Allow links and basic formatting for bio/about sections
export function sanitizeBio(dirty: string | null | undefined): string {
  if (!dirty) return '';
  
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',
    transformTags: {
      // Force all links to open in new tab with noopener
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
  });
}

// Sanitize object with multiple fields
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: Array<keyof T>
): T {
  const sanitized = { ...obj };
  
  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeText(sanitized[field] as string) as T[typeof field];
    }
  }
  
  return sanitized;
}

