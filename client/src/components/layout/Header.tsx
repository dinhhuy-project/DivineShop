import { Bell, Search, HelpCircle, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { OrderWithDetails } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/badge';
import { formatOrderStatus } from '@/utils/statusUtils';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

// Format the order date
const formatOrderDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders/recent/5'],
  });

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-4"
            onClick={toggleMobileSidebar}
          >
            <Menu size={20} />
          </Button>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div
            className="relative"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell size={20} />
              {isLoadingOrders ? (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full text-white text-xs flex items-center justify-center"></span>
              ) : (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"></span>
              )}
            </Button>
            {showNotifications && (
              <div className="absolute right-0 w-64 bg-white shadow-lg rounded-md overflow-hidden" onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}>
                <ul className="divide-y divide-gray-200">
                  {recentOrders?.map(order => (
                    <li key={order.id} className="p-2 hover:bg-gray-100">
                      <div className="text-sm font-medium mb-2 mt-2">
                        <span>
                          {`#ORD-${order.id.toString().padStart(4, '0')} `}
                        </span>
                        <Badge {...formatOrderStatus(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{formatOrderDate(order.orderDate)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon">
            <HelpCircle size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
