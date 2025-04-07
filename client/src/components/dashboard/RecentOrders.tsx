import { Link } from 'wouter';
import { OrderWithDetails } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { formatOrderStatus } from '@/utils/statusUtils';

interface RecentOrdersProps {
  orders: OrderWithDetails[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <Link href="/admin/orders">
          <Button variant="link" size="sm" className="text-primary">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  // Get the first product from order items as the main product to display
                  const firstProduct = order.items?.[0]?.product;
                  
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{`#ORD-${order.id.toString().padStart(4, '0')}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.customer?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {firstProduct?.name || 'Unknown Product'}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge {...formatOrderStatus(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/orders?id=${order.id}`}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
