import { jsPDF } from 'jspdf';

// Generate PDF for Paddy Entry
export const generatePaddyPDF = (data) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(20);
  doc.text('Ajmeri Industries', 20, 20);
  doc.setFontSize(14);
  doc.text('Paddy Entry Preview', 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 40);
  
  let y = 60;
  
  doc.setFontSize(12);
  doc.text('Entry Details:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  const fields = [
    ['Date:', data.date],
    ['Source:', data.farmerName || data.source],
    ['New Bags:', `${data.newQuantity || 0} Qu`],
    ['Old Bags:', `${data.oldQuantity || 0} Qu`],
    ['Total Bags:', `${(parseFloat(data.newQuantity) + parseFloat(data.oldQuantity)).toFixed(2)} Qu`],
    ['Total Quintal:', `${data.totalQuintal || ((parseFloat(data.newQuantity) + parseFloat(data.oldQuantity)) / 2.5).toFixed(2)} Qu`],
    ['Rice Mill Hamali:', `₹${data.riceMillHamali || 0}`],
    ['Warehouse Hamali:', `₹${data.warehouseHamali || 0}`],
    ['Total Hamali:', `₹${(parseFloat(data.riceMillHamali) + parseFloat(data.warehouseHamali)).toFixed(2)}`],
  ];
  
  if (data.description) {
    fields.push(['Description:', data.description]);
  }
  
  fields.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 8;
  });
  
  return doc;
};

// Generate PDF for Purchase Entry
export const generatePurchasePDF = (data, type) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(20);
  doc.text('Ajmeri Industries', 20, 20);
  doc.setFontSize(14);
  doc.text(`${type === 'paddy' ? 'Paddy' : 'Rice'} Purchase Preview`, 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 40);
  
  let y = 60;
  
  doc.setFontSize(12);
  doc.text('Purchase Details:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  const fields = [
    ['Date:', data.date],
    ['Supplier:', data.supplierName],
    ['Quantity:', `${data.quantity} Qu`],
    ['Rate:', `₹${data.rate}/Qu`],
    ['Total Amount:', `₹${(data.quantity * data.rate).toLocaleString()}`],
  ];
  
  if (type === 'paddy') {
    fields.push(['Rice Mill Hamali:', `₹${data.riceMillHamali || 0}`]);
    fields.push(['Warehouse Hamali:', `₹${data.warehouseHamali || 0}`]);
    fields.push(['Total Hamali:', `₹${((parseFloat(data.riceMillHamali) || 0) + (parseFloat(data.warehouseHamali) || 0)).toFixed(2)}`]);
  }
  
  if (data.notes) {
    fields.push(['Notes:', data.notes]);
  }
  
  fields.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 8;
  });
  
  return doc;
};

// Generate PDF for Milling Entry
export const generateMillingPDF = (data) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(20);
  doc.text('Ajmeri Industries', 20, 20);
  doc.setFontSize(14);
  doc.text('Milling Entry Preview', 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 40);
  
  let y = 60;
  
  doc.setFontSize(12);
  doc.text('Input:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Paddy Quantity: ${data.quantity} ${data.unit}`, 20, y);
  y += 15;
  
  doc.setFontSize(12);
  doc.text('Output Products:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  const outputs = [
    ['Rice (55%):', `${data.rice} ${data.unit}`],
    ['Bran (8%):', `${data.bran} ${data.unit}`],
    ['Broken (10%):', `${data.broken} ${data.unit}`],
    ['Rafi (1%):', `${data.rafi} ${data.unit}`],
    ['Husk (20%):', `${data.husk} ${data.unit}`],
    ['Wastage (6%):', `${(parseFloat(data.quantity) * 0.06).toFixed(2)} ${data.unit}`],
  ];
  
  outputs.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 8;
  });
  
  return doc;
};

// Generate PDF for Expense Entry
export const generateExpensePDF = (data) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(20);
  doc.text('Ajmeri Industries', 20, 20);
  doc.setFontSize(14);
  doc.text('Expense Entry Preview', 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 40);
  
  let y = 60;
  
  doc.setFontSize(12);
  doc.text('Expense Details:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  const fields = [
    ['Date:', data.date],
    ['Category:', data.category],
    ['Description:', data.description || '-'],
    ['Amount:', `₹${data.amount}`],
  ];
  
  fields.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 8;
  });
  
  return doc;
};

// Generate PDF for Worker Entry
export const generateWorkerPDF = (data) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(20);
  doc.text('Ajmeri Industries', 20, 20);
  doc.setFontSize(14);
  doc.text('Worker Entry Preview', 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 40);
  
  let y = 60;
  
  doc.setFontSize(12);
  doc.text('Worker Details:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  const fields = [
    ['Name:', data.name],
    ['Role:', data.role],
    ['Phone:', data.phone || '-'],
    ['Address:', data.address || '-'],
    ['Daily Wage:', `₹${data.dailyWage || 0}`],
  ];
  
  fields.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 8;
  });
  
  return doc;
};

// Generate PDF for Sales Entry
export const generateSalesPDF = (data) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(20);
  doc.text('Ajmeri Industries', 20, 20);
  doc.setFontSize(14);
  doc.text('Sales Entry Preview', 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 40);
  
  let y = 60;
  
  doc.setFontSize(12);
  doc.text('Sale Details:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  const fields = [
    ['Date:', data.date],
    ['Buyer:', data.buyerName],
    ['Product:', data.product],
    ['Quantity:', `${data.quantity} ${data.unit}`],
    ['Rate:', `₹${data.rate}/${data.unit}`],
    ['Total Amount:', `₹${(data.quantity * data.rate).toLocaleString()}`],
  ];
  
  if (data.description) {
    fields.push(['Description:', data.description]);
  }
  
  fields.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 8;
  });
  
  return doc;
};
