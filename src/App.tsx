import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TokensPage } from './pages/TokensPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

function WhalesPlaceholder() {
  const { t } = useTranslation();
  return (
    <PlaceholderPage title={t('pages.whales.title')} subtitle={t('pages.whales.subtitle')} />
  );
}

function SentryPlaceholder() {
  const { t } = useTranslation();
  return (
    <PlaceholderPage title={t('pages.sentry.title')} subtitle={t('pages.sentry.subtitle')} />
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/whales" element={<WhalesPlaceholder />} />
        <Route path="/sentry" element={<SentryPlaceholder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
