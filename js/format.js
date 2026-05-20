export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function stars(n) {
  const full = Math.floor(n);
  const half = n - full >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

export function sentimentChip(s) {
  if (s === 'pos') return '<span class="sentiment-chip chip-pos">✓ Positive</span>';
  if (s === 'neu') return '<span class="sentiment-chip chip-neu">~ Neutral</span>';
  if (s === 'mixed') return '<span class="sentiment-chip chip-neu">~ Mixed</span>';
  return '<span class="sentiment-chip chip-neg">✗ Negative</span>';
}

export const CONTACT_ICONS = {
  phone_us: '📞', phone_mx: '📱', phone_mx_toll: '📱', phone_direct: '📱',
  phone: '📞', email: '✉️', website: '🌐', whatsapp: '💬', address: '📍',
};

export const CONTACT_LABELS = {
  phone_us: 'Phone (USA/Canada)',
  phone_mx: 'Phone (Mexico Direct)',
  phone_mx_toll: 'Mexico Toll-Free',
  phone_direct: 'Direct Line',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  whatsapp: 'WhatsApp',
  address: 'Address',
};

export const RATING_LABELS = {
  overall: 'Overall', google: 'Google', tripadvisor: 'TripAdvisor',
  booking: 'Booking.com', expedia: 'Expedia',
};
