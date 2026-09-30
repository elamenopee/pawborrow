import type {
  ComponentType,
} from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./router/ProtectedRoute";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Bookings from "./pages/Bookings";
import Pets from "./pages/Pets";
import Order from "./pages/Order";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";

import "./global.css";

const DashboardRoute =
  Dashboard as unknown as ComponentType;

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Access Denied
        </h1>

        <p className="mt-2 text-gray-500">
          You do not have permission to
          access the admin dashboard.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={<DashboardRoute />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="bookings"
            element={<Bookings />}
          />

          <Route
            path="pets"
            element={<Pets />}
          />

          <Route
            path="order"
            element={<Order />}
          />

          <Route
            path="reviews"
            element={<Reviews />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;