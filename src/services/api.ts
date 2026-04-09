import { Product, Order, Review, Customer } from "../types";

export const api = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch("/api/products");
    return res.json();
  },

  async placeOrder(orderData: { customerId: string; items: { productId: string; quantity: number }[]; method: string }): Promise<{ order: Order; payment: any }> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to place order");
    }
    return res.json();
  },

  async getOrders(customerId: string): Promise<Order[]> {
    const res = await fetch(`/api/orders/${customerId}`);
    return res.json();
  },

  async getReviews(productId: string): Promise<Review[]> {
    const res = await fetch(`/api/reviews/${productId}`);
    return res.json();
  },

  async postReview(reviewData: Omit<Review, "id" | "date">): Promise<Review> {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    return res.json();
  }
};
