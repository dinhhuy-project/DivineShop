import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Order, OrderWithDetails } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import OrderTable from '@/components/orders/OrderTable';
import OrderDetails from '@/components/orders/OrderDetails';
import SearchFilter from '@/components/forms/SearchFilter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Orders() {
  const { toast } = useToast();
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery<OrderWithDetails>({
    queryKey: ['/api/orders', viewingOrderId],
    enabled: viewingOrderId !== null,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PUT', `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      if (viewingOrderId) {
        queryClient.invalidateQueries({ queryKey: ['/api/orders', viewingOrderId] });
      }
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update order status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };

  const filteredOrders = orders.filter(order => {
    let statusMatch = true;
    if (statusFilter !== 'all') {
      statusMatch = order.status === statusFilter;
    }
    
    let searchMatch = true;
    if (searchQuery) {
      // Here we're just searching by ID as a string
      searchMatch = order.id.toString().includes(searchQuery);
    }
    
    return statusMatch && searchMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchFilter 
          placeholder="Search by order ID..." 
          onChange={handleSearchChange}
          className="w-full md:w-80"
        />
        
        <Tabs 
          value={statusFilter} 
          onValueChange={setStatusFilter}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-5 sm:w-[500px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <OrderTable 
        orders={filteredOrders} 
        isLoading={isLoading}
        onView={setViewingOrderId}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Order Details Dialog */}
      <Dialog open={viewingOrderId !== null} onOpenChange={(open) => !open && setViewingOrderId(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewingOrderId && (
            <OrderDetails 
              order={orderDetails} 
              isLoading={isLoadingDetails}
              onUpdateStatus={(status) => {
                if (viewingOrderId) {
                  handleUpdateStatus(viewingOrderId, status);
                }
              }}
              isPending={updateOrderStatusMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
