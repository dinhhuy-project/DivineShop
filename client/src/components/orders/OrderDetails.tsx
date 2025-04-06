import { OrderWithDetails } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatOrderStatus } from '@/utils/statusUtils';

interface OrderDetailsProps {
  order?: OrderWithDetails;
  isLoading: boolean;
  onUpdateStatus: (status: string) => void;
  isPending: boolean;
}

export default function OrderDetails({ 
  order, 
  isLoading, 
  onUpdateStatus, 
  isPending 
}: OrderDetailsProps) {
  
  // Format the order ID to have leading zeros
  const formatOrderId = (id: number) => {
    return `#ORD-${id.toString().padStart(4, '0')}`;
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-60" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">Order details not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{formatOrderId(order.id)}</h3>
          <p className="text-sm text-gray-500">{formatOrderDate(order.orderDate)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select 
            defaultValue={order.status} 
            onValueChange={onUpdateStatus}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
        <div>
          <p className="text-sm font-medium">Status</p>
          <Badge {...formatOrderStatus(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium">Total</p>
          <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Name:</p>
            <p className="text-sm">{order.customer.name}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm">{order.customer.email}</p>
          </div>
          {order.customer.phone && (
            <div className="flex justify-between">
              <p className="text-sm font-medium">Phone:</p>
              <p className="text-sm">{order.customer.phone}</p>
            </div>
          )}
          {order.customer.address && (
            <div className="flex justify-between">
              <p className="text-sm font-medium">Address:</p>
              <p className="text-sm">{order.customer.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                    {item.product.category === 'game' ? (
                      <Gamepad className="h-5 w-5 text-primary" />
                    ) : item.product.category === 'software' ? (
                      <WindowIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <Tool className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.category.charAt(0).toUpperCase() + item.product.category.slice(1)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50">
          <p className="font-semibold">Total</p>
          <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Icons used in the component
function Gamepad(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="6" y1="12" x2="10" y2="12"></line>
      <line x1="8" y1="10" x2="8" y2="14"></line>
      <line x1="15" y1="13" x2="15.01" y2="13"></line>
      <line x1="18" y1="11" x2="18.01" y2="11"></line>
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>
  );
}

function WindowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      <path d="M12 4v16"></path>
      <path d="M2 12h20"></path>
    </svg>
  );
}

function Tool(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  );
}
