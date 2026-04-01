import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../ui/MaterialIcon';

export type DashboardFABProps = {
  onClick?: () => void;
};

export function DashboardFAB({ onClick }: DashboardFABProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[7.25rem] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary-container shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all hover:scale-110 active:scale-90 md:bottom-10 md:right-10 md:h-14 md:w-14"
      aria-label={t('fab.focusRadar')}
    >
      <MaterialIcon name="radar" className="text-2xl" filled />
    </button>
  );
}
