import VisitTracker from './components/VisitTracker';
import EmailPage from './pages/EmailPage';

export default function App() {
  // Keep VisitTracker at the root so it runs once for the whole app.
  // The demo now exposes only the Email flow in a single-page layout.
  return (
    <>
      <VisitTracker />
      <EmailPage />
    </>
  );
}
