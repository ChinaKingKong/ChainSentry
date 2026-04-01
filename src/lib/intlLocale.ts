/** Map i18next language code to BCP 47 for Intl / toLocaleString */
export function intlLocaleFor(i18nLang: string | undefined): string {
  if (!i18nLang) return 'en-US';
  if (i18nLang.startsWith('zh')) return 'zh-CN';
  return 'en-US';
}
