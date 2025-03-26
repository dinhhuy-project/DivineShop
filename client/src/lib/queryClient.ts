import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest({ 
  endpoint, 
  method = 'GET', 
  data 
}: { 
  endpoint: string; 
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; 
  data?: unknown;
}) {
  try {
    const url = endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;
    console.log('url', url);
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Parse the JSON response
    const responseData = await res.json();
    
    // If response is not ok, and we don't have a success status
    // in the response, throw an error
    if (!res.ok && responseData.success !== true) {
      throw new Error(responseData.message || `Request failed with status ${res.status}`);
    }
    
    // Return the parsed response data
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
