import React from 'react';
import { Link } from 'wouter';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  // Helper function to generate badge color based on category
  const getCategoryBadge = (category: string) => {
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

  return (
    <Link href={`/shop/product/${product.id}`}>
      <a className="group block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col">
            <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
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
          <div className="p-4 flex-grow flex flex-col">
            <div className="mb-2">{getCategoryBadge(product.category)}</div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || 'No description available'}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
              <Button
                size="sm"
                variant="outline"
                className="group-hover:bg-primary group-hover:text-white transition-colors"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}