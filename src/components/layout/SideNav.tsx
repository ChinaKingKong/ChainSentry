import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../ui/MaterialIcon';

export type SideNavTab = 'command' | 'tokens' | 'whales' | 'sentry';

const items: {
  id: SideNavTab;
  icon: string;
  to: string;
  end?: boolean;
}[] = [
  { id: 'command', icon: 'dashboard', to: '/', end: true },
  { id: 'tokens', icon: 'token', to: '/tokens' },
  { id: 'whales', icon: 'monitoring', to: '/whales' },
  { id: 'sentry', icon: 'security', to: '/sentry' },
];

export type SideNavProps = {
  nodeActive: boolean;
  slotDisplay: string;
};

export function SideNav({ nodeActive, slotDisplay }: SideNavProps) {
  const { t } = useTranslation();

  return (
    <aside className="hidden h-full min-h-0 w-64 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-lowest pb-6 pt-2 font-headline text-sm uppercase tracking-wider md:flex">
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex w-full items-center px-6 py-4 transition-colors duration-200',
                isActive
                  ? 'border-r-4 border-primary-container bg-surface-container-low font-bold text-primary'
                  : 'text-on-surface opacity-60 hover:bg-surface-container-low/50 hover:opacity-100',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <MaterialIcon
                  name={item.icon}
                  className="mr-4"
                  filled={isActive}
                />
                {t(`nav.${item.id}`)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4 px-6">
        <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            {t('sideNav.nodeStatus')}
          </p>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-on-surface/60">{t('sideNav.solanaMainnet')}</span>
            <span className={nodeActive ? 'text-secondary' : 'text-error'}>
              {nodeActive ? t('sideNav.active') : t('sideNav.down')}
            </span>
          </div>
          <p className="mb-3 truncate text-[10px] text-on-surface/40">
            {t('sideNav.slot', { value: slotDisplay })}
          </p>
          <button
            type="button"
            className="w-full border border-primary-container/30 bg-surface-container-low py-2 text-[11px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary-container hover:text-on-primary-container"
          >
            {t('sideNav.upgradeNode')}
          </button>
        </div>
        <div className="flex flex-col gap-2 border-t border-outline-variant/15 pt-4">
          <a
            className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-on-surface/60 transition-colors hover:text-primary"
            href="https://docs.solana.com/"
            target="_blank"
            rel="noreferrer"
          >
            <MaterialIcon name="menu_book" className="text-sm" />
            {t('sideNav.docs')}
          </a>
          <a
            className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-on-surface/60 transition-colors hover:text-primary"
            href="https://helius.dev/"
            target="_blank"
            rel="noreferrer"
          >
            <MaterialIcon name="contact_support" className="text-sm" />
            {t('sideNav.support')}
          </a>
        </div>
      </div>
    </aside>
  );
}
