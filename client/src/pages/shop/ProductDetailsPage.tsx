import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { getQueryFn } from '@/lib/queryClient';
import ShopLayout from '@/components/shop/ShopLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function ProductDetailsPage() {
  const [, params] = useRoute('/shop/product/:id');
  const productId = params?.id ? parseInt(params.id) : 0;
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: productId > 0
  });

  // Helper function to generate badge color based on category
  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    switch (category) {
      case 'game':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Game</Badge>;
      case 'software':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Software</Badge>;
      case 'utility':
        return <Badge className="bg-green-500 hover:bg-green-600">Utility</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
    }
  };

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-lg" />
              <div>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <Skeleton className="h-10 w-1/3 mb-4" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (error || !product) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">
              Sorry, we couldn't find the product you're looking for.
            </p>
            <a href="/shop" className="text-primary hover:underline flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </a>
          </div>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <a href="/shop" className="text-primary hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-100 flex items-center justify-center p-4">
            {product.image ? (
              <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl font-bold text-gray-500">
              {product.name.charAt(0)}
              </div>
            )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="mb-4">{getCategoryBadge(product.category)}</div>
              <p className="text-gray-700 mb-6">{product.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Product details and features sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Category</h3>
                <p className="text-gray-700 capitalize">{product.category}</p>
              </div>
              <div>
                <h3 className="font-semibold">License Type</h3>
                <p className="text-gray-700">Single User License</p>
              </div>
              <div>
                <h3 className="font-semibold">Version</h3>
                <p className="text-gray-700">Latest Version</p>
              </div>
              <div>
                <h3 className="font-semibold">Updates</h3>
                <p className="text-gray-700">Free updates for 1 year</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Key Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Instant digital delivery</li>
              <li>24/7 customer support</li>
              <li>Secure download access</li>
              <li>30-day money-back guarantee</li>
              <li>Detailed documentation included</li>
            </ul>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}