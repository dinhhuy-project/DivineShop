// Helper functions to format order status

type StatusVariantType = {
  variant: "outline" | "default";
  className: string;
};

export const formatOrderStatus = (status: string): StatusVariantType => {
  switch (status) {
    case 'pending':
      return {
        variant: 'outline',
        className: 'bg-gray-200/50 text-gray-800 border-gray-300'
      };
    case 'processing':
      return {
        variant: 'outline',
        className: 'bg-amber-500/10 text-amber-600 border-amber-200'
      };
    case 'completed':
      return {
        variant: 'outline',
        className: 'bg-green-600/10 text-green-600 border-green-200'
      };
    case 'failed':
      return {
        variant: 'outline',
        className: 'bg-red-600/10 text-red-600 border-red-200'
      };
    case 'cancelled':
      return {
        variant: 'outline',
        className: 'bg-purple-500/10 text-purple-500 border-purple-200'
      };
    default:
      return {
        variant: 'outline',
        className: 'bg-gray-200/50 text-gray-800 border-gray-300'
      };
  }
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'text-gray-800';
    case 'processing':
      return 'text-amber-600';
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'cancelled':
      return 'text-purple-500';
    default:
      return 'text-gray-800';
  }
};
