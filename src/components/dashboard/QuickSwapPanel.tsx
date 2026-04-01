import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../ui/MaterialIcon';

export function QuickSwapPanel() {
  const { t } = useTranslation();

  return (
    <div className="rounded border border-primary/10 bg-gradient-to-br from-surface-container-high to-surface-container p-6 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
      <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
        {t('quickSwap.title')}
      </h4>
      <div className="space-y-3">
        <a
          href="https://jup.ag/swap/SOL-USDC"
          target="_blank"
          rel="noreferrer"
          className="group flex cursor-pointer items-center justify-between rounded bg-surface-container-lowest p-3 transition-all hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <MaterialIcon name="currency_exchange" className="text-primary-container" />
            <div>
              <p className="font-headline text-xs font-bold text-on-surface">
                {t('quickSwap.solUsdcPair')}
              </p>
              <p className="text-[10px] text-on-surface/40">{t('quickSwap.solUsdcSubtitle')}</p>
            </div>
          </div>
          <MaterialIcon
            name="chevron_right"
            className="text-sm opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
          />
        </a>
        <a
          href="https://jup.ag/swap/JUP-SOL"
          target="_blank"
          rel="noreferrer"
          className="group flex cursor-pointer items-center justify-between rounded bg-surface-container-lowest p-3 transition-all hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <MaterialIcon name="auto_fix_high" className="text-primary-container" />
            <div>
              <p className="font-headline text-xs font-bold text-on-surface">
                {t('quickSwap.jupSolPair')}
              </p>
              <p className="text-[10px] text-on-surface/40">{t('quickSwap.jupSolSubtitle')}</p>
            </div>
          </div>
          <MaterialIcon
            name="chevron_right"
            className="text-sm opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
          />
        </a>
      </div>
      <a
        href="https://jup.ag/"
        target="_blank"
        rel="noreferrer"
        className="mt-6 block w-full rounded-sm bg-primary py-3 text-center font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all hover:brightness-110"
      >
        {t('quickSwap.openTerminal')}
      </a>
    </div>
  );
}
