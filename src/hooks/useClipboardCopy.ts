import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './useToast';

/**
 * 写入剪贴板并弹出全局 Toast；供所有「复制」按钮复用。
 */
export function useClipboardCopy() {
  const { show } = useToast();
  const { t } = useTranslation();

  return useCallback(
    async (text: string | null | undefined) => {
      const v = text?.trim();
      if (!v) return false;
      try {
        await navigator.clipboard.writeText(v);
        show(t('toast.copied'));
        return true;
      } catch {
        show(t('toast.copyFailed'));
        return false;
      }
    },
    [show, t]
  );
}
