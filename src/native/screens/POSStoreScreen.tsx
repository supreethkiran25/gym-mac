import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useGymStore, POSProduct } from "../gym-store";

export function POSStoreScreen() {
  const {
    posProducts,
    processPOSSale,
    openUPIQRModal,
    settings,
    theme,
  } = useGymStore();

  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const addToCart = (p: POSProduct) => {
    if (p.stock <= (cart[p.id] || 0)) {
      Alert.alert("Out of Stock", `Only ${p.stock} units available.`);
      return;
    }
    setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) {
        copy[id] -= 1;
      } else {
        delete copy[id];
      }
      return copy;
    });
  };

  const cartItems = Object.keys(cart).map((id) => {
    const product = posProducts.find((p) => p.id === id)!;
    return { product, qty: cart[id] };
  }).filter((c) => c.product);

  const cartTotal = cartItems.reduce(
    (sum, c) => sum + c.product.price * c.qty,
    0
  );

  const handleCheckoutUPI = () => {
    if (cartItems.length === 0) return;
    openUPIQRModal(cartTotal, "Front Desk Customer", `Pro Shop POS: ${cartItems.length} items`);
    processPOSSale({
      memberName: "Front Desk Customer",
      items: cartItems.map((c) => ({
        productId: c.product.id,
        name: c.product.name,
        price: c.product.price,
        quantity: c.qty,
      })),
      paymentMethod: "UPI",
    });
    setCart({});
  };

  const filteredProducts = posProducts.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textPrimary }]}>Front-Desk POS Pro Shop</Text>
        <Text style={[styles.subtitle, { color: textMuted }]}>
          High-margin supplements, drinks, and merch
        </Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        {(["All", "Supplements", "Drinks", "Snacks", "Apparel"] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.catBtn,
              activeCategory === cat
                ? { backgroundColor: textPrimary }
                : { backgroundColor: surface, borderColor: border, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.catBtnText,
                { color: activeCategory === cat ? bg : textMuted },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <View style={styles.list}>
        {filteredProducts.map((p) => {
          const qtyInCart = cart[p.id] || 0;

          return (
            <View
              key={p.id}
              style={[styles.productCard, { backgroundColor: surface, borderColor: border }]}
            >
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.prodName, { color: textPrimary }]}>{p.name}</Text>
                  <Text style={[styles.prodMeta, { color: textMuted }]}>
                    SKU: {p.sku} • Stock: {p.stock} units
                  </Text>
                </View>
                <Text style={[styles.prodPrice, { color: emerald }]}>
                  {settings.currencySymbol}{p.price.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  onPress={() => addToCart(p)}
                  style={[styles.addCartBtn, { backgroundColor: textPrimary }]}
                >
                  <Text style={[styles.addCartText, { color: bg }]}>
                    {qtyInCart > 0 ? `+ Add More (${qtyInCart})` : "+ Add to Cart"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Cart Summary Floating Banner */}
      {cartItems.length > 0 && (
        <View style={[styles.cartBanner, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.cartTitle, { color: textPrimary }]}>
                Cart: {cartItems.length} items
              </Text>
              <Text style={[styles.cartTotal, { color: emerald }]}>
                Total: {settings.currencySymbol}{cartTotal.toLocaleString("en-IN")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckoutUPI}
              style={[styles.checkoutBtn, { backgroundColor: emerald }]}
            >
              <Text style={styles.checkoutBtnText}>⚡ UPI QR Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
    gap: 14,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
  },
  catRow: {
    flexDirection: "row",
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 6,
  },
  catBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  productCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prodName: {
    fontSize: 13,
    fontWeight: "700",
  },
  prodMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  prodPrice: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  addCartBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCartText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cartBanner: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cartTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  checkoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
});
