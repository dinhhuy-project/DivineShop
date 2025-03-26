import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Customer, InsertCustomer } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerForm from '@/components/customers/CustomerForm';
import SearchFilter from '@/components/forms/SearchFilter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Customers() {
  const { toast } = useToast();
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: [searchQuery ? `/api/customers/search/${searchQuery}` : '/api/customers'],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customer: InsertCustomer) => {
      return apiRequest({ method: 'POST', endpoint: 'customers', data: customer });
    },
    onSuccess: () => {
      setIsAddingCustomer(false);
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: 'Success',
        description: 'Customer created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create customer: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCustomer> }) => {
      return apiRequest({ method: 'PUT', endpoint: `customers/${id}`, data });;
    },
    onSuccess: () => {
      setEditingCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update customer: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest({ method: 'DELETE', endpoint: `customers/${id}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete customer: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateCustomer = (data: InsertCustomer) => {
    createCustomerMutation.mutate(data);
  };

  const handleUpdateCustomer = (data: Partial<InsertCustomer>) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data });
    }
  };

  const handleDeleteCustomer = (id: number) => {
    deleteCustomerMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer data</p>
        </div>
        <Button onClick={() => setIsAddingCustomer(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <SearchFilter 
        placeholder="Search customers..." 
        onChange={handleSearchChange}
        className="mb-6"
      />

      <CustomerTable 
        customers={customers} 
        isLoading={isLoading}
        onEdit={setEditingCustomer}
        onDelete={handleDeleteCustomer}
      />

      {/* Add Customer Dialog */}
      <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm 
            onSubmit={handleCreateCustomer} 
            onCancel={() => setIsAddingCustomer(false)}
            isPending={createCustomerMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm 
              onSubmit={handleUpdateCustomer} 
              onCancel={() => setEditingCustomer(null)}
              defaultValues={editingCustomer}
              isPending={updateCustomerMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
