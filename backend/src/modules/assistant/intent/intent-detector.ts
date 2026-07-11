export type AssistantIntent = 'tracking' | 'document_request' | 'general';

export interface DetectedIntent {
  type: AssistantIntent;
  trackingNumber?: string;
}

const TRACKING_CODE_REGEX = /RSMS-\d{8}-\d{4}/i;

const TRACKING_PHRASE_REGEX =
  /\b(where('?s| is)?\s+my\s+(document|request|dtr|tor|transcript)|track(ing)?\s+(my\s+)?(request|document)|status\s+of\s+my\s+request|nasaan\s+na\s+(ang\s+)?(request|dokumento))\b/i;

const DOCUMENT_REQUEST_REGEX =
  /\b(how\s+(do|can)\s+i\s+(request|get|apply\s+for)|i\s+(want|need)\s+to\s+request|request\s+(a|an|for)?\s*(document|transcript|tor|copy|certificate|diploma|good\s+moral)|paano\s+mag[- ]?request)\b/i;

export function detectIntent(message: string): DetectedIntent {
  const trackingMatch = message.match(TRACKING_CODE_REGEX);
  if (trackingMatch) {
    return { type: 'tracking', trackingNumber: trackingMatch[0].toUpperCase() };
  }

  if (TRACKING_PHRASE_REGEX.test(message)) {
    return { type: 'tracking' };
  }

  if (DOCUMENT_REQUEST_REGEX.test(message)) {
    return { type: 'document_request' };
  }

  return { type: 'general' };
}
