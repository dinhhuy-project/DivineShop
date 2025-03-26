import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Product, InsertProduct } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ProductTable from '@/components/products/ProductTable';
import ProductForm from '@/components/products/ProductForm';
import SearchFilter from '@/components/forms/SearchFilter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Products() {
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: [
      searchQuery 
        ? `/api/products/search/${searchQuery}` 
        : activeCategory !== 'all'
          ? `/api/products/category/${activeCategory}`
          : '/api/products'
    ],
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      return apiRequest({ method: 'POST', endpoint: 'products', data: product }); // No need for res.json()
      // console.log('product', product);
      // const res = await apiRequest({ method: 'POST', endpoint: 'products', data: product });
      // return res.json();
    },
    onSuccess: () => {
      setIsAddingProduct(false);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.log('error', error);
      toast({
        title: 'Error',
        description: `Failed to create product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      return apiRequest({ method: 'PUT', endpoint: `products/${id}`, data }); // No need for res.json()
    },
    onSuccess: () => {
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest({ method: 'DELETE', endpoint: `products/${id}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setActiveCategory('all');
  };

  const handleCreateProduct = (data: InsertProduct) => {
    createProductMutation.mutate(data);
  };

  const handleUpdateProduct = (data: Partial<InsertProduct>) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleDeleteProduct = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Button onClick={() => setIsAddingProduct(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchFilter 
          placeholder="Search products..." 
          onChange={handleSearchChange}
          className="w-full md:w-80"
        />
        
        <Tabs 
          value={activeCategory} 
          onValueChange={setActiveCategory}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-4 sm:w-[400px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="game">Games</TabsTrigger>
            <TabsTrigger value="software">Software</TabsTrigger>
            <TabsTrigger value="utility">Utilities</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ProductTable 
        products={products} 
        isLoading={isLoading}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Add Product Dialog */}
      <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            onSubmit={handleCreateProduct} 
            onCancel={() => setIsAddingProduct(false)}
            isPending={createProductMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm 
              onSubmit={handleUpdateProduct} 
              onCancel={() => setEditingProduct(null)}
              defaultValues={editingProduct}
              isPending={updateProductMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
