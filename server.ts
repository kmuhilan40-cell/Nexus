import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Customer, Product, Order, Payment, Review, Inventory } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Database ---
  let products: Product[] = [
    { id: "p1", name: "Nexus Pro Smartphone", description: "Flagship performance with stunning display.", price: 999, category: "Electronics", brand: "Nexus", stockQuantity: 50, image: "https://picsum.photos/seed/phone/400/400" },
    { id: "p2", name: "Aura Noise Cancelling Headphones", description: "Immersive sound experience.", price: 299, category: "Audio", brand: "Aura", stockQuantity: 30, image: "https://picsum.photos/seed/audio/400/400" },
    { id: "p3", name: "Zenith Smart Watch", description: "Track your health and stay connected.", price: 199, category: "Wearables", brand: "Zenith", stockQuantity: 100, image: "https://picsum.photos/seed/watch/400/400" },
    { id: "p4", name: "Lumina Laptop Pro", description: "Power for creators and professionals.", price: 1499, category: "Computers", brand: "Lumina", stockQuantity: 15, image: "https://picsum.photos/seed/laptop/400/400" },
  ];

  let customers: Customer[] = [
    { id: "c1", name: "John Doe", email: "john@example.com", phone: "1234567890", shippingAddress: "123 Main St, NY", billingAddress: "123 Main St, NY", createdAt: new Date().toISOString() }
  ];

  let orders: Order[] = [];
  let payments: Payment[] = [];
  let reviews: Review[] = [];

  // --- API Routes ---

  // Products
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  // Orders
  app.post("/api/orders", (req, res) => {
    const { customerId, items, method } = req.body;
    
    // Check stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product?.name || 'product'}` });
      }
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: `o${orders.length + 1}`,
      customerId,
      orderDate: new Date().toISOString(),
      totalAmount,
      status: 'pending',
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: products.find(p => p.id === item.productId)?.price || 0
      }))
    };

    // Update stock
    items.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (product) product.stockQuantity -= item.quantity;
    });

    orders.push(newOrder);

    // Create Payment
    const newPayment: Payment = {
      id: `pay${payments.length + 1}`,
      orderId: newOrder.id,
      method,
      status: 'success',
      transactionDate: new Date().toISOString()
    };
    payments.push(newPayment);

    res.status(201).json({ order: newOrder, payment: newPayment });
  });

  app.get("/api/orders/:customerId", (req, res) => {
    const userOrders = orders.filter(o => o.customerId === req.params.customerId);
    res.json(userOrders);
  });

  // Reviews
  app.get("/api/reviews/:productId", (req, res) => {
    const productReviews = reviews.filter(r => r.productId === req.params.productId);
    res.json(productReviews);
  });

  app.post("/api/reviews", (req, res) => {
    const review: Review = {
      id: `r${reviews.length + 1}`,
      ...req.body,
      date: new Date().toISOString()
    };
    reviews.push(review);
    res.status(201).json(review);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
