import { useVisitTracker } from '../hooks/useVisitTracker';

export default function VisitTracker() {
  // This component is a lightweight hook bridge; it does not render UI.
  // Keeping it as a component lets us reuse the same pattern used in the demo.
  useVisitTracker();
  return null;
}
