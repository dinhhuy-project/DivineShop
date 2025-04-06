import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, Users, ShoppingCart, 
  BarChart2, Settings, LogOut, 
  PackageIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  isOpen: boolean;
  closeMobileSidebar: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  toggleSidebar, 
  isMobile,
  isOpen,
  closeMobileSidebar
}: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/admin/products', label: 'Products', icon: <PackageIcon size={20} /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { path: '/admin/reports', label: 'Reports', icon: <BarChart2 size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
    : `hidden md:block bg-white shadow-md h-full z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-32' : 'w-64'}`;

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white">
              <PackageIcon size={20} />
            </div>
            {!isCollapsed && <h1 className="text-lg font-semibold text-gray-900 no-wrap" >DivineShop CRM</h1>}
          </div>
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-primary p-1 rounded"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
          {isMobile && (
            <button 
              onClick={closeMobileSidebar}
              className="text-gray-500 hover:text-primary p-1 rounded"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
        
        <nav className="flex-grow overflow-y-auto py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link href={item.path}>
                  <div 
                    className={`flex items-center px-4 py-3 hover:bg-neutral-100 rounded-r-full cursor-pointer
                      ${location === item.path ? 'text-primary font-medium bg-primary/10 border-l-4 border-primary' : 'text-gray-700 hover:text-primary'}`}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                  >
                    <span className="w-6">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
