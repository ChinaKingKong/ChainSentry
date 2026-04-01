import { MaterialIcon } from '../ui/MaterialIcon';

const events = [
  {
    icon: 'keyboard_double_arrow_down',
    tone: 'error' as const,
    title: 'Large Sell: 4,500 SOL',
    sub: 'Wallet: Gw9…2mP · 2 mins ago',
    tag: 'Price Impact: -0.42%',
  },
  {
    icon: 'keyboard_double_arrow_up',
    tone: 'secondary' as const,
    title: 'Large Buy: $1.2M USDC',
    sub: 'Wallet: H3k…9Lx · 5 mins ago',
    tag: 'Accumulation Phase',
  },
  {
    icon: 'account_balance_wallet',
    tone: 'primary' as const,
    title: 'Validator Transfer: 50k SOL',
    sub: 'Wallet: System…01 · 12 mins ago',
    tag: 'Governance Flow',
  },
];

export function WhaleWatcher() {
  return (
    <div className="mt-12 rounded border border-outline-variant/10 bg-surface-container-lowest p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            Whale Watcher
          </h3>
          <p className="text-xs text-on-surface/50">
            Illustrative large movements — connect data feeds to go live
          </p>
        </div>
        <MaterialIcon name="visibility" className="text-3xl text-primary" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <div
            key={e.title}
            className="flex items-start gap-4 rounded bg-surface-container/50 p-4"
          >
            <div
              className={`rounded-full p-2 ${
                e.tone === 'error'
                  ? 'bg-error/10 text-error'
                  : e.tone === 'secondary'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-primary/10 text-primary'
              }`}
            >
              <MaterialIcon name={e.icon} className="text-xl" />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-on-surface">{e.title}</p>
              <p className="mb-2 text-[10px] text-on-surface/40">{e.sub}</p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                  e.tone === 'error'
                    ? 'bg-error/10 text-error'
                    : e.tone === 'secondary'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-primary/10 text-primary'
                }`}
              >
                {e.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
