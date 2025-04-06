import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { OrderWithDetails } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function OrderConfirmationPage() {
  const [, params] = useRoute('/shop/order-confirmation/:id');
  const orderId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  
  const { 
    data: order, 
    isLoading, 
    error 
  } = useQuery<OrderWithDetails>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load order details. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading your order details...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-3xl mx-auto py-16">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <p className="mb-6 text-muted-foreground">
              We couldn't find the order you're looking for. It may have been removed or the ID is invalid.
            </p>
            <Button asChild>
              <Link href="/shop">Return to Shop</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderDate = order.orderDate instanceof Date 
    ? order.orderDate 
    : new Date(order.orderDate);

  return (
    <div className="container max-w-3xl mx-auto py-12">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-muted-foreground">
          Your order has been confirmed and is being processed.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Order #{order.id}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {format(orderDate, 'MMM d, yyyy')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Order Status</h3>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Customer Information</h3>
              <div className="text-sm">
                <p className="font-medium">{order.customer.name}</p>
                <p>{order.customer.email}</p>
                <p>{order.customer.phone || 'No phone provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-between">
          <span>Total</span>
          <span className="font-bold">${order.total.toFixed(2)}</span>
        </CardFooter>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop/orders">View All Orders</Link>
        </Button>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          If you have any questions about your order, please contact our support team.
        </p>
        <div className="mt-2 flex justify-center items-center">
          <ShoppingBag className="h-4 w-4 mr-1" />
          <span>Thank you for shopping with us!</span>
        </div>
      </div>
    </div>
  );
}