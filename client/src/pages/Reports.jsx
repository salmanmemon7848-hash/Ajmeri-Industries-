import { useState, useEffect } from 'react';
import { getDailyReport, getMonthlyReport, getStock } from '../services/api';
import { jsPDF } from 'jspdf';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDailyReport();
    fetchStock();
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
      <div className="flex gap-2 border-b">
        {['daily', 'monthly', 'stock'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab} Report
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
          else generateStockPDF();
        }}
        disabled={loading || (activeTab === 'daily' && !dailyReport) || (activeTab === 'monthly' && !monthlyReport) || (activeTab === 'stock' && !stock)}
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
              <h3 className="text-lg font-semibold">Stock Report - {new Date().toLocaleDateString()}</h3>
              
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
        </div>
      )}
    </div>
  );
};

export default Reports;
