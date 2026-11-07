import { Route, Routes } from 'react-router-dom';

// Placeholder shell. i18n (T016), login/layout/API client (T017) and pages (T029+) come later.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>HSNV</h1>} />
    </Routes>
  );
}
