import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import PaddyEntry from './pages/PaddyEntry';
import PurchaseEntry from './pages/PurchaseEntry';
import MillingEntry from './pages/MillingEntry';
import ExpenseEntry from './pages/ExpenseEntry';
import WorkerEntry from './pages/WorkerEntry';
import SalesEntry from './pages/SalesEntry';
import Reports from './pages/Reports';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock" element={<Stock />} />
            <Route path="paddy-entry" element={<PaddyEntry />} />
            <Route path="purchase-entry" element={<PurchaseEntry />} />
            <Route path="milling-entry" element={<MillingEntry />} />
            <Route path="expense-entry" element={<ExpenseEntry />} />
            <Route path="worker-entry" element={<WorkerEntry />} />
            <Route path="sales-entry" element={<SalesEntry />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App
