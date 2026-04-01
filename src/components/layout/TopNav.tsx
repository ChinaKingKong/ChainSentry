import { BrandLockup } from '../ui/BrandLockup';
import { MaterialIcon } from '../ui/MaterialIcon';

export type TopNavProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activityIndex: number | null;
  rpcConnected: boolean;
};

export function TopNav({
  searchQuery,
  onSearchChange,
  activityIndex,
  rpcConnected,
}: TopNavProps) {
  const tpsDisplay =
    activityIndex != null ? activityIndex.toLocaleString() : '—';

  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant/15 bg-background/80 px-6 py-3 shadow-[0_0_40px_-10px_rgba(7,13,31,0.6)] backdrop-blur-xl">
      <div className="flex items-center gap-8">
        <BrandLockup asLink />
        <div className="hidden items-center rounded-lg border border-outline-variant/15 bg-surface-container-low px-4 py-1.5 md:flex">
          <MaterialIcon name="search" className="mr-2 text-sm text-primary" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface/30 focus:ring-0"
            placeholder="Scan contract / wallet..."
            type="search"
            aria-label="Search contract or wallet"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-4 font-headline text-xs tracking-wider lg:flex">
          <span className="text-on-surface/50">
            TPS:{' '}
            <span className="text-primary-container">{tpsDisplay}</span>
          </span>
          <span className="text-on-surface/50">
            FEE:{' '}
            <span className="text-secondary">~0.000005 SOL</span>
          </span>
          <span
            className={
              rpcConnected ? 'text-secondary text-[10px]' : 'text-error text-[10px]'
            }
          >
            {rpcConnected ? 'RPC live' : 'RPC offline'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MaterialIcon
            name="notifications"
            className="cursor-pointer text-on-surface opacity-70 transition-all hover:opacity-100"
          />
          <MaterialIcon
            name="settings"
            className="cursor-pointer text-on-surface opacity-70 transition-all hover:opacity-100"
          />
          <button
            type="button"
            className="rounded-sm bg-primary-container px-5 py-2 font-headline text-sm font-bold text-on-primary-container shadow-[0_0_15px_-3px_rgba(34,211,238,0.4)] transition-all duration-150 active:scale-95"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
}
