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
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/10 bg-surface-container px-6 py-3 md:hidden">
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
