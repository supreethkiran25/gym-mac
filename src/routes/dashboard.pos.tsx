import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Search,
  Receipt,
  User,
  Package,
} from "lucide-react";
import { useGymStore, POSProduct, POSOrderItem } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/pos")({
  component: POSProShop,
});

function POSProShop() {
  const {
    posProducts,
    members,
    processPOSSale,
    restockProduct,
    openUPIQRModal,
    settings,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<POSOrderItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("guest");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Cash" | "Card" | "Member Due">("UPI");

  const filteredProducts = posProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === "All") return true;
    return p.category === selectedCategory;
  });

  const addToCart = (product: POSProduct) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is currently out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Cannot add more than available stock (${product.stock})`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as POSOrderItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your checkout cart is empty!");
      return;
    }

    const memberObj = members.find((m) => m.id === selectedMemberId);
    const memberName = memberObj ? memberObj.name : "Walk-in Guest";

    if (paymentMethod === "UPI") {
      openUPIQRModal(cartTotal, memberName, `Pro Shop Checkout (${cart.length} items)`);
    }

    processPOSSale({
      memberId: selectedMemberId === "guest" ? undefined : selectedMemberId,
      memberName,
      items: cart,
      paymentMethod,
    });

    toast.success(`Completed sale of ${settings.currencySymbol}${cartTotal.toLocaleString("en-IN")} via ${paymentMethod}!`);
    setCart([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Front-Desk Point of Sale (POS)</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Pro Shop Store
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Sell protein shakes, pre-workouts, drinks & gym merchandise directly at the front desk with 1-click receipts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Product Catalog (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Category Pills */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs outline-none focus:border-emerald"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(["All", "Supplements", "Beverages", "Accessories", "Apparel"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? "bg-foreground text-background border-foreground shadow-xs"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className={`group cursor-pointer rounded-2xl border p-4 space-y-3 transition hover:shadow-md ${
                  prod.stock <= 5
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                    : "border-border bg-surface hover:border-foreground/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{prod.icon}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${
                      prod.stock <= 5
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {prod.stock} in stock
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-emerald transition">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {prod.sku}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="font-mono font-bold text-sm text-foreground">
                    {settings.currencySymbol}{prod.price.toLocaleString("en-IN")}
                  </span>
                  <button className="rounded-lg bg-foreground text-background p-1.5 text-xs font-semibold hover:opacity-90 transition">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cart & Checkout Drawer (1 Col) */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm sticky top-20">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald" />
              <h3 className="text-sm font-bold">Register Checkout Cart</h3>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          {/* Member Attachment */}
          <div className="space-y-1 text-xs">
            <label className="text-muted-foreground font-semibold">Bill To Member (or Guest)</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
            >
              <option value="guest">👤 Walk-in Guest (Cash / UPI)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.plan})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Item List */}
          <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-border/40">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.productId} className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {settings.currencySymbol}{item.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 rounded-md border border-border hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 rounded-md border border-border hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Cart is empty. Click any product to add.
              </p>
            )}
          </div>

          {/* Payment Method Pills */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-border">
            <label className="text-muted-foreground font-semibold">Payment Method</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["UPI", "Cash", "Card", "Member Due"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-medium transition truncate ${
                    paymentMethod === m
                      ? "border-foreground bg-foreground text-background font-semibold"
                      : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Total & Settle Button */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Total Payable:</span>
              <span className="font-mono text-2xl font-bold text-foreground">
                {settings.currencySymbol}{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs ${
                cart.length === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald" />
              <span>Complete Sale & Issue Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
