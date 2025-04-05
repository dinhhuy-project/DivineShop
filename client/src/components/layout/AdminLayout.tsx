import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, Users, ShoppingCart, 
  BarChart2, Settings, LogOut, 
  PackageIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, HelpCircle, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        isOpen={mobileSidebarOpen}
        closeMobileSidebar={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-neutral-bg transition-all duration-300 ease-in-out ${!isMobile && !sidebarCollapsed ? 'ml-16' : !isMobile && sidebarCollapsed ? 'ml-16' : ''
        }`}>
        <Header toggleMobileSidebar={toggleMobileSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export function Header({ toggleMobileSidebar }: HeaderProps) {
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">3</span>
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  isOpen: boolean;
  closeMobileSidebar: () => void;
}

export function Sidebar({ 
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