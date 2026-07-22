// One-time helper: creates a default admin account (and a department + one
// sample employee) so you can log in and explore every module immediately,
// without manually editing the database.
//
// Run with: npm run seed

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Employee = require("./models/Employee");
const Department = require("./models/Department");
const generateEmployeeId = require("./utils/generateEmployeeId");

const run = async () => {
  await connectDB();

  const adminEmail = "admin@ems.com";
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      password: "admin123",
      role: "admin",
    });
    console.log(`Created admin account -> email: ${adminEmail} / password: admin123`);
  } else {
    console.log(`Admin account already exists (${adminEmail}) — skipping creation.`);
  }

  let department = await Department.findOne({ name: "Engineering" });
  if (!department) {
    department = await Department.create({
      name: "Engineering",
      description: "Builds and maintains the product",
    });
    console.log("Created sample department: Engineering");
  }

  const sampleEmail = "employee@ems.com";
  let sampleUser = await User.findOne({ email: sampleEmail });
  if (!sampleUser) {
    sampleUser = await User.create({
      name: "Sample Employee",
      email: sampleEmail,
      password: "employee123",
      role: "employee",
    });

    const employeeId = await generateEmployeeId();
    await Employee.create({
      user: sampleUser._id,
      employeeId,
      department: department._id,
      designation: "Software Engineer",
      salary: { basic: 50000, allowances: 5000, deductions: 2000 },
    });
    console.log(`Created sample employee -> email: ${sampleEmail} / password: employee123`);
  } else {
    console.log(`Sample employee already exists (${sampleEmail}) — skipping creation.`);
  }

  console.log("\nSeed complete. You can log in with either account above.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
