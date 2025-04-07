import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import React from "react";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const [isPending, setIsPending] = React.useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Get redirect URL from query params
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect') || '/admin/dashboard';

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
      const result = await login(data.username, data.password, "admin");
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
    <div className="w-full max-w-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Sign in to access your CRM dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                onClick={() => navigate("/admin/signup")}
                className="font-semibold text-primary cursor-pointer hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}