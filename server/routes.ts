import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import type { Session } from "express-session";
import { storage } from "./storage";
import Stripe from "stripe";
import { 
  insertCustomerSchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertActivitySchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { config } from 'dotenv';
// Load environment variables from .env file
config();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function for validation
const validateBody = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid request body", details: error });
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Customer routes
  router.get("/customers", async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  router.get("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  router.post("/customers", validateBody(insertCustomerSchema), async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      
      // Create activity for new customer
      await storage.createActivity({
        customerId: customer.id,
        type: "account_created",
        description: `${customer.name} created a new account`,
        metadata: null
      });
      
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  router.put("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  router.delete("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  router.get("/customers/search/:query", async (req, res) => {
    try {
      const customers = await storage.searchCustomers(req.params.query);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to search customers" });
    }
  });

  // Product routes
  router.get("/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  router.get("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  router.post("/products", validateBody(insertProductSchema), async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  router.put("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  router.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  router.get("/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  router.get("/products/search/:query", async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // Order routes
  router.get("/orders", async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  router.get("/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderWithDetails(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  router.post("/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      const parsedOrder = insertOrderSchema.parse(order);
      
      // Validate each order item
      const parsedItems = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const newOrder = await storage.createOrder(parsedOrder, parsedItems);
      
      // Create activity for new order
      const customer = await storage.getCustomer(parsedOrder.customerId);
      if (customer) {
        await storage.createActivity({
          customerId: customer.id,
          type: "purchase",
          description: `${customer.name} placed an order`,
          metadata: JSON.stringify({ orderId: newOrder.id })
        });
      }
      
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order", details: error });
    }
  });

  router.put("/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Create activity for order status update if it's completed
      if (status === 'completed') {
        const orderDetails = await storage.getOrderWithDetails(id);
        if (orderDetails && orderDetails.customer) {
          await storage.createActivity({
            customerId: orderDetails.customer.id,
            type: "order_completed",
            description: `${orderDetails.customer.name} completed purchase`,
            metadata: JSON.stringify({ orderId: id })
          });
        }
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  router.get("/orders/recent/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const orders = await storage.getRecentOrders(limit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  });

  // Activity routes
  router.get("/activities/recent/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });

  router.post("/activities", validateBody(insertActivitySchema), async (req, res) => {
    try {
      const activity = await storage.createActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // Dashboard metrics
  router.get("/dashboard/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  router.get("/dashboard/category-stats", async (_req, res) => {
    try {
      const stats = await storage.getProductCategoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product category stats" });
    }
  });

  router.get("/dashboard/popular-products/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 3;
      const products = await storage.getPopularProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular products" });
    }
  });

  // User and Auth routes
  router.get("/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Augmented Request type with session
  interface AuthRequest extends Request {
    session: Session & {
      userId?: number;
    };
  }

  // Auth routes
  router.post("/auth/signup", validateBody(insertUserSchema), async (req, res) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: "Username already exists. Please choose a different username." 
        });
      }
      
      const newUser = await storage.createUser(req.body);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ 
        success: true, 
        data: userWithoutPassword,
        message: "User created successfully" 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to create user account"
      });
    }
  });

  router.post("/auth/login", async (req: AuthRequest, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: "Username and password are required" 
        });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid username or password" 
        });
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        success: true,
        data: userWithoutPassword,
        message: "Login successful"
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Login failed" 
      });
    }
  });

  router.post("/auth/logout", async (req: AuthRequest, res) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to logout"
        });
      }
      
      res.json({ 
        success: true,
        message: "Logged out successfully" 
      });
    });
  });

  router.get("/auth/me", async (req: AuthRequest, res) => {
    try {
      // Get userId from session
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: "Not authenticated" 
        });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true,
        data: userWithoutPassword,
        message: "Authentication successful" 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Authentication error" 
      });
    }
  });

  // Stripe payment routes
  router.post("/payments/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Valid amount is required" 
        });
      }
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ 
        success: true, 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to create payment intent" 
      });
    }
  });
  
  // Process orders with payment confirmation
  router.post("/payments/confirm-order", async (req: Request, res: Response) => {
    try {
      const { 
        paymentIntentId, 
        order, 
        items,
        customer 
      } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ 
          success: false, 
          message: "Payment Intent ID is required" 
        });
      }
      
      // Verify payment intent is successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          success: false, 
          message: "Payment has not been completed" 
        });
      }
      
      // Process customer if provided
      let customerId = order.customerId;
      if (customer && !customerId) {
        // Check if customer exists with this email
        const existingCustomers = await storage.searchCustomers(customer.email);
        let customerRecord;
        
        if (existingCustomers.length > 0) {
          // Use existing customer
          customerRecord = existingCustomers[0];
        } else {
          // Create new customer
          customerRecord = await storage.createCustomer({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null
          });
          
          // Log activity for new customer
          await storage.createActivity({
            customerId: customerRecord.id,
            type: "account_created",
            description: `${customerRecord.name} created an account during checkout`,
            metadata: null
          });
        }
        
        customerId = customerRecord.id;
      }
      
      // Process the order
      const parsedOrder = insertOrderSchema.parse({
        ...order,
        customerId,
        status: "processing" // Initially set as processing
      });
      
      // Validate each order item
      const parsedItems = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      // Create the order
      const newOrder = await storage.createOrder(parsedOrder, parsedItems);
      
      // Create purchase activity
      await storage.createActivity({
        customerId,
        type: "purchase",
        description: `Order #${newOrder.id} placed successfully`,
        metadata: JSON.stringify({ 
          orderId: newOrder.id,
          paymentIntentId
        })
      });
      
      // Mark the order as completed since payment is successful
      const updatedOrder = await storage.updateOrderStatus(newOrder.id, "completed");
      
      res.status(201).json({ 
        success: true, 
        order: updatedOrder,
        message: "Order placed successfully" 
      });
    } catch (error: any) {
      console.error("Error confirming order:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to process order" 
      });
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);

  return httpServer;
}
