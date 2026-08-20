import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import apiClient from '../api/axios';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CheckCircle2 
} from 'lucide-react-native';

export default function POSScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('inventory/products/');
      setProducts(res.data.results || res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  const addToCart = (product) => {
    const stockAvailable = Number(product.quantity ?? product.stock_quantity ?? 0);

    if (stockAvailable <= 0) {
      Alert.alert("Stoko Imeisha", "Bidhaa hii imeisha stoko!");
      return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= stockAvailable) {
        Alert.alert("Kikomo cha Stoko", "Huwezi kuongeza zaidi ya stoko iliyopo!");
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, availableStock: stockAvailable }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.availableStock) {
          Alert.alert("Kikomo cha Stoko", "Umezidi stoko iliyopo!");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.selling_price) * item.quantity), 0);
  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - totalAmount) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckout(true);
    try {
      const payload = {
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: String(item.id),
          quantity: Number(item.quantity)
        }))
      };

      await apiClient.post('sales/transactions/', payload);
      
      setSuccessMsg('Mauzo Yamekamilika Vizuri! 🎉');
      setCart([]);
      setAmountPaid('');
      fetchProducts();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Full Sale Error Response:", err.response);

      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          Alert.alert("Validation Error", JSON.stringify(errorData.errors));
        } else if (errorData.stock_error) {
          Alert.alert("Stoko Error", errorData.stock_error);
        } else {
          Alert.alert("Error", JSON.stringify(errorData));
        }
      } else {
        Alert.alert("Tatizo la Mtandao", "Imeshindikana kuunganisha na server!");
      }
    } finally {
      setIsCheckout(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.container} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            
            {/* SECTION 1: Product Catalog & Search */}
            <View style={styles.catalogCard}>
              <View style={styles.searchWrapper}>
                <Search size={20} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                  placeholder="Tafuta bidhaa kwa jina au Barcode..."
                  placeholderTextColor="#64748b"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                />
              </View>

              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text style={styles.loadingText}>Inapakia bidhaa...</Text>
                </View>
              ) : filteredProducts.length === 0 ? (
                <Text style={styles.emptyText}>Hakuna bidhaa iliyopatikana.</Text>
              ) : (
                <View style={styles.productsGrid}>
                  {filteredProducts.map((product) => {
                    const stock = Number(product.quantity ?? product.stock_quantity ?? 0);
                    const minAlert = Number(product.min_stock_alert || 5);
                    const isLow = stock <= minAlert;

                    return (
                      <TouchableOpacity
                        key={product.id}
                        onPress={() => addToCart(product)}
                        style={styles.productItem}
                      >
                        <View>
                          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                          <Text style={styles.productStock}>
                            Stoko: <Text style={isLow ? styles.stockLow : styles.stockNormal}>{stock} {product.unit || 'pcs'}</Text>
                          </Text>
                        </View>
                        <View style={styles.productFooter}>
                          <Text style={styles.productPrice}>{Number(product.selling_price).toLocaleString()} TZS</Text>
                          <View style={styles.addBtn}>
                            <Plus size={16} color="#10b981" />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* SECTION 2: Cart / Bill Section */}
            <View style={styles.cartCard}>
              <View style={styles.cartHeader}>
                <View style={styles.cartTitleWrapper}>
                  <ShoppingCart size={20} color="#10b981" />
                  <Text style={styles.cartTitle}>Kikapu cha Mauzo</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cart.reduce((a, b) => a + b.quantity, 0)} Items</Text>
                </View>
              </View>

              {successMsg ? (
                <View style={styles.successBox}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              ) : null}

              {/* Cart Items List */}
              <View style={styles.cartList}>
                {cart.length === 0 ? (
                  <Text style={styles.emptyCartText}>Kikapu kipo wazi. Bonyeza bidhaa kuongeza.</Text>
                ) : (
                  cart.map((item) => (
                    <View key={item.id} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>{Number(item.selling_price).toLocaleString()} TZS</Text>
                      </View>
                      
                      <View style={styles.cartItemActions}>
                        <View style={styles.qtyControls}>
                          <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                            <Minus size={14} color="#94a3b8" />
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{item.quantity}</Text>
                          <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                            <Plus size={14} color="#94a3b8" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.trashBtn}>
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Payment Summary */}
              <View style={styles.paymentSection}>
                <Text style={styles.label}>NJIA YA MALIPO</Text>
                <View style={styles.paymentMethods}>
                  {[
                    { id: 'cash', label: 'Cash' },
                    { id: 'mobile_money', label: 'M-Pesa' },
                    { id: 'bank_card', label: 'Card' }
                  ].map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setPaymentMethod(method.id)}
                      style={[
                        styles.methodChip,
                        paymentMethod === method.id && styles.methodChipActive
                      ]}
                    >
                      <Text style={[
                        styles.methodChipText,
                        paymentMethod === method.id && styles.methodChipTextActive
                      ]}>
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Amount Paid Input */}
                <View style={styles.amountInputGroup}>
                  <View style={styles.amountHeader}>
                    <Text style={styles.label}>FEDHA ILIYOTOLEWA:</Text>
                    {change > 0 && <Text style={styles.changeText}>Chenji: {change.toLocaleString()} TZS</Text>}
                  </View>
                  <TextInput
                    placeholder="Weka kiasi kilicholipwa..."
                    placeholderTextColor="#64748b"
                    value={amountPaid}
                    onChangeText={setAmountPaid}
                    keyboardType="numeric"
                    style={styles.amountInput}
                  />
                </View>

                {/* Total & Submit */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>JUMLA KUU:</Text>
                  <Text style={styles.totalValue}>{totalAmount.toLocaleString()} TZS</Text>
                </View>

                <TouchableOpacity
                  onPress={handleCheckout}
                  disabled={cart.length === 0 || isCheckout}
                  style={[styles.checkoutBtn, (cart.length === 0 || isCheckout) && styles.checkoutBtnDisabled]}
                >
                  {isCheckout ? (
                    <ActivityIndicator color="#020617" />
                  ) : (
                    <View style={styles.checkoutBtnContent}>
                      <CreditCard size={20} color="#020617" />
                      <Text style={styles.checkoutBtnText}>Kamilisha Mauzo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 0, // Nafasi ya kutosha juu
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#020617',
    flexGrow: 1,
    gap: 14,
  },
  catalogCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 10,
    fontSize: 14,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    paddingVertical: 24,
    fontSize: 13,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  productName: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: 13,
  },
  productStock: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  stockLow: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  stockNormal: {
    color: '#e2e8f0',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  productPrice: {
    fontWeight: '800',
    color: '#10b981',
    fontSize: 12,
  },
  addBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  cartCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  cartTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  cartList: {
    marginTop: 12,
    gap: 8,
  },
  emptyCartText: {
    textAlign: 'center',
    color: '#64748b',
    paddingVertical: 20,
    fontSize: 13,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#020617',
    borderRadius: 12,
    borderColor: '#1e293b',
    borderWidth: 1,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  cartItemPrice: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    paddingHorizontal: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  trashBtn: {
    padding: 6,
  },
  paymentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#020617',
    alignItems: 'center',
  },
  methodChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  methodChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  methodChipTextActive: {
    color: '#020617',
  },
  amountInputGroup: {
    gap: 6,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  amountInput: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  checkoutBtn: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.5,
  },
  checkoutBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 15,
  },
});