const mongoose = require('mongoose');

// In-memory storage fallback
const memoryDB = {
  paddyPurchases: [],
  millingProcesses: [],
  expenses: [],
  workers: [],
  sales: [],
  stock: {
    paddy: { quantity: 0, unit: 'Qu', bags: 0 },
    rice: { quantity: 0, unit: 'Qu' },
    bran: { quantity: 0, unit: 'Qu' },
    broken: { quantity: 0, unit: 'Qu' },
    rafi: { quantity: 0, unit: 'Qu' },
    husk: { quantity: 0, unit: 'Qu' }
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ajmeri-rice-mill');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB not available: ${error.message}`);
    console.log('Using in-memory database instead');
    // Don't exit - continue with in-memory storage
    global.memoryDB = memoryDB;
  }
};

module.exports = connectDB;
