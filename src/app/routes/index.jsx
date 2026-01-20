import { Navigate } from 'react-router-dom';
import Login from '../../pages/Login';
import DashboardLayout from '../../layout/DashboardLayout';

// 1. Import your actual page files here
import Overview from '../../pages/Overview';
import Expenses from '../../pages/Expenses';
import Orders from '../../pages/Orders';
import Patients from '../../pages/Patients';
import Sales from '../../pages/Sales';
import Stocks from '../../pages/Stocks';
import Users from '../../pages/Users';

export const routes = [
  { path: "/", element: <Login /> },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard/overview" replace /> },
      { path: "overview", element: <Overview /> },
      { path: "expenses", element: <Expenses /> },
      { path: "orders", element: <Orders /> },
      { path: "patients", element: <Patients /> },
      { path: "sales", element: <Sales /> },
      { path: "stocks", element: <Stocks /> },
      { path: "users", element: <Users /> },
    ],
  },
];