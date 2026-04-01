import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TokensPage } from './pages/TokensPage';
import { WhalesPage } from './pages/WhalesPage';
import { SentryPage } from './pages/SentryPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/whales" element={<WhalesPage />} />
        <Route path="/sentry" element={<SentryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
