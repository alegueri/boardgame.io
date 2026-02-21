// Vite eagerly imports all card images at build time and gives us hashed URLs.
// The pattern must be a static string literal — lookup is dynamic at runtime.
const images = import.meta.glob('../images/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export function getCardImage(filename: string): string {
  return images[`../images/${filename}`] ?? '';
}
