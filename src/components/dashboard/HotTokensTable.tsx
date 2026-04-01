import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Token, TokenFeedCategory } from '../../types/token';
import { formatTokenPrice, formatUsdCompact, shortenAddress } from '../../lib/format';
import {
  riskToSentryScore,
  sentryScoreBarColor,
  sentryScoreTextColor,
} from '../../lib/sentryScore';
import { MaterialIcon } from '../ui/MaterialIcon';

export type HotTokensTableProps = {
  tokens: Token[];
  loading: boolean;
  searchQuery: string;
  category: TokenFeedCategory;
  onCategoryChange: (c: TokenFeedCategory) => void;
  onSentryScan: (token: Token) => void | Promise<void>;
  sentryScanBusy?: boolean;
  maxRows?: number;
};

const CATS: { id: TokenFeedCategory; labelKey: string }[] = [
  { id: 'meme', labelKey: 'hotTable.meme' },
  { id: 'defi', labelKey: 'hotTable.defi' },
  { id: 'lst', labelKey: 'hotTable.lst' },
];

export function HotTokensTable({
  tokens,
  loading,
  searchQuery,
  category,
  onCategoryChange,
  onSentryScan,
  sentryScanBusy = false,
  maxRows,
}: HotTokensTableProps) {
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = tokens;
    if (q) {
      list = list.filter(
        (tok) =>
          tok.symbol.toLowerCase().includes(q) ||
          tok.name.toLowerCase().includes(q) ||
          tok.address.toLowerCase().includes(q)
      );
    }
    return maxRows == null ? list : list.slice(0, maxRows);
  }, [tokens, searchQuery, maxRows]);

  return (
    <div
      style={{
        border: '2px solid #FFFFFF',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        backgroundColor: '#D4D0C8',
      }}
    >
      {/* Win2k window title bar */}
      <div
        className="win-titlebar"
        style={{ fontSize: '11px', padding: '3px 8px' }}
      >
        <MaterialIcon name="local_fire_department" />
        <span>{t('hotTable.title')}</span>
      </div>

      {/* Toolbar — category tabs as Win2k push buttons */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 flex-wrap"
        style={{
          backgroundColor: '#D4D0C8',
          borderBottom: '1px solid #808080',
        }}
      >
        <span className="text-[11px] font-bold mr-1" style={{ color: '#000080' }}>
          Category:
        </span>
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategoryChange(c.id)}
            className="win-btn text-[11px]"
            style={
              category === c.id
                ? {
                    borderTopColor: '#808080',
                    borderLeftColor: '#808080',
                    borderRightColor: '#FFFFFF',
                    borderBottomColor: '#FFFFFF',
                    backgroundColor: '#C0C0C0',
                    fontWeight: 'bold',
                    color: '#000080',
                  }
                : {}
            }
          >
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      {/* Table body */}
      {loading ? (
        <div
          className="flex min-h-[160px] items-center justify-center text-[11px]"
          style={{ color: '#444444', backgroundColor: '#FFFFFF' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              border: '2px solid #808080',
              borderRightColor: '#FFFFFF',
              borderBottomColor: '#FFFFFF',
              backgroundColor: '#D4D0C8',
            }}
          >
            <div
              className="h-4 w-4 animate-spin rounded-full"
              style={{
                border: '2px solid #808080',
                borderTopColor: '#000080',
              }}
            />
            <span>{t('hotTable.syncing')}</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="px-6 py-10 text-center text-[11px]"
          style={{ backgroundColor: '#FFFFFF', color: '#444444' }}
        >
          <p className="font-bold">{t('hotTable.noMatch')}</p>
          {searchQuery.trim() ? (
            <p className="mt-1 text-[10px]">{t('hotTable.clearSearchHint')}</p>
          ) : null}
        </div>
      ) : (
        <div
          className="overflow-x-auto"
          style={{
            border: '2px inset',
            borderTopColor: '#808080',
            borderLeftColor: '#808080',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            backgroundColor: '#FFFFFF',
          }}
        >
          <table
            className="w-full border-collapse text-left"
            style={{ fontSize: '11px', backgroundColor: '#FFFFFF' }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#D4D0C8',
                  borderBottom: '2px solid #808080',
                }}
              >
                {[
                  t('hotTable.asset'),
                  t('hotTable.price'),
                  t('hotTable.vol24h'),
                  t('hotTable.sentryScore'),
                  t('hotTable.action'),
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-1.5 font-bold text-left text-[11px]"
                    style={{
                      color: '#000000',
                      borderRight: '1px solid #FFFFFF',
                      borderBottom: '2px solid #808080',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((token, idx) => {
                const score = riskToSentryScore(token.risk_score);
                // Map score to classic Win2k green/yellow/red
                const scoreColor =
                  score >= 70 ? '#008000' : score >= 40 ? '#808000' : '#CC0000';
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={token.address}
                    style={{ backgroundColor: isEven ? '#FFFFFF' : '#F5F5F5' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#000080';
                      Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(
                        (td) => { td.style.color = '#FFFFFF'; }
                      );
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isEven ? '#FFFFFF' : '#F5F5F5';
                      Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(
                        (td) => { td.style.color = ''; }
                      );
                    }}
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        {/* Token icon — Win2k list icon style */}
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center text-[9px] font-bold"
                          style={{
                            backgroundColor: '#C0C0C0',
                            border: '1px solid #808080',
                            borderRightColor: '#FFFFFF',
                            borderBottomColor: '#FFFFFF',
                            color: '#000080',
                          }}
                        >
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[11px]">{token.symbol}</p>
                          <p className="text-[9px]" style={{ color: '#666666', fontFamily: 'Courier New, monospace' }}>
                            {shortenAddress(token.address)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 font-bold text-[11px]">
                      {formatTokenPrice(token.price)}{' '}
                      <span
                        style={{
                          color: token.change_24h >= 0 ? '#008000' : '#CC0000',
                          fontSize: '10px',
                        }}
                      >
                        {token.change_24h >= 0 ? '+' : ''}
                        {token.change_24h.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-[11px]">
                      {formatUsdCompact(token.volume_24h)}
                    </td>
                    <td className="px-3 py-1.5">
                      {/* Win2k progress bar */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-14 h-3 overflow-hidden"
                          style={{
                            border: '1px solid #808080',
                            borderRightColor: '#FFFFFF',
                            borderBottomColor: '#FFFFFF',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${score}%`,
                              backgroundColor: scoreColor,
                            }}
                          />
                        </div>
                        <span
                          className="text-[11px] font-bold w-6 text-right"
                          style={{ color: scoreColor }}
                        >
                          {score}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <button
                        type="button"
                        disabled={sentryScanBusy}
                        onClick={() => void onSentryScan(token)}
                        className="win-btn text-[10px]"
                        style={{ color: '#000080', fontWeight: 'bold' }}
                      >
                        {t('hotTable.sentryScan')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
