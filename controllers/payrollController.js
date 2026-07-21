const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const asyncHandler = require("../utils/asyncHandler");
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

const payslipDir = path.join(__dirname, "..", "uploads", "payslips");
if (!fs.existsSync(payslipDir)) fs.mkdirSync(payslipDir, { recursive: true });

// Generates a simple payslip PDF on disk and returns its relative path.
const generatePayslipPDF = (payroll, employee) =>
  new Promise((resolve, reject) => {
    const fileName = `payslip-${employee.employeeId}-${payroll.month}-${payroll.year}.pdf`;
    const filePath = path.join(payslipDir, fileName);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text("Employee Management System", { align: "center" });
    doc.fontSize(12).text("Payslip", { align: "center" });
    doc.moveDown();
    doc.text(`Employee: ${employee.user.name} (${employee.employeeId})`);
    doc.text(`Period: ${payroll.month}/${payroll.year}`);
    doc.moveDown();
    doc.text(`Basic Salary: ₹${payroll.basic}`);
    doc.text(`Allowances: ₹${payroll.allowances}`);
    doc.text(`Bonus: ₹${payroll.bonus}`);
    doc.text(`Deductions: ₹${payroll.deductions}`);
    doc.moveDown();
    doc.fontSize(14).text(`Net Salary: ₹${payroll.netSalary}`, { underline: true });
    doc.end();

    stream.on("finish", () => resolve(`/uploads/payslips/${fileName}`));
    stream.on("error", reject);
  });

// @desc   Generate a payslip for an employee for a given month/year
// @route  POST /api/payroll
// @access Admin, HR
const createPayroll = asyncHandler(async (req, res) => {
  const { employee: employeeId, month, year, basic, allowances = 0, deductions = 0, bonus = 0 } = req.body;

  const employee = await Employee.findById(employeeId).populate("user", "name email");
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const existing = await Payroll.findOne({ employee: employeeId, month, year });
  if (existing) {
    res.status(400);
    throw new Error("A payslip for this employee and period already exists");
  }

  const netSalary = Number(basic) + Number(allowances) + Number(bonus) - Number(deductions);

  const payroll = await Payroll.create({
    employee: employeeId,
    month,
    year,
    basic,
    allowances,
    deductions,
    bonus,
    netSalary,
  });

  payroll.payslipPath = await generatePayslipPDF(payroll, employee);
  await payroll.save();

  await Notification.create({
    user: employee.user._id,
    message: `Your payslip for ${month}/${year} is ready`,
    type: "success",
    link: "/payroll",
  });

  res.status(201).json({ success: true, data: payroll });
});

// @desc   Get the logged-in employee's own payslips
// @route  GET /api/payroll/me
// @access Employee (self)
const getMyPayroll = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const records = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });
  res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc   Get all payroll records (optionally filter by employee/month/year)
// @route  GET /api/payroll
// @access Admin, HR
const getPayrolls = asyncHandler(async (req, res) => {
  const { employee, month, year } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (month) query.month = Number(month);
  if (year) query.year = Number(year);

  const records = await Payroll.find(query)
    .populate({ path: "employee", populate: { path: "user", select: "name email" } })
    .sort({ year: -1, month: -1 });

  res.status(200).json({ success: true, count: records.length, data: records });
});

module.exports = { createPayroll, getMyPayroll, getPayrolls };
