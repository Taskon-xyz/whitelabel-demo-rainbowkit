import { Navigate, Route, Routes } from 'react-router-dom';
import VisitTracker from './components/VisitTracker';
import HomePage from './pages/HomePage';
import EmailPage from './pages/EmailPage';
import EvmPage from './pages/EvmPage';

export default function App() {
  // Keep VisitTracker outside routes so it runs once for the whole app.
  return (
    <>
      <VisitTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/email" element={<EmailPage />} />
        <Route path="/evm/*" element={<EvmPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
