/**
 * Helper to generate an optimal Google Maps location / directions URL
 * Opens directly in the Google Maps app on mobile or in browser.
 */
export function getGoogleMapsUrl(
  name: string,
  address: string,
  governorate?: string,
  center?: string,
  customUrl?: string
): string {
  if (customUrl && customUrl.trim().startsWith('http')) {
    return customUrl.trim();
  }
  const parts = [name, address, center, governorate, 'مصر'].filter(Boolean);
  const query = parts.join(' - ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
