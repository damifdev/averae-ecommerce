export type EngagementEvent = 'mobile_nav_click' | 'mobile_drawer_open' | 'footer_link_click' | 'account_section_save' | 'quick_view_open' | 'quick_view_variant_select' | 'quick_view_add_to_bag' | 'contact_form_submit' | 'contact_faq_click' | 'contact_track_order_click' | 'return_request_submitted';

export type AccountPreference = {
  style: 'minimal' | 'expressive' | 'heritage';
  emails: boolean;
  sms: boolean;
};

export type SavedAddress = {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  city: string;
  region: string;
  phone: string;
  primary?: boolean;
};

export type PaymentMethod = {
  id: string;
  label: string;
  type: 'card' | 'bank';
  last4: string;
  expiry?: string;
  primary?: boolean;
};

export const ACCOUNT_STORAGE_KEYS = {
  addresses: 'averae-account-addresses',
  payments: 'averae-account-payments',
  preferences: 'averae-account-preferences',
} as const;

export function trackEngagement(event: EngagementEvent, properties: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  const analyticsWindow = window as Window & { umami?: { track?: (name: string, data?: Record<string, string>) => void } };
  if (analyticsWindow.umami?.track) {
    analyticsWindow.umami.track(event, properties);
  } else {
    window.dispatchEvent(new CustomEvent('averae-analytics', { detail: { event, properties } }));
  }
}

export function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('averae-account-updated', { detail: { key } }));
}

export function safeEventLabel(value: string) {
  return value.trim().slice(0, 80);
}
