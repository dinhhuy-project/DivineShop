import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    newCustomers: true,
    lowStock: false,
  });

  const [userSettings, setUserSettings] = useState({
    name: 'Alex Johnson',
    email: 'alex@DivineShop.com',
    role: 'Administrator',
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: 'DivineShop Solutions',
    website: 'www.DivineShop.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Lane, Silicon Valley, CA 94025',
  });

  const handleSaveNotifications = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  const handleSaveUserSettings = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated.',
    });
  };

  const handleSaveCompanySettings = () => {
    toast({
      title: 'Company Settings Updated',
      description: 'Company information has been updated successfully.',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={userSettings.name} 
                  onChange={e => setUserSettings({...userSettings, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={userSettings.email} 
                  onChange={e => setUserSettings({...userSettings, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={userSettings.role} 
                  disabled 
                />
                <p className="text-sm text-gray-500">Your role can only be changed by a system administrator.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveUserSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  value={companySettings.companyName} 
                  onChange={e => setCompanySettings({...companySettings, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={companySettings.website} 
                  onChange={e => setCompanySettings({...companySettings, website: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={companySettings.phone} 
                  onChange={e => setCompanySettings({...companySettings, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={companySettings.address} 
                  onChange={e => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveCompanySettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email updates about your account.</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={checked => setNotifications({...notifications, email: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-gray-500">Get notified when order status changes.</p>
                </div>
                <Switch 
                  checked={notifications.orders} 
                  onCheckedChange={checked => setNotifications({...notifications, orders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">New Customer Alerts</p>
                  <p className="text-sm text-gray-500">Get notified when new customers register.</p>
                </div>
                <Switch 
                  checked={notifications.newCustomers} 
                  onCheckedChange={checked => setNotifications({...notifications, newCustomers: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Low Stock Warnings</p>
                  <p className="text-sm text-gray-500">Get notified when product stock is running low.</p>
                </div>
                <Switch 
                  checked={notifications.lowStock} 
                  onCheckedChange={checked => setNotifications({...notifications, lowStock: checked})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
