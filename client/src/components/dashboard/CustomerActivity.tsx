import { Activity, Customer } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  ChevronRight, 
  UserPlus, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  Activity as ActivityIcon 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

interface CustomerActivityProps {
  activities: (Activity & { customer: Customer })[];
}

export default function CustomerActivity({ activities }: CustomerActivityProps) {
  // Get the appropriate icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'account_created':
        return <UserPlus className="h-4 w-4" />;
      case 'purchase':
        return <ShoppingCart className="h-4 w-4" />;
      case 'payment_updated':
        return <CreditCard className="h-4 w-4" />;
      case 'order_completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  // Get appropriate color based on activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'account_created':
        return 'bg-primary/10 text-primary';
      case 'purchase':
        return 'bg-blue-500/10 text-blue-500';
      case 'payment_updated':
        return 'bg-amber-500/10 text-amber-500';
      case 'order_completed':
        return 'bg-green-600/10 text-green-600';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Customer Activity</CardTitle>
        <div className="flex space-x-2">
          <Select defaultValue="today">
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/customers">
            <Button variant="link" size="sm" className="text-primary">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {activities.length === 0 ? (
            <li className="py-3 text-center text-sm text-gray-500">
              No recent activity found.
            </li>
          ) : (
            activities.map((activity) => (
              <li key={activity.id} className="py-3 flex items-start">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.customer.name}</span>{' '}
                    {activity.description.replace(activity.customer.name, '')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
