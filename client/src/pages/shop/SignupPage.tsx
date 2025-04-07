import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
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
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
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
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      // Sign up
      const signupRes = await apiRequest({
        method: 'POST',
        endpoint: '/auth/signup',
        data: {
          username: data.username,
          password: data.password,
          role: 'customer',
          name: data.email,
          id: Date.now(),
          avatar: null // Ensure avatar is either a string or null
        },
      });
      
      if (!signupRes.success) {
        const error = signupRes.error || { message: 'Unknown error occurred' };
        throw new Error(error.message || 'Failed to create account');
      }
      
      // Log in after successful signup
      const loginResult = await login(data.username, data.password, 'customer');
      
      if (loginResult.success) {
        toast({
          title: 'Account Created!',
          description: 'Your account has been created successfully.',
        });
        navigate(redirectUrl);
      } else {
        toast({
          title: 'Account Created',
          description: 'Your account has been created. Please log in.',
        });
        navigate('/shop/login');
      }
    } catch (error) {
      toast({
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
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
          <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
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
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/shop/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}