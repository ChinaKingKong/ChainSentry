import { MaterialIcon } from '../ui/MaterialIcon';

export type DashboardFABProps = {
  onClick?: () => void;
};

export function DashboardFAB({ onClick }: DashboardFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary-container shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all hover:scale-110 active:scale-90 md:bottom-10 md:right-10"
      aria-label="Focus command radar"
    >
      <MaterialIcon name="radar" className="text-2xl" filled />
    </button>
  );
}
