import { DashboardMetrics } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, HourglassIcon, Crown } from 'lucide-react';

interface MetricsOverviewProps {
  metrics?: DashboardMetrics;
}

export default function MetricsOverview({ metrics }: MetricsOverviewProps) {
  if (!metrics) {
    return null;
  }

  const metricsData = [
    {
      title: 'Total Sales',
      value: `$${metrics.totalSales.toFixed(2)}`,
      icon: <DollarSign className="text-primary" />,
      change: {
        value: 12.5,
        isPositive: true
      }
    },
    {
      title: 'New Customers',
      value: metrics.newCustomers.toString(),
      icon: <Users className="text-primary" />,
      change: {
        value: 8.2,
        isPositive: true
      }
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders.toString(),
      icon: <HourglassIcon className="text-primary" />,
      change: {
        value: 5.3,
        isPositive: false
      }
    },
    {
      title: 'Top Product',
      value: metrics.topProduct.name,
      subvalue: `${metrics.topProduct.unitsSold} units sold`,
      icon: <Crown className="text-primary" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricsData.map((metric, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              {metric.icon}
            </div>
            <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
            {metric.change ? (
              <div className="mt-2 flex items-center text-xs">
                <span className={`flex items-center ${metric.change.isPositive ? 'text-green-600' : 'text-amber-600'}`}>
                  <span className="mr-1">{metric.change.isPositive ? '↑' : '↑'}</span> {metric.change.value}%
                </span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            ) : metric.subvalue ? (
              <div className="mt-2 text-xs text-gray-500">{metric.subvalue}</div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
