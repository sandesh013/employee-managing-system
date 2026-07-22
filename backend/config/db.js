const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the URI stored in .env (MONGO_URI).
// Called once from server.js when the app boots.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    // Exit the process — the app can't run without a database connection.
    process.exit(1);
  }
};

module.exports = connectDB;
