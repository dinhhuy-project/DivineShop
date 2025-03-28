import {
  customers, Customer, InsertCustomer,
  products, Product, InsertProduct,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  activities, Activity, InsertActivity,
  users, User, InsertUser,
  OrderWithDetails, DashboardMetrics, ProductCategoryStat, PopularProduct
} from "@shared/schema";
import { MongoClient, ServerApiVersion } from 'mongodb';
import { config } from 'dotenv';
// Load environment variables from .env file
config();

if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL, ensure the database is provisioned");
}

let uri = process.env.MONGODB_URL;
  
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB when the program starts
(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the program if the connection fails
  }
})();

// Disconnect from MongoDB when the program closes
process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection...");
  await client.close();
  console.log("MongoDB connection closed. Exiting program.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Closing MongoDB connection...");
  await client.close();
  console.log("MongoDB connection closed. Exiting program.");
  process.exit(0);
});

const db = client.db("DivineShopCRM");

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  searchCustomers(query: string): Promise<Customer[]>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithDetails(id: number): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getRecentOrders(limit: number): Promise<OrderWithDetails[]>;

  // Activity operations
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit: number): Promise<(Activity & { customer: Customer })[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getProductCategoryStats(): Promise<ProductCategoryStat[]>;
  getPopularProducts(limit: number): Promise<PopularProduct[]>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MongoStorage implements IStorage {
  private db = db;

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await this.db.collection<Customer>("customers").find().toArray();
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await this.db.collection<Customer>("customers").findOne({ id });
    return result || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer = {
      ...customer,
      id: Date.now(),
      createdAt: new Date(),
      phone: customer.phone ?? null,
      address: customer.address ?? null
    };
    await this.db.collection("customers").insertOne(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await this.db.collection("customers").findOneAndUpdate(
      { id },
      { $set: customer },
      { returnDocument: "after" }
    );
    return result ? result.value : undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await this.db.collection("customers").deleteOne({ id });
    return result.deletedCount > 0;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await this.db.collection<Customer>("customers").find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } }
      ]
    }).toArray();
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await this.db.collection<Product>("products").find().toArray();
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await this.db.collection("products").findOne({ id });
    return result ? {
      id: result.id,
      name: result.name,
      createdAt: new Date(result.createdAt),
      description: result.description ?? null,
      category: result.category as "game" | "software" | "utility",
      price: result.price,
      stock: result.stock,
      image: result.image ?? null
    } as Product : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date(),
      description: product.description ?? null,
      stock: product.stock ?? 0,
      image: product.image ?? null
    };
    await this.db.collection("products").insertOne(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await this.db.collection("products").findOneAndUpdate(
      { id },
      { $set: product },
      { returnDocument: "after" }
    );
    return result ? result.value : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.db.collection("products").deleteOne({ id });
    return result.deletedCount > 0;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await this.db.collection<Product>("products").find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]
    }).toArray();
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return (await this.db.collection("products").find({ category }).toArray()).map(doc => ({
      id: doc.id,
      name: doc.name,
      description: doc.description ?? null,
      category: doc.category as "game" | "software" | "utility",
      price: doc.price,
      stock: doc.stock,
      image: doc.image ?? null,
      createdAt: new Date(doc.createdAt)
    }));
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await this.db.collection<Order>("orders").find().map(doc => ({
      id: doc.id,
      status: doc.status as "pending" | "processing" | "completed" | "failed" | "cancelled",
      customerId: doc.customerId,
      orderDate: new Date(doc.orderDate),
      total: doc.total
    })).toArray();
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await this.db.collection("orders").findOne({ id });
    return result ? {
      id: result.id,
      customerId: result.customerId,
      orderDate: new Date(result.orderDate),
      status: result.status as "pending" | "processing" | "completed" | "failed" | "cancelled",
      total: result.total
    } : undefined;
  }

  async getOrderWithDetails(id: number): Promise<OrderWithDetails | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;

    const customer = await this.getCustomer(order.customerId);
    const items = await this.db.collection("orderItems").find({ orderId: id }).toArray();
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return {
          id: item.id,
          orderId: item.orderId,
          price: item.price,
          productId: item.productId,
          quantity: item.quantity,
          product: product || {
            id: 0,
            name: "Unknown",
            createdAt: new Date(),
            description: null,
            category: "utility",
            price: 0,
            stock: 0,
            image: null
          }
        };
      })
    );

    return { 
      ...order, 
      customer: customer || { id: 0, name: "Unknown", email: "", phone: null, address: null, createdAt: new Date() }, 
      items: detailedItems 
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const newOrder = {
      ...order,
      id: Date.now(),
      orderDate: new Date(),
      status: order.status || "pending" // Ensure status is always assigned
    };
    await this.db.collection("orders").insertOne(newOrder);

    for (const item of items) {
      await this.db.collection("orderItems").insertOne({
        ...item,
        id: Date.now(),
        orderId: newOrder.id
      });

      // Update product stock
      const product = await this.getProduct(item.productId);
      if (product) {
        await this.updateProduct(item.productId, { stock: product.stock - item.quantity });
      }
    }

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await this.db.collection("orders").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ? result.value : undefined;
  }

  async getRecentOrders(limit: number): Promise<OrderWithDetails[]> {
    const orders = await this.db.collection("orders").find()
      .sort({ orderDate: -1 })
      .limit(limit)
      .toArray();

    return Promise.all(
      orders.map(async (order) => this.getOrderWithDetails(order.id) as Promise<OrderWithDetails>)
    );
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return await this.db.collection<Activity>("activities").find().map(doc => ({
      id: doc.id,
      type: doc.type,
      customerId: doc.customerId,
      description: doc.description,
      timestamp: new Date(doc.timestamp),
      metadata: doc.metadata ?? null
    })).toArray();
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity = {
      ...activity,
      id: Date.now(),
      timestamp: new Date(),
      metadata: activity.metadata ?? null
    };
    await this.db.collection("activities").insertOne(newActivity);
    return newActivity;
  }

  async getRecentActivities(limit: number): Promise<(Activity & { customer: Customer })[]> {
    const activities = await this.db.collection("activities").find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return Promise.all(
      activities.map(async (activity) => {
        const customer = await this.getCustomer(activity.customerId);
        return {
          id: activity.id, // Ensure the id property is included
          customerId: activity.customerId,
          type: activity.type,
          description: activity.description,
          timestamp: activity.timestamp,
          metadata: activity.metadata,
          customer: customer || {
            id: 0,
            name: "Unknown",
            email: "",
            phone: null,
            address: null,
            createdAt: new Date()
          }
        };
      })
    );
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const orders = await this.getOrders();
    const completedOrders = orders.filter(order => order.status === 'completed');
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const newCustomers = (await this.getCustomers()).filter(customer => customer.createdAt > lastMonthDate).length;

    const productSales = new Map<number, number>();
    const orderItems = await this.db.collection("orderItems").find().toArray();
    for (const item of orderItems) {
      productSales.set(item.productId, (productSales.get(item.productId) || 0) + item.quantity);
    }

    let topProductId = 0;
    let maxSales = 0;
    for (const [productId, sales] of Array.from(productSales.entries())) {
      if (sales > maxSales) {
        maxSales = sales;
        topProductId = productId;
      }
    }

    const topProduct = await this.getProduct(topProductId);

    return {
      totalSales,
      newCustomers,
      pendingOrders: pendingOrders.length,
      topProduct: {
        name: topProduct?.name || 'No product',
        unitsSold: maxSales
      }
    };
  }

  async getProductCategoryStats(): Promise<ProductCategoryStat[]> {
    const products = await this.getProducts();
    const totalProducts = products.length;

    if (totalProducts === 0) {
      return [
        { category: 'game', percentage: 0 },
        { category: 'software', percentage: 0 },
        { category: 'utility', percentage: 0 }
      ];
    }

    const categoryCounts = products.reduce((counts, product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      percentage: Math.round((count / totalProducts) * 100)
    }));
  }

  async getPopularProducts(limit: number): Promise<PopularProduct[]> {
    const productSales = new Map<number, number>();
    const orderItems = await this.db.collection("orderItems").find().toArray();

    for (const item of orderItems) {
      productSales.set(item.productId, (productSales.get(item.productId) || 0) + item.quantity);
    }

    const productsWithSales = Array.from(productSales.entries())
      .map(([productId, sales]) => ({
        id: productId,
        name: '',
        sales,
        category: ''
      }));

    for (const product of productsWithSales) {
      const productDetails = await this.getProduct(product.id);
      if (productDetails) {
        product.name = productDetails.name;
        product.category = productDetails.category;
      }
    }

    return productsWithSales.sort((a, b) => b.sales - a.sales).slice(0, limit);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.collection("users").findOne({ id });
    return result ? {
      id: result.id,
      name: result.name,
      username: result.username,
      password: result.password,
      role: result.role,
      avatar: result.avatar ?? null
    } as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.collection("users").findOne({ username });
    return result ? {
      id: result.id,
      name: result.name,
      username: result.username,
      password: result.password,
      role: result.role,
      avatar: result.avatar ?? null
    } : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      id: Date.now(),
      avatar: user.avatar ?? null // Ensure avatar is either a string or null
    };
    await this.db.collection("users").insertOne(newUser);
    return newUser;
  }
}

export const storage = new MongoStorage();

import { faker } from '@faker-js/faker'; // Install this library using `npm install @faker-js/faker`

export async function generateRandomData(storage: MongoStorage, count: { users: number; customers: number; products: number; orders: number; activities: number }) {
  // Generate random users
  for (let i = 0; i < count.customers; i++) {
    await storage.createUser({
      username: "ikienkinzero",
      password: "@l0@l0123",
      name: faker.person.fullName(),
      role: "Administrator",
      avatar: faker.image.avatar()
    });
  }

  // Generate random customers
  for (let i = 0; i < count.customers; i++) {
    await storage.createCustomer({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress()
    });
  }

  // Generate random products
  for (let i = 0; i < count.products; i++) {
    await storage.createProduct({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      category: faker.helpers.arrayElement(['game', 'software', 'utility']),
      price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      stock: faker.number.int({ min: 0, max: 100 }),
      image: faker.image.url()
    });
  }

  // Generate random orders
  const customers = await storage.getCustomers();
  const products = await storage.getProducts();

  for (let i = 0; i < count.orders; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const orderItems = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => {
      const product = faker.helpers.arrayElement(products);
      return {
        productId: product.id,
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: product.price,
        orderId: 0 // Placeholder, will be updated when the order is created
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await storage.createOrder(
      {
        customerId: customer.id,
        total,
        status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed'])
      },
      orderItems
    );
  }

  // Generate random activities
  for (let i = 0; i < count.activities; i++) {
    const customer = faker.helpers.arrayElement(customers);
    await storage.createActivity({
      type: faker.helpers.arrayElement(['account_created', 'purchase', 'payment_updated', 'order_completed', 'other']),
      description: faker.lorem.sentence(),
      customerId: customer.id,
      metadata: JSON.stringify({ ip: faker.internet.ip() })
    });
  }
}

// Example usage
// Call this function in your application to populate the storage with random data
generateRandomData(storage, { users: 3, customers: 10, products: 15, orders: 15, activities: 15 });
