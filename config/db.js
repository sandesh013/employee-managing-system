const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Connects to MongoDB Atlas using the URI stored in .env (MONGO_URI).
// Called once from server.js when the app boots.
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // We start an in-memory MongoDB server for local dev to avoid needing a local mongo installation
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected (Memory Server): ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    // Exit the process — the app can't run without a database connection.
    process.exit(1);
  }
};

module.exports = connectDB;
