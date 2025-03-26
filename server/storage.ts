import {
  customers, Customer, InsertCustomer,
  products, Product, InsertProduct,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  activities, Activity, InsertActivity,
  users, User, InsertUser,
  OrderWithDetails, DashboardMetrics, ProductCategoryStat, PopularProduct
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private activities: Map<number, Activity>;
  private users: Map<number, User>;
  
  private customerCounter: number;
  private productCounter: number;
  private orderCounter: number;
  private orderItemCounter: number;
  private activityCounter: number;
  private userCounter: number;

  constructor() {
    this.customers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.activities = new Map();
    this.users = new Map();
    
    this.customerCounter = 1;
    this.productCounter = 1;
    this.orderCounter = 1;
    this.orderItemCounter = 1;
    this.activityCounter = 1;
    this.userCounter = 1;

    // Initialize with sample admin user
    this.createUser({
      username: 'admin',
      password: 'admin123', // This is just for demo
      name: 'Alex Johnson',
      role: 'Administrator',
      avatar: ''
    });
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerCounter++;
    const newCustomer: Customer = {
      id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? null,
      address: customer.address ?? null,
      createdAt: new Date()
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer = {
      ...existingCustomer,
      ...customer
    };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    query = query.toLowerCase();
    return Array.from(this.customers.values()).filter(customer => 
      customer.name.toLowerCase().includes(query) || 
      customer.email.toLowerCase().includes(query) ||
      (customer.phone && customer.phone.includes(query))
    );
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCounter++;
    const newProduct: Product = {
      id,
      name: product.name,
      description: product.description ?? null,
      category: product.category,
      price: product.price,
      stock: product.stock ?? 0,
      image: product.image ?? null,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = {
      ...existingProduct,
      ...product
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    query = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(query) || 
      (product.description && product.description.toLowerCase().includes(query))
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => 
      product.category === category
    );
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderWithDetails(id: number): Promise<OrderWithDetails | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const customer = this.customers.get(order.customerId);
    if (!customer) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        return { ...item, product: product! };
      });

    return {
      ...order,
      customer,
      items
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderCounter++;
    const newOrder: Order = {
      id,
      customerId: order.customerId,
      total: order.total,
      status: order.status || 'pending',
      orderDate: new Date()
    };
    this.orders.set(id, newOrder);

    // Create order items
    for (const item of items) {
      const itemId = this.orderItemCounter++;
      const newItem: OrderItem = {
        ...item,
        id: itemId,
        orderId: id
      };
      this.orderItems.set(itemId, newItem);

      // Update product stock
      const product = this.products.get(item.productId);
      if (product) {
        this.updateProduct(item.productId, {
          stock: product.stock - item.quantity
        });
      }
    }

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      status: status as any
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getRecentOrders(limit: number): Promise<OrderWithDetails[]> {
    const allOrders = Array.from(this.orders.values())
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
      .slice(0, limit);
    
    return Promise.all(
      allOrders.map(async order => this.getOrderWithDetails(order.id) as Promise<OrderWithDetails>)
    );
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityCounter++;
    const newActivity: Activity = {
      id,
      type: activity.type,
      description: activity.description,
      customerId: activity.customerId,
      metadata: activity.metadata ?? null,
      timestamp: new Date()
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getRecentActivities(limit: number): Promise<(Activity & { customer: Customer })[]> {
    const allActivities = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return allActivities.map(activity => {
      const customer = this.customers.get(activity.customerId);
      return {
        ...activity,
        customer: customer!
      };
    });
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allOrders = Array.from(this.orders.values());
    const completedOrders = allOrders.filter(order => order.status === 'completed');
    const pendingOrders = allOrders.filter(order => order.status === 'pending');
    
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const newCustomers = Array.from(this.customers.values())
      .filter(customer => customer.createdAt > lastMonthDate)
      .length;
    
    // Calculate top product
    const productSales = new Map<number, number>();
    for (const item of Array.from(this.orderItems.values())) {
      const currentCount = productSales.get(item.productId) || 0;
      productSales.set(item.productId, currentCount + item.quantity);
    }
    
    let topProductId = 0;
    let maxSales = 0;
    
    for (const [productId, sales] of Array.from(productSales.entries())) {
      if (sales > maxSales) {
        maxSales = sales;
        topProductId = productId;
      }
    }
    
    const topProduct = this.products.get(topProductId);
    
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
    const allProducts = Array.from(this.products.values());
    const totalProducts = allProducts.length;
    
    if (totalProducts === 0) {
      return [
        { category: 'game', percentage: 0 },
        { category: 'software', percentage: 0 },
        { category: 'utility', percentage: 0 }
      ];
    }
    
    const categoryCounts = {
      game: 0,
      software: 0,
      utility: 0
    };
    
    for (const product of allProducts) {
      categoryCounts[product.category as keyof typeof categoryCounts]++;
    }
    
    return [
      { category: 'game', percentage: Math.round(categoryCounts.game / totalProducts * 100) },
      { category: 'software', percentage: Math.round(categoryCounts.software / totalProducts * 100) },
      { category: 'utility', percentage: Math.round(categoryCounts.utility / totalProducts * 100) }
    ];
  }

  async getPopularProducts(limit: number): Promise<PopularProduct[]> {
    const productSales = new Map<number, number>();
    
    for (const item of Array.from(this.orderItems.values())) {
      const currentCount = productSales.get(item.productId) || 0;
      productSales.set(item.productId, currentCount + item.quantity);
    }
    
    const productsWithSales = Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = this.products.get(productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          sales,
          category: product?.category || 'unknown'
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
    
    return productsWithSales;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const newUser: User = { 
      id,
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      avatar: user.avatar ?? null
    };
    this.users.set(id, newUser);
    return newUser;
  }
}

export const storage = new MemStorage();
