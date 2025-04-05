import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Customers from "@/pages/admin/Customers";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import Login from "@/pages/admin/Login";
import Signup from "@/pages/admin/Signup";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Admin } from "mongodb";
import { sign } from "crypto";
import { useEffect } from "react";

function AppRouter() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/admin/dashboard");
  }, [setLocation])

  return null;
}

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/signup" component={Signup} />

      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/customers">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Customers />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/products">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Products />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/orders">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/reports">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Reports />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <AdminRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
