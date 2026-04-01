import { MaterialIcon } from '../ui/MaterialIcon';
import type { SideNavTab } from './SideNav';

export type MobileBottomNavProps = {
  active: SideNavTab;
  onActiveChange: (tab: SideNavTab) => void;
};

const tabs: { id: SideNavTab; label: string; icon: string }[] = [
  { id: 'command', label: 'Command', icon: 'dashboard' },
  { id: 'tokens', label: 'Tokens', icon: 'token' },
  { id: 'whales', label: 'Whales', icon: 'monitoring' },
  { id: 'sentry', label: 'Sentry', icon: 'security' },
];

export function MobileBottomNav({
  active,
  onActiveChange,
}: MobileBottomNavProps) {
  return (
    <nav
      className="fixed left-3 right-3 z-50 mx-auto flex max-w-lg items-center justify-around rounded-2xl border border-outline-variant/20 bg-surface-container/95 px-4 py-2.5 shadow-[0_-8px_32px_rgba(7,13,31,0.55)] backdrop-blur-xl md:hidden"
      style={{
        bottom: 'calc(1.35rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onActiveChange(t.id)}
            className={`flex flex-col items-center gap-1 ${
              isActive ? 'text-primary' : 'text-on-surface/50'
            }`}
          >
            <MaterialIcon name={t.icon} filled={isActive} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
