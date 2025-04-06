import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { getQueryFn } from '@/lib/queryClient';
import ShopLayout from '@/components/shop/ShopLayout';
import ProductCard from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import SearchFilter from '@/components/forms/SearchFilter';

export default function ProductListingPage() {
  const [, params] = useRoute('/shop/products/:category');
  const category = params?.category || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  // Fetch products based on category
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${category}`],
  });
  
  // Filter products based on search query and price range
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesPrice;
  });

  // Helper function to get category title
  const getCategoryTitle = () => {
    switch (category) {
      case 'game':
        return 'Games';
      case 'software':
        return 'Software';
      case 'utility':
        return 'Utilities';
      default:
        return 'All Products';
    }
  };

  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{getCategoryTitle()}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            {/* Search filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Search</label>
              <SearchFilter
                placeholder="Search products..."
                onChange={setSearchQuery}
                debounceMs={300}
              />
            </div>
            
            {/* Price filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <Slider
                defaultValue={[0, 1000]}
                min={0}
                max={1000}
                step={5}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-4"
              />
              <div className="flex justify-between">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
            
            {/* Category filter - only show if not already filtered by category */}
            {category === 'all' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <a 
                      href="/shop/products/game" 
                      className="text-gray-700 hover:text-primary transition-colors"
                    >
                      Games
                    </a>
                  </div>
                  <div className="flex items-center">
                    <a 
                      href="/shop/products/software" 
                      className="text-gray-700 hover:text-primary transition-colors"
                    >
                      Software
                    </a>
                  </div>
                  <div className="flex items-center">
                    <a 
                      href="/shop/products/utility" 
                      className="text-gray-700 hover:text-primary transition-colors"
                    >
                      Utilities
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Product grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <ProductGridSkeleton />
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}