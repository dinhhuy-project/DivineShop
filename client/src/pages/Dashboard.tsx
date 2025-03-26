import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import MetricsOverview from '@/components/dashboard/MetricsOverview';
import RecentOrders from '@/components/dashboard/RecentOrders';
import ProductCategories from '@/components/dashboard/ProductCategories';
import CustomerActivity from '@/components/dashboard/CustomerActivity';
import { DashboardMetrics, ProductCategoryStat, PopularProduct, OrderWithDetails, Activity, Customer } from '@shared/schema';

export default function Dashboard() {
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
  });

  const { data: categoryStats, isLoading: isLoadingStats } = useQuery<ProductCategoryStat[]>({
    queryKey: ['/api/dashboard/category-stats'],
  });

  const { data: popularProducts, isLoading: isLoadingPopular } = useQuery<PopularProduct[]>({
    queryKey: ['/api/dashboard/popular-products/3'],
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders/recent/5'],
  });

  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery<(Activity & { customer: Customer })[]>({
    queryKey: ['/api/activities/recent/5'],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Alex. Here's what's happening today.</p>
      </div>

      {isLoadingMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <MetricsOverview metrics={metrics} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoadingOrders ? (
            <div className="bg-white rounded-lg shadow p-4">
              <Skeleton className="h-6 w-1/4 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <RecentOrders orders={recentOrders || []} />
          )}
        </div>

        <div>
          {(isLoadingStats || isLoadingPopular) ? (
            <div className="bg-white rounded-lg shadow p-4">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-6 w-1/3 my-6" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ProductCategories 
              categoryStats={categoryStats || []}
              popularProducts={popularProducts || []}
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        {isLoadingActivities ? (
          <div className="bg-white rounded-lg shadow p-4">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CustomerActivity activities={recentActivities || []} />
        )}
      </div>
    </div>
  );
}
