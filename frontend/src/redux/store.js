import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import employeeReducer from './slices/employeeSlice'
import departmentReducer from './slices/departmentSlice'
import attendanceReducer from './slices/attendanceSlice'
import leaveReducer from './slices/leaveSlice'
import taskReducer from './slices/taskSlice'
import payrollReducer from './slices/payrollSlice'
import documentReducer from './slices/documentSlice'
import notificationReducer from './slices/notificationSlice'
import performanceReducer from './slices/performanceSlice'
import analyticsReducer from './slices/analyticsSlice'
import productivityReducer from './slices/productivitySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    departments: departmentReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    tasks: taskReducer,
    payroll: payrollReducer,
    documents: documentReducer,
    notifications: notificationReducer,
    performance: performanceReducer,
    analytics: analyticsReducer,
    productivity: productivityReducer,
  },
})
