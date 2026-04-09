/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  User, 
  Package, 
  Star, 
  CreditCard, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "./services/api";
import { Product, Order, Customer } from "./types";

const MOCK_USER: Customer = {
  id: "c1",
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  shippingAddress: "123 Main St, NY",
  billingAddress: "123 Main St, NY",
  createdAt: new Date().toISOString()
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("shop");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prods, userOrders] = await Promise.all([
        api.getProducts(),
        api.getOrders(MOCK_USER.id)
      ]);
      setProducts(prods);
      setOrders(userOrders);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (method: string) => {
    try {
      setError(null);
      const items = cart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      const result = await api.placeOrder({ customerId: MOCK_USER.id, items, method });
      
      setOrderSuccess(result.order.id);
      setCart([]);
      setIsCheckoutOpen(false);
      fetchData(); // Refresh products (stock) and orders
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">NEXUS</span>
          </div>

          <div className="hidden max-w-md flex-1 px-8 md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search products..." 
                className="w-full bg-slate-100 pl-10 border-none focus-visible:ring-1 focus-visible:ring-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full bg-slate-900 p-0 text-[10px] text-white">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                  <SheetDescription>Review your items before checkout.</SheetDescription>
                </SheetHeader>
                <div className="mt-8 flex h-[calc(100vh-200px)] flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    {cart.length === 0 ? (
                      <div className="flex h-40 flex-col items-center justify-center text-slate-400">
                        <ShoppingCart className="mb-2 h-12 w-12 opacity-20" />
                        <p>Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex gap-4">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="h-20 w-20 rounded-lg object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                <h4 className="font-medium">{item.product.name}</h4>
                                <p className="text-sm text-slate-500">${item.product.price} x {item.quantity}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-fit text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="mt-auto pt-6">
                    <Separator className="mb-4" />
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-bold">${cartTotal}</span>
                    </div>
                    <Button 
                      className="w-full bg-slate-900 text-white hover:bg-slate-800" 
                      disabled={cart.length === 0}
                      onClick={() => setIsCheckoutOpen(true)}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={() => setActiveTab("profile")}>
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white p-1 shadow-sm">
              <TabsTrigger value="shop" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Shop
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="shop" className="m-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-none shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                        <Badge className="absolute left-2 top-2 bg-orange-500 text-white">
                          Only {product.stockQuantity} left
                        </Badge>
                      )}
                      {product.stockQuantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{product.category}</span>
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{product.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between p-4 pt-0">
                      <span className="text-xl font-bold">${product.price}</span>
                      <Button 
                        size="sm" 
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        disabled={product.stockQuantity === 0}
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="m-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <History className="h-6 w-6 text-slate-400" />
                <h2 className="text-2xl font-bold">Order History</h2>
              </div>
              {orders.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <Package className="mb-4 h-16 w-16 opacity-10" />
                  <p>You haven't placed any orders yet.</p>
                  <Button variant="link" onClick={() => setActiveTab("shop")}>Start shopping</Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-none shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-medium">Order #{order.id}</CardTitle>
                          <CardDescription>{new Date(order.orderDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">
                          {order.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {order.items.map((item, idx) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                <div key={idx} className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-100">
                                  <img 
                                    src={product?.image} 
                                    alt={product?.name} 
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">{order.items.length} items</p>
                            <p className="text-lg font-bold">${order.totalAmount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="m-0">
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="border-none shadow-sm lg:col-span-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <User className="h-12 w-12" />
                  </div>
                  <CardTitle>{MOCK_USER.name}</CardTitle>
                  <CardDescription>{MOCK_USER.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-4 w-4 text-slate-400" />
                    <span>{MOCK_USER.shippingAddress}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span>Payment: UPI / Card</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Edit Profile</Button>
                </CardFooter>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-none bg-slate-900 text-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400">Total Spent</CardDescription>
                      <CardTitle className="text-3xl font-bold">
                        ${orders.reduce((sum, o) => sum + o.totalAmount, 0)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription>Total Orders</CardDescription>
                      <CardTitle className="text-3xl font-bold">{orders.length}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
                
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Order #{order.id} placed</span>
                          </div>
                          <span className="text-slate-400">{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Complete your purchase securely.</DialogDescription>
          </DialogHeader>
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="mb-2 font-medium">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${cartTotal}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Payment Method</h4>
              <div className="grid grid-cols-3 gap-3">
                {['UPI', 'card', 'net banking'].map((method) => (
                  <Button
                    key={method}
                    variant="outline"
                    className="h-20 flex-col gap-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
                    onClick={() => handleCheckout(method)}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-[10px] uppercase tracking-wider">{method}</span>
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Notification */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <Card className="w-full max-w-sm border-none text-center shadow-2xl">
              <CardContent className="pt-10 pb-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <CardTitle className="mb-2 text-2xl">Order Confirmed!</CardTitle>
                <CardDescription className="mb-8">
                  Your order #{orderSuccess} has been placed successfully. We'll notify you when it ships.
                </CardDescription>
                <Button 
                  className="w-full bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => {
                    setOrderSuccess(null);
                    setActiveTab("orders");
                  }}
                >
                  View My Orders
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

