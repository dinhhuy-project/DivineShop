import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import ShopLayout from '@/components/shop/ShopLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [isPending, setIsPending] = React.useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get redirect URL from query params
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect') || '/shop';
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      const result = await login(data.username, data.password, "customer");
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        navigate(redirectUrl);
      } else {
        toast({
          title: 'Login Failed',
          description: result.message || 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/shop/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}