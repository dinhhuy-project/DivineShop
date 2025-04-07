import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { items, totalItems, subtotal, removeItem, updateQuantity } = useCart();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/shop/login?redirect=/shop/checkout');
    } else {
      navigate('/shop/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/shop">
              <span className="text-2xl font-bold text-primary">DivineShop</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative mr-2">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <CartItems
                  items={items}
                  removeItem={removeItem}
                  updateQuantity={updateQuantity}
                  subtotal={subtotal}
                  onCheckout={handleCheckout}
                />
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/shop">
              <span className="text-gray-700 hover:text-primary transition-colors">Home</span>
            </Link>
            <Link href="/shop/products/game">
              <span className="text-gray-700 hover:text-primary transition-colors">Games</span>
            </Link>
            <Link href="/shop/products/software">
              <span className="text-gray-700 hover:text-primary transition-colors">Software</span>
            </Link>
            <Link href="/shop/products/utility">
              <span className="text-gray-700 hover:text-primary transition-colors">Utilities</span>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <CartItems
                  items={items}
                  removeItem={removeItem}
                  updateQuantity={updateQuantity}
                  subtotal={subtotal}
                  onCheckout={handleCheckout}
                />
              </SheetContent>
            </Sheet>

            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user?.username}
                  </div>
                  <Link href="/shop/orders">
                    <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/shop/login">
                <span className="text-gray-700 hover:text-primary transition-colors">Sign In</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-3 space-y-1">
              <Link href="/shop">
                <span className="block py-2 text-gray-700 hover:text-primary transition-colors">
                  Home
                </span>
              </Link>
              <Link href="/shop/products/game">
                <span className="block py-2 text-gray-700 hover:text-primary transition-colors">
                  Games
                </span>
              </Link>
              <Link href="/shop/products/software">
                <span className="block py-2 text-gray-700 hover:text-primary transition-colors">
                  Software
                </span>
              </Link>
              <Link href="/shop/products/utility">
                <span className="block py-2 text-gray-700 hover:text-primary transition-colors">
                  Utilities
                </span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/shop/orders">
                    <span className="block py-2 text-gray-700 hover:text-primary transition-colors">
                      My Orders
                    </span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/shop/login">
                  <span className="block py-2 text-gray-700 hover:text-primary transition-colors">
                    Sign In
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">DivineShop</h3>
              <p className="text-gray-300">
                Your one-stop shop for digital games, software, and utilities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop">
                    <span className="text-gray-300 hover:text-white transition-colors">Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop/products/game">
                    <span className="text-gray-300 hover:text-white transition-colors">Games</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop/products/software">
                    <span className="text-gray-300 hover:text-white transition-colors">Software</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop/products/utility">
                    <span className="text-gray-300 hover:text-white transition-colors">Utilities</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Email: support@DivineShop.com<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} DivineShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Cart items component for the side sheet
function CartItems({ 
  items, 
  removeItem, 
  updateQuantity, 
  subtotal, 
  onCheckout 
}: { 
  items: ReturnType<typeof useCart>['items']; 
  removeItem: (id: number) => void; 
  updateQuantity: (id: number, quantity: number) => void; 
  subtotal: number; 
  onCheckout: () => void; 
}) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Your Cart ({items.length})</SheetTitle>
        <SheetDescription>
          {items.length > 0 ? 'Review your items before checkout' : 'Your cart is empty'}
        </SheetDescription>
      </SheetHeader>
      
      <div className="my-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.product.id} className="flex items-center space-x-4 py-2 border-b">
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={() => removeItem(item.product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        )}
      </div>
      
      {items.length > 0 && (
        <SheetFooter className="flex-col">
          <div className="flex justify-between items-center py-2 border-t">
            <span className="font-medium">Subtotal:</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <Button onClick={onCheckout} className="w-full mt-4">
            Proceed to Checkout
          </Button>
        </SheetFooter>
      )}
    </>
  );
}