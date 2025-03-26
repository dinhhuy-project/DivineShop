import { ProductCategoryStat, PopularProduct } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gamepad, MonitorIcon, Wrench } from 'lucide-react';

interface ProductCategoriesProps {
  categoryStats: ProductCategoryStat[];
  popularProducts: PopularProduct[];
}

export default function ProductCategories({ categoryStats, popularProducts }: ProductCategoriesProps) {
  // Get the appropriate icon based on product category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'game':
        return <Gamepad className="text-primary" />;
      case 'software':
        return <MonitorIcon className="text-secondary" />;
      case 'utility':
        return <Wrench className="text-accent" />;
      default:
        return <Gamepad className="text-primary" />;
    }
  };

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'game':
        return 'bg-primary';
      case 'software':
        return 'bg-secondary';
      case 'utility':
        return 'bg-accent';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Product Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryStats.map((stat) => (
            <div key={stat.category}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {stat.category === 'game' ? 'Games' : stat.category === 'software' ? 'Software' : 'Utilities'}
                </span>
                <span className="text-sm text-gray-600">{stat.percentage}%</span>
              </div>
              <Progress value={stat.percentage} className={`h-2 ${getCategoryColor(stat.category)}`} />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Popular Products</h3>
          <ul className="space-y-3">
            {popularProducts.length === 0 ? (
              <li className="text-sm text-gray-500">No products found.</li>
            ) : (
              popularProducts.map((product) => (
                <li key={product.id} className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
