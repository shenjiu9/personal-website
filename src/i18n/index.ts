import zh from './zh';
import en from './en';

export type Lang = 'zh' | 'en';
export const langs: Lang[] = ['zh', 'en'];
export const dict = { zh, en };
export const t = (lang: Lang) => dict[lang];

export type Bi = { zh: string; en: string } | undefined | null;

/** Pick the string for a language; English falls back to Chinese when empty. */
export function pick(value: Bi, lang: Lang): string {
  if (!value) return '';
  return (lang === 'en' ? value.en || value.zh : value.zh) ?? '';
}

/** Build a localized path. Chinese is unprefixed, English lives under /en. */
export function href(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'zh') return clean;
  return clean === '/' ? '/en/' : `/en${clean}`;
}

/** Strip the /en prefix so a path can be re-localized. */
export function basePath(pathname: string): string {
  const p = pathname.replace(/^\/en(?=\/|$)/, '');
  return p === '' ? '/' : p;
}

/** Split text into paragraphs on blank lines. */
export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
