import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/admin/not-found";
import AppLayout from "@/components/layout/AppLayout";
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
import { CartProvider } from "@/hooks/use-cart";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// Import shop pages
import HomePage from "@/pages/shop/HomePage";
import ProductListingPage from "@/pages/shop/ProductListingPage";
import ProductDetailsPage from "@/pages/shop/ProductDetailsPage";
import CartPage from "@/pages/shop/CartPage";
import CheckoutPage from "@/pages/shop/CheckoutPage";
import OrderConfirmationPage from "@/pages/shop/OrderConfirmationPage";
import OrderHistoryPage from "@/pages/shop/OrderHistoryPage";
import LoginPage from "@/pages/shop/LoginPage";
import SignupPage from "@/pages/shop/SignupPage";

function Router() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const routeTitles: { [key: string]: string } = {
      "/admin/login": "Admin Login - DivineShop",
      "/admin/signup": "Admin Signup - DivineShop",
      "/admin/dashboard": "Dashboard - DivineShop",
      "/admin/customers": "Customers - DivineShop",
      "/admin/products": "Products - DivineShop",
      "/admin/orders": "Orders - DivineShop",
      "/admin/reports": "Reports - DivineShop",
      "/admin/settings": "Settings - DivineShop",
      "/": "Home - DivineShop",
      "/shop": "Shop - DivineShop",
      "/shop/home": "Shop Home - DivineShop",
      "/shop/cart": "Cart - DivineShop",
      "/shop/checkout": "Checkout - DivineShop",
      "/shop/orders": "Order History - DivineShop",
      "/shop/login": "Login - DivineShop",
      "/shop/signup": "Signup - DivineShop",
      // Add more routes as needed
    };

    document.title = routeTitles[location] || "DivineShop";

    // Auto-logout if non-admin user accesses admin routes
    if (isAuthenticated) {
      if (location.includes("admin") && (!user || user.role !== "admin")) {
        logout();
      }
    }
  }, [location, user, logout]);

  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/signup" component={Signup} />

      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/customers">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Customers />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/products">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Products />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/orders">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Orders />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/reports">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Customer-facing shop routes */}
      <Route path="/">
        <HomePage />
      </Route>

      <Route path="/home">
        <HomePage />
      </Route>

      <Route path="/shop">
        <HomePage />
      </Route>

      <Route path="/shop/home">
        <HomePage />
      </Route>


      <Route path="/shop/products/:category">
        <ProductListingPage />
      </Route>

      <Route path="/shop/product/:id">
        <ProductDetailsPage />
      </Route>

      <Route path="/shop/cart">
        <CartPage />
      </Route>

      <Route path="/shop/checkout">
        <CheckoutPage />
      </Route>

      <Route path="/shop/order-confirmation/:id">
        <OrderConfirmationPage />
      </Route>

      <Route path="/shop/orders">
        <OrderHistoryPage />
      </Route>

      <Route path="/shop/login">
        <LoginPage />
      </Route>

      <Route path="/shop/signup">
        <SignupPage />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
