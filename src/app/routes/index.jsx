import { Navigate } from "react-router-dom";
import Login from "../../pages/Login";
import DashboardLayout from "../../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Overview from "../../pages/Overview"; 
import Expenses from "../../pages/Expenses";
import Orders from "../../pages/Orders";
import Patients from "../../pages/Patients";
import Sales from "../../pages/Sales";
import Stocks from "../../pages/Stocks";
import Users from "../../pages/Users";
import Createsale from "../../pages/Createsale";
import Suppliers from "../../pages/Suppliers";
import Customers from "../../pages/Customers";
import Reports from "../../pages/Reports";

export const routes = [
  { path: "/", element: <Login /> },

  {
    element: <ProtectedRoute />, // 🔐 AUTH GATE
    children: [
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
          { path: "createsale", element: <Createsale /> },
          { path: "suppliers", element: <Suppliers /> },
          { path: "customers", element: <Customers /> },
          { path: "reports", element: <Reports /> },
          { path: "users", element: <Users /> },
        ],
      },
    ],
  },
];
