import { jsPDF } from 'jspdf';

// Helper function to add professional header
const addHeader = (doc, title, subtitle) => {
  // Company name with bold
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // Blue color
  doc.text('Ajmeri Industries', 105, 20, { align: 'center' });
  
  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Rice Mill Management System', 105, 28, { align: 'center' });
  
  // Divider line
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);
  
  // Report title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, 105, 42, { align: 'center' });
  
  // Subtitle if provided
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(subtitle, 105, 50, { align: 'center' });
  }
  
  // Date and time
  const now = new Date();
  const dateTime = `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(dateTime, 105, 58, { align: 'center' });
  
  return 65; // Return starting Y position
};

// Helper function to add footer
const addFooter = (doc, totalPages) => {
  const pageCount = totalPages || 1;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Page 1 of ${pageCount}`, 105, 290, { align: 'center' });
  doc.text('© Ajmeri Industries - All Rights Reserved', 105, 295, { align: 'center' });
};

// Generate PDF for Paddy Entry
export const generatePaddyPDF = (data) => {
  const doc = new jsPDF();
  
  // Add professional header
  let y = addHeader(doc, 'Government Paddy', 'Add Government Paddy Purchase Record');
  
  // Create a styled box for details
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 180, 3, 3, 'FD');
  
  y += 10;
  
  // Section title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Entry Details', 20, y);
  y += 8;
  
  // Divider
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 8;
  
  // Data fields with better formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const fields = [
    ['Date:', data.date],
    ['Source/Farmer:', data.farmerName || data.source],
    ['New Bags:', `${data.newQuantity || 0} Bag`],
    ['Old Bags:', `${data.oldQuantity || 0} Bag`],
    ['Total Bags:', `${(parseFloat(data.newQuantity) + parseFloat(data.oldQuantity)).toFixed(2)} Qu`],
    ['Total Quintal:', `${data.totalQuintal || ((parseFloat(data.newQuantity) + parseFloat(data.oldQuantity)) / 2.5).toFixed(2)} Qu`],
    ['Rice Mill Hamali:', `₹${data.riceMillHamali || 0}`],
    ['Warehouse Hamali:', `₹${data.warehouseHamali || 0}`],
    ['Total Hamali:', `₹${(parseFloat(data.riceMillHamali) + parseFloat(data.warehouseHamali)).toFixed(2)}`],
  ];
  
  fields.forEach(([label, value]) => {
    // Label in bold
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(label, 25, y);
    
    // Value in normal
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(value, 75, y);
    
    y += 8;
  });
  
  // Description if exists
  if (data.description) {
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Description:', 25, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(data.description, 160);
    doc.text(descLines, 25, y);
  }
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

// Generate PDF for Purchase Entry
export const generatePurchasePDF = (data, type) => {
  const doc = new jsPDF();
  
  // Add professional header
  const title = type === 'paddy' ? 'Paddy Purchase' : 'Rice Purchase';
  const subtitle = `Purchase ${type === 'paddy' ? 'Paddy' : 'Rice'} Record`;
  let y = addHeader(doc, title, subtitle);
  
  // Create a styled box for details
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  const boxHeight = type === 'paddy' ? 160 : 130;
  doc.roundedRect(15, y, 180, boxHeight, 3, 3, 'FD');
  
  y += 10;
  
  // Section title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Purchase Details', 20, y);
  y += 8;
  
  // Divider
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 8;
  
  // Data fields with better formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
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
  
  fields.forEach(([label, value]) => {
    // Label in bold
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(label, 25, y);
    
    // Value in normal
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(value, 75, y);
    
    y += 8;
  });
  
  // Notes if exists
  if (data.notes) {
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Notes:', 25, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(data.notes, 160);
    doc.text(noteLines, 25, y);
  }
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

// Generate PDF for Milling Entry
export const generateMillingPDF = (data) => {
  const doc = new jsPDF();
  
  // Add professional header
  let y = addHeader(doc, 'Milling Entry', 'Paddy to Rice Processing Record');
  
  // Create styled boxes
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  
  // Input box
  doc.roundedRect(15, y, 180, 35, 3, 3, 'FD');
  y += 8;
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Input Paddy', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Quantity: ${data.quantity} ${data.unit}`, 25, y);
  
  y += 25;
  
  // Output box
  doc.roundedRect(15, y, 180, 150, 3, 3, 'FD');
  y += 8;
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Output Products', 20, y);
  y += 8;
  
  // Divider
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 8;
  
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
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(label, 25, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(value, 75, y);
    
    y += 8;
  });
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

// Generate PDF for Expense Entry
export const generateExpensePDF = (data) => {
  const doc = new jsPDF();
  
  // Add professional header
  let y = addHeader(doc, 'Expense Entry', 'Record Business Expenses');
  
  // Create a styled box for details
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 120, 3, 3, 'FD');
  
  y += 10;
  
  // Section title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Expense Details', 20, y);
  y += 8;
  
  // Divider
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 8;
  
  // Data fields with better formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const fields = [
    ['Date:', data.date],
    ['Category:', data.category],
    ['Description:', data.description || '-'],
    ['Amount:', `₹${data.amount}`],
  ];
  
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(label, 25, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(value, 75, y);
    
    y += 8;
  });
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

// Generate PDF for Worker Entry
export const generateWorkerPDF = (data) => {
  const doc = new jsPDF();
  
  // Add professional header
  let y = addHeader(doc, 'Worker Entry', 'Add New Worker Record');
  
  // Create a styled box for details
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 130, 3, 3, 'FD');
  
  y += 10;
  
  // Section title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Worker Details', 20, y);
  y += 8;
  
  // Divider
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 8;
  
  // Data fields with better formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const fields = [
    ['Name:', data.name],
    ['Role:', data.role],
    ['Phone:', data.phone || '-'],
    ['Address:', data.address || '-'],
    ['Daily Wage:', `₹${data.dailyWage || 0}`],
  ];
  
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(label, 25, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(value, 75, y);
    
    y += 8;
  });
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

// Generate PDF for Sales Entry
export const generateSalesPDF = (data) => {
  const doc = new jsPDF();
  
  // Add professional header
  let y = addHeader(doc, 'Sales Entry', 'Record Product Sale');
  
  // Create a styled box for details
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  const boxHeight = data.description ? 160 : 130;
  doc.roundedRect(15, y, 180, boxHeight, 3, 3, 'FD');
  
  y += 10;
  
  // Section title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Sale Details', 20, y);
  y += 8;
  
  // Divider
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 8;
  
  // Data fields with better formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const fields = [
    ['Date:', data.date],
    ['Buyer:', data.buyerName],
    ['Product:', data.product],
    ['Quantity:', `${data.quantity} ${data.unit}`],
    ['Rate:', `₹${data.rate}/${data.unit}`],
    ['Total Amount:', `₹${(data.quantity * data.rate).toLocaleString()}`],
  ];
  
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(label, 25, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(value, 75, y);
    
    y += 8;
  });
  
  // Description if exists
  if (data.description) {
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Description:', 25, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(data.description, 160);
    doc.text(descLines, 25, y);
  }
  
  // Add footer
  addFooter(doc);
  
  return doc;
};
