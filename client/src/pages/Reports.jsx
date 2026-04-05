import { useState, useEffect } from 'react';
import { getDailyReport, getMonthlyReport, getStock, getExpenses, getWorkers, getPaddyPurchases, getPurchases, getMillingProcesses, getSales, deleteAllPurchases, deleteAllSales, deleteAllExpenses, deleteAllMilling, deleteAllPaddyPurchases, deleteAllWorkers } from '../services/api';
import { jsPDF } from 'jspdf';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [stock, setStock] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [paddyPurchases, setPaddyPurchases] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [millingProcesses, setMillingProcesses] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    fetchDailyReport();
    fetchStock();
    fetchExpenses();
    fetchWorkers();
    fetchPaddyPurchases();
    fetchPurchases();
    fetchMillingProcesses();
    fetchSales();
  }, []);

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyReport();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const response = await getDailyReport();
      setDailyReport(response.data.data);
    } catch (error) {
      console.error('Error fetching daily report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyReport(selectedYear, selectedMonth);
      setMonthlyReport(response.data.data);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await getStock();
      setStock(response.data.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpenses(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await getWorkers();
      setWorkers(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchPaddyPurchases = async () => {
    try {
      const response = await getPaddyPurchases();
      setPaddyPurchases(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching paddy purchases:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await getPurchases();
      setPurchases(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchMillingProcesses = async () => {
    try {
      const response = await getMillingProcesses();
      setMillingProcesses(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching milling processes:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await getSales();
      setSales(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  // Delete All handlers
  const handleDeleteAll = (type) => {
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setLoading(true);
      let result;
      
      switch (deleteType) {
        case 'stock':
          // Reset stock to zero
          await import('../services/api').then(api => api.updateStock({
            paddy_quantity: 0, paddy_bags: 0,
            rice_quantity: 0, bran_quantity: 0,
            broken_quantity: 0, rafi_quantity: 0, husk_quantity: 0
          }));
          result = { message: 'Stock reset successfully' };
          break;
        case 'purchasePaddy':
          result = await deleteAllPaddyPurchases();
          break;
        case 'purchaseRice':
        case 'purchases':
          result = await deleteAllPurchases();
          break;
        case 'sales':
          result = await deleteAllSales();
          break;
        case 'expenses':
          result = await deleteAllExpenses();
          break;
        case 'milling':
          result = await deleteAllMilling();
          break;
        case 'workers':
          result = await deleteAllWorkers();
          break;
        default:
          throw new Error('Invalid delete type');
      }
      
      setDeleteMessage(`✅ ${result.message || 'Deleted successfully'}`);
      setShowDeleteModal(false);
      
      // Refresh data
      if (deleteType === 'stock') fetchStock();
      else if (deleteType === 'purchasePaddy') fetchPaddyPurchases();
      else if (deleteType === 'purchaseRice' || deleteType === 'purchases') fetchPurchases();
      else if (deleteType === 'sales') fetchSales();
      else if (deleteType === 'expenses') fetchExpenses();
      else if (deleteType === 'milling') fetchMillingProcesses();
      else if (deleteType === 'workers') fetchWorkers();
      
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (error) {
      setDeleteMessage(`❌ Error: ${error.message}`);
      setShowDeleteModal(false);
      setTimeout(() => setDeleteMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteAll = () => {
    setShowDeleteModal(false);
    setDeleteType('');
  };

  const generateDailyPDF = () => {
    if (!dailyReport) return;

    const doc = new jsPDF();
    const date = new Date(dailyReport.date).toLocaleDateString();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Daily Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 30);

    let y = 50;
    
    // Purchases
    doc.setFontSize(14);
    doc.text('Paddy Purchases', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Purchases: ${dailyReport.purchases.count}`, 20, y);
    y += 7;
    doc.text(`Total Hamali: ₹${dailyReport.purchases.totalHamali}`, 20, y);
    y += 15;

    // Milling
    doc.setFontSize(14);
    doc.text('Milling', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Milled: ${dailyReport.milling.totalQuantity} Qu`, 20, y);
    y += 15;

    // Expenses
    doc.setFontSize(14);
    doc.text('Expenses', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Expenses: ₹${dailyReport.expenses.total}`, 20, y);
    y += 15;

    // Sales
    doc.setFontSize(14);
    doc.text('Sales', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Sales: ₹${dailyReport.sales.total}`, 20, y);
    y += 15;

    // Profit
    doc.setFontSize(14);
    doc.text('Profit/Loss', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Sales: ₹${dailyReport.profit.totalSales}`, 20, y);
    y += 7;
    doc.text(`Total Expenses: ₹${dailyReport.profit.totalExpenses}`, 20, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Net Profit: ₹${dailyReport.profit.netProfit}`, 20, y);

    doc.save(`Daily_Report_${date.replace(/\//g, '_')}.pdf`);
  };

  const generateMonthlyPDF = () => {
    if (!monthlyReport) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Monthly Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${monthlyReport.month}`, 20, 30);

    let y = 50;
    
    // Purchases
    doc.setFontSize(14);
    doc.text('Paddy Purchases', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Quantity: ${monthlyReport.purchases.totalQuantity} Qu`, 20, y);
    y += 7;
    doc.text(`Total Hamali: ₹${monthlyReport.purchases.totalHamali}`, 20, y);
    y += 15;

    // Milling
    doc.setFontSize(14);
    doc.text('Milling', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Milled: ${monthlyReport.milling.totalQuantity} Qu`, 20, y);
    y += 15;

    // Expenses
    doc.setFontSize(14);
    doc.text('Expenses', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Operational: ₹${monthlyReport.expenses.operational}`, 20, y);
    y += 7;
    doc.text(`Worker Payments: ₹${monthlyReport.expenses.workerPayments}`, 20, y);
    y += 7;
    doc.text(`Hamali: ₹${monthlyReport.expenses.hamali}`, 20, y);
    y += 7;
    doc.text(`Total: ₹${monthlyReport.expenses.total}`, 20, y);
    y += 15;

    // Sales
    doc.setFontSize(14);
    doc.text('Sales', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Sales: ₹${monthlyReport.sales.total}`, 20, y);
    y += 15;

    // Profit
    doc.setFontSize(14);
    doc.text('Profit/Loss', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Sales: ₹${monthlyReport.profit.totalSales}`, 20, y);
    y += 7;
    doc.text(`Total Expenses: ₹${monthlyReport.profit.totalExpenses}`, 20, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Net Profit: ₹${monthlyReport.profit.netProfit}`, 20, y);

    doc.save(`Monthly_Report_${monthlyReport.month.replace(/\s/g, '_')}.pdf`);
  };

  const generateStockPDF = () => {
    if (!stock) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Stock Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text('Current Stock', 20, y);
    y += 15;

    doc.setFontSize(10);
    const items = [
      { name: 'Paddy', qty: `${stock.paddy.quantity} ${stock.paddy.unit} (${stock.paddy.bags} bags)` },
      { name: 'Rice', qty: `${stock.rice.quantity} ${stock.rice.unit}` },
      { name: 'Bran', qty: `${stock.bran.quantity} ${stock.bran.unit}` },
      { name: 'Broken', qty: `${stock.broken.quantity} ${stock.broken.unit}` },
      { name: 'Rafi', qty: `${stock.rafi.quantity} ${stock.rafi.unit}` },
      { name: 'Husk', qty: `${stock.husk.quantity} ${stock.husk.unit}` },
    ];

    items.forEach(item => {
      doc.text(`${item.name}: ${item.qty}`, 20, y);
      y += 10;
    });

    doc.save(`Stock_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExpensePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Expense History', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text('All Expenses', 20, y);
    y += 15;

    doc.setFontSize(10);
    expenses.forEach((expense, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${new Date(expense.date).toLocaleDateString()} - ${expense.category}`, 20, y);
      y += 7;
      doc.text(`   Amount: ₹${expense.amount}${expense.notes ? ' | Notes: ' + expense.notes : ''}`, 20, y);
      y += 10;
    });

    doc.save(`Expense_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateWorkerPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Worker History', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text('Worker Payments', 20, y);
    y += 15;

    doc.setFontSize(10);
    workers.forEach((worker, index) => {
      if (worker.payments && worker.payments.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${index + 1}. ${worker.name} (${worker.role})`, 20, y);
        y += 7;
        worker.payments.forEach((payment, pidx) => {
          doc.text(`   ${pidx + 1}. ${new Date(payment.date).toLocaleDateString()} - ₹${payment.amount} (${payment.type})`, 20, y);
          y += 7;
        });
        y += 5;
      }
    });

    doc.save(`Worker_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generatePaddyPurchasePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Add Paddy History', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text('Paddy Entries', 20, y);
    y += 15;

    doc.setFontSize(10);
    paddyPurchases.forEach((item, index) => {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${new Date(item.date).toLocaleDateString()} - ${item.farmerName || item.source || 'N/A'}`, 20, y);
      y += 7;
      const totalQuintal = item.totalQuintal || ((item.totalQuantity || 0) / 2.5).toFixed(2);
      doc.text(`   New: ${item.newQuantity || 0} Qu | Old: ${item.oldQuantity || 0} Qu`, 20, y);
      y += 7;
      doc.text(`   Total Bags: ${item.totalQuantity || 0} Qu | Total Quintal: ${totalQuintal} Qu`, 20, y);
      y += 7;
      doc.text(`   Hamali: ₹${item.totalHamali || 0}`, 20, y);
      if (item.description) {
        y += 7;
        doc.text(`   Description: ${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}`, 20, y);
      }
      y += 10;
    });

    doc.save(`Add_Paddy_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generatePurchaseHistoryPDF = (type) => {
    const doc = new jsPDF();
    const filteredPurchases = purchases.filter(p => p.type === type);
    
    doc.setFontSize(20);
    doc.text(`Ajmeri Industries - ${type === 'paddy' ? 'Purchase Paddy' : 'Purchase Rice'} History`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text(`${type === 'paddy' ? 'Paddy' : 'Rice'} Purchase Entries`, 20, y);
    y += 15;

    doc.setFontSize(10);
    filteredPurchases.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${new Date(item.date).toLocaleDateString()} - ${item.supplierName || 'N/A'}`, 20, y);
      y += 7;
      doc.text(`   Qty: ${item.quantity || 0} Qu | Rate: ₹${item.rate || 0}/Qu | Total: ₹${item.totalAmount || 0}`, 20, y);
      y += 7;
      if (type === 'paddy') {
        doc.text(`   Hamali: ₹${item.totalHamali || 0}`, 20, y);
        y += 7;
      }
      y += 3;
    });

    doc.save(`${type === 'paddy' ? 'Purchase_Paddy' : 'Purchase_Rice'}_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateMillingPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Milling History', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text('Milling Entries', 20, y);
    y += 15;

    doc.setFontSize(10);
    millingProcesses.forEach((item, index) => {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${new Date(item.date).toLocaleDateString()}`, 20, y);
      y += 7;
      doc.text(`   Input: ${item.quantity || 0} ${item.unit || 'Qu'}`, 20, y);
      y += 7;
      doc.text(`   Output - Rice: ${item.rice || 0}, Bran: ${item.bran || 0}, Broken: ${item.broken || 0}`, 20, y);
      y += 7;
      doc.text(`            Rafi: ${item.rafi || 0}, Husk: ${item.husk || 0}, Wastage: ${item.wastage || 0}`, 20, y);
      y += 10;
    });

    doc.save(`Milling_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateSalesPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Ajmeri Industries - Sales History', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(14);
    doc.text('Sales Entries', 20, y);
    y += 15;

    doc.setFontSize(10);
    sales.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${new Date(item.date).toLocaleDateString()} - ${item.buyerName || 'N/A'}`, 20, y);
      y += 7;
      doc.text(`   Product: ${item.product || 'N/A'} | Qty: ${item.quantity || 0} ${item.unit || 'Qu'}`, 20, y);
      y += 7;
      doc.text(`   Rate: ₹${item.rate || 0}/${item.unit || 'Qu'} | Total: ₹${item.totalAmount || 0}`, 20, y);
      y += 10;
    });

    doc.save(`Sales_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Reports</h2>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b flex-wrap">
        {['daily', 'monthly', 'stock', 'addPaddy', 'purchasePaddy', 'purchaseRice', 'milling', 'sales', 'expenses', 'workers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab === 'addPaddy' ? 'Add Paddy' : 
             tab === 'purchasePaddy' ? 'Purchase Paddy' : 
             tab === 'purchaseRice' ? 'Purchase Rice' : 
             tab === 'milling' ? 'Milling' : 
             tab === 'sales' ? 'Sales' : 
             tab === 'expenses' ? 'Expense History' : 
             tab === 'workers' ? 'Worker History' : 
             `${tab} Report`}
          </button>
        ))}
      </div>

      {/* Monthly Selector */}
      {activeTab === 'monthly' && (
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={() => {
          if (activeTab === 'daily') generateDailyPDF();
          else if (activeTab === 'monthly') generateMonthlyPDF();
          else if (activeTab === 'stock') generateStockPDF();
          else if (activeTab === 'addPaddy') generatePaddyPurchasePDF();
          else if (activeTab === 'purchasePaddy') generatePurchaseHistoryPDF('paddy');
          else if (activeTab === 'purchaseRice') generatePurchaseHistoryPDF('rice');
          else if (activeTab === 'milling') generateMillingPDF();
          else if (activeTab === 'sales') generateSalesPDF();
          else if (activeTab === 'expenses') generateExpensePDF();
          else if (activeTab === 'workers') generateWorkerPDF();
        }}
        disabled={loading || 
          (activeTab === 'daily' && !dailyReport) || 
          (activeTab === 'monthly' && !monthlyReport) || 
          (activeTab === 'stock' && !stock) || 
          (activeTab === 'addPaddy' && paddyPurchases.length === 0) ||
          (activeTab === 'purchasePaddy' && purchases.filter(p => p.type === 'paddy').length === 0) ||
          (activeTab === 'purchaseRice' && purchases.filter(p => p.type === 'rice').length === 0) ||
          (activeTab === 'milling' && millingProcesses.length === 0) ||
          (activeTab === 'sales' && sales.length === 0) ||
          (activeTab === 'expenses' && expenses.length === 0) || 
          (activeTab === 'workers' && workers.length === 0)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        Download PDF
      </button>

      {/* Report Content */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'daily' && dailyReport && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Daily Report - {new Date(dailyReport.date).toLocaleDateString()}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Purchases</div>
                  <div className="text-xl font-bold">{dailyReport.purchases.count}</div>
                  <div className="text-sm text-gray-500">Hamali: ₹{dailyReport.purchases.totalHamali}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Milling</div>
                  <div className="text-xl font-bold">{dailyReport.milling.totalQuantity} Qu</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Expenses</div>
                  <div className="text-xl font-bold">₹{dailyReport.expenses.total}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Sales</div>
                  <div className="text-xl font-bold">₹{dailyReport.sales.total}</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${dailyReport.profit.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="text-sm text-gray-600">Net Profit/Loss</div>
                <div className={`text-2xl font-bold ${dailyReport.profit.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{dailyReport.profit.netProfit}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monthly' && monthlyReport && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Monthly Report - {monthlyReport.month}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Purchases</div>
                  <div className="text-xl font-bold">{monthlyReport.purchases.count}</div>
                  <div className="text-sm text-gray-500">{monthlyReport.purchases.totalQuantity} Qu</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Milling</div>
                  <div className="text-xl font-bold">{monthlyReport.milling.totalQuantity} Qu</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-xl font-bold">₹{monthlyReport.expenses.total}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Sales</div>
                  <div className="text-xl font-bold">₹{monthlyReport.sales.total}</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${monthlyReport.profit.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="text-sm text-gray-600">Net Profit/Loss</div>
                <div className={`text-2xl font-bold ${monthlyReport.profit.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{monthlyReport.profit.netProfit}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && stock && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Stock Report - {new Date().toLocaleDateString()}</h3>
                <button
                  onClick={() => handleDeleteAll('stock')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Stock
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Paddy</div>
                  <div className="text-xl font-bold">{stock.paddy.quantity} {stock.paddy.unit}</div>
                  <div className="text-sm text-gray-500">{stock.paddy.bags} bags</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Rice</div>
                  <div className="text-xl font-bold">{stock.rice.quantity} {stock.rice.unit}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Bran</div>
                  <div className="text-xl font-bold">{stock.bran.quantity} {stock.bran.unit}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Broken</div>
                  <div className="text-xl font-bold">{stock.broken.quantity} {stock.broken.unit}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Rafi</div>
                  <div className="text-xl font-bold">{stock.rafi.quantity} {stock.rafi.unit}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Husk</div>
                  <div className="text-xl font-bold">{stock.husk.quantity} {stock.husk.unit}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Expense History</h3>
                <button
                  onClick={() => handleDeleteAll('expenses')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Expenses
                </button>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No expenses recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {expenses.map((expense, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{expense.category}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">₹{expense.amount}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{expense.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'workers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Worker History</h3>
                <button
                  onClick={() => handleDeleteAll('workers')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Workers
                </button>
              </div>
              
              {workers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No workers added yet.</div>
              ) : (
                <div className="space-y-4">
                  {workers.map((worker, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{worker.name}</h4>
                          <span className="text-sm text-gray-500">{worker.role}</span>
                        </div>
                      </div>
                      
                      {worker.payments && worker.payments.length > 0 ? (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Payment History:</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left">Date</th>
                                  <th className="px-3 py-2 text-left">Type</th>
                                  <th className="px-3 py-2 text-left">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {worker.payments.map((payment, pidx) => (
                                  <tr key={pidx}>
                                    <td className="px-3 py-2">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="px-3 py-2">
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{payment.type}</span>
                                    </td>
                                    <td className="px-3 py-2 font-medium">₹{payment.amount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">No payments recorded</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addPaddy' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Paddy History</h3>
                <button
                  onClick={() => handleDeleteAll('purchasePaddy')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Entries
                </button>
              </div>
              
              {paddyPurchases.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No paddy entries recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Source</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">New Bags</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Old Bags</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total Bags</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total Quintal</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Hamali</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paddyPurchases.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.farmerName || item.source || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{item.newQuantity || 0} Qu</td>
                          <td className="px-4 py-3 text-sm">{item.oldQuantity || 0} Qu</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.totalQuantity || 0} Qu</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-700">{item.totalQuintal || ((item.totalQuantity || 0) / 2.5).toFixed(2)} Qu</td>
                          <td className="px-4 py-3 text-sm">₹{item.totalHamali || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchasePaddy' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Purchase Paddy History</h3>
                <button
                  onClick={() => handleDeleteAll('purchasePaddy')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Purchases
                </button>
              </div>
              
              {purchases.filter(p => p.type === 'paddy').length === 0 ? (
                <div className="text-center text-gray-500 py-8">No paddy purchases recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Supplier</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rate</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Hamali</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {purchases.filter(p => p.type === 'paddy').map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.supplierName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{item.quantity || 0} Qu</td>
                          <td className="px-4 py-3 text-sm">₹{item.rate || 0}/Qu</td>
                          <td className="px-4 py-3 text-sm font-medium">₹{item.totalAmount || 0}</td>
                          <td className="px-4 py-3 text-sm">₹{item.totalHamali || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchaseRice' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Purchase Rice History</h3>
                <button
                  onClick={() => handleDeleteAll('purchaseRice')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Purchases
                </button>
              </div>
              
              {purchases.filter(p => p.type === 'rice').length === 0 ? (
                <div className="text-center text-gray-500 py-8">No rice purchases recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Supplier</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rate</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {purchases.filter(p => p.type === 'rice').map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.supplierName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{item.quantity || 0} Qu</td>
                          <td className="px-4 py-3 text-sm">₹{item.rate || 0}/Qu</td>
                          <td className="px-4 py-3 text-sm font-medium">₹{item.totalAmount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milling' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Milling History</h3>
                <button
                  onClick={() => handleDeleteAll('milling')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Records
                </button>
              </div>
              
              {millingProcesses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No milling entries recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Input</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rice</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Bran</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Broken</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rafi</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Husk</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Wastage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {millingProcesses.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.quantity || 0} {item.unit || 'Qu'}</td>
                          <td className="px-4 py-3 text-sm">{item.rice || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.bran || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.broken || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.rafi || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.husk || 0}</td>
                          <td className="px-4 py-3 text-sm text-orange-600">{item.wastage || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sales History</h3>
                <button
                  onClick={() => handleDeleteAll('sales')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Delete All Sales
                </button>
              </div>
              
              {sales.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No sales recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Buyer</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rate</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sales.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.buyerName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">{item.product || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.quantity || 0} {item.unit || 'Qu'}</td>
                          <td className="px-4 py-3 text-sm">₹{item.rate || 0}/{item.unit || 'Qu'}</td>
                          <td className="px-4 py-3 text-sm font-medium">₹{item.totalAmount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">⚠️ Warning: Delete All Data?</h3>
              <p className="text-sm text-gray-600 text-center">
                This will permanently delete ALL records in this section. This action cannot be undone!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={cancelDeleteAll}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAll}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success/Error Message */}
      {deleteMessage && (
        <div className="fixed bottom-4 right-4 bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 z-50 animate-fade-in">
          <p className="text-sm font-medium text-gray-800">{deleteMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
