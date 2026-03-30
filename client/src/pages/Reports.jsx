import { useState, useEffect } from 'react';
import { getDailyReport, getMonthlyReport, getStock, getExpenses, getWorkers } from '../services/api';
import { jsPDF } from 'jspdf';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [stock, setStock] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDailyReport();
    fetchStock();
    fetchExpenses();
    fetchWorkers();
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
        {['daily', 'monthly', 'stock', 'expenses', 'workers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab === 'expenses' ? 'Expense History' : tab === 'workers' ? 'Worker History' : `${tab} Report`}
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
          else if (activeTab === 'expenses') generateExpensePDF();
          else if (activeTab === 'workers') generateWorkerPDF();
        }}
        disabled={loading || (activeTab === 'daily' && !dailyReport) || (activeTab === 'monthly' && !monthlyReport) || (activeTab === 'stock' && !stock) || (activeTab === 'expenses' && expenses.length === 0) || (activeTab === 'workers' && workers.length === 0)}
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

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Expense History</h3>
              
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
              <h3 className="text-lg font-semibold">Worker History</h3>
              
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
        </div>
      )}
    </div>
  );
};

export default Reports;
