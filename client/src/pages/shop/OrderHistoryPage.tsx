import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Order } from '@shared/schema';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import ShopLayout from '@/components/shop/ShopLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { FileText, ArrowRight, ExternalLink } from 'lucide-react';

export default function OrderHistoryPage() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/shop/login?redirect=/shop/orders');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch user orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/customer/${user?.id}`],
    enabled: isAuthenticated && !!user,
  });
  
  // Helper function to format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (!isAuthenticated) {
    return null; // Redirect effect will handle this
  }
  
  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <Skeleton className="h-6 w-32 mb-2 sm:mb-0" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-28 mt-3 sm:mt-0" />
                </div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="mb-2 sm:mb-0">
                    <span className="text-sm text-gray-500">Order #</span>
                    <span className="font-semibold ml-1">{order.id}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4">
                  <div>
                    <p className="font-medium">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <Link href={`/shop/order-confirmation/${order.id}`}>
                    <Button variant="outline" size="sm" className="mt-3 sm:mt-0">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/shop">
              <Button>
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
        
        {/* Digital downloads section */}
        {Array.isArray(orders) && orders.some(order => order.status.toLowerCase() === 'completed') && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">My Digital Products</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ExternalLink className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Access Your Digital Products</h3>
                  <p className="text-gray-600 mb-4">
                    All your purchased digital products are available for download. You can download them anytime from here.
                  </p>
                  <Link href="/shop/downloads">
                    <Button variant="outline">
                      View Downloads
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}