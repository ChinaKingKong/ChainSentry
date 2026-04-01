import { MaterialIcon } from '../ui/MaterialIcon';

export type SideNavTab = 'command' | 'tokens' | 'whales' | 'sentry';

export type SideNavProps = {
  active: SideNavTab;
  onActiveChange: (tab: SideNavTab) => void;
  nodeActive: boolean;
  slotDisplay: string;
};

const items: { id: SideNavTab; label: string; icon: string }[] = [
  { id: 'command', label: 'Command', icon: 'dashboard' },
  { id: 'tokens', label: 'Tokens', icon: 'token' },
  { id: 'whales', label: 'Whales', icon: 'monitoring' },
  { id: 'sentry', label: 'Sentry', icon: 'security' },
];

export function SideNav({
  active,
  onActiveChange,
  nodeActive,
  slotDisplay,
}: SideNavProps) {
  return (
    <aside className="docked sticky top-0 hidden h-screen w-64 flex-col border-r border-outline-variant/15 bg-surface-container-lowest pb-6 pt-2 md:flex">
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onActiveChange(item.id)}
              className={`flex w-full items-center px-6 py-4 font-headline text-sm uppercase tracking-wider transition-colors duration-200 ${
                isActive
                  ? 'border-r-4 border-primary-container bg-surface-container-low font-bold text-primary'
                  : 'text-on-surface opacity-60 hover:bg-surface-container-low/50 hover:opacity-100'
              }`}
            >
              <MaterialIcon
                name={item.icon}
                className="mr-4"
                filled={isActive}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 px-6">
        <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            Node Status
          </p>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-on-surface/60">Solana mainnet</span>
            <span className={nodeActive ? 'text-secondary' : 'text-error'}>
              {nodeActive ? 'Active' : 'Down'}
            </span>
          </div>
          <p className="mb-3 truncate text-[10px] text-on-surface/40">
            Slot {slotDisplay}
          </p>
          <button
            type="button"
            className="w-full border border-primary-container/30 bg-surface-container-low py-2 text-[11px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary-container hover:text-on-primary-container"
          >
            Upgrade Node
          </button>
        </div>
        <div className="flex flex-col gap-2 border-t border-outline-variant/15 pt-4">
          <a
            className="flex items-center text-[11px] uppercase tracking-widest text-on-surface/60 transition-colors hover:text-primary"
            href="https://docs.solana.com/"
            target="_blank"
            rel="noreferrer"
          >
            <MaterialIcon name="menu_book" className="mr-2 text-sm" />
            Docs
          </a>
          <a
            className="flex items-center text-[11px] uppercase tracking-widest text-on-surface/60 transition-colors hover:text-primary"
            href="https://helius.dev/"
            target="_blank"
            rel="noreferrer"
          >
            <MaterialIcon name="contact_support" className="mr-2 text-sm" />
            Support
          </a>
        </div>
      </div>
    </aside>
  );
}
