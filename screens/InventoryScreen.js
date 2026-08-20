import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Modal, 
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
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Scan 
} from 'lucide-react-native';

export default function InventoryScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    buying_price: '',
    selling_price: '',
    quantity: '',
    unit: 'pcs',
    min_stock_alert: '5.00'
  });

  const [editId, setEditId] = useState(null);

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

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      barcode: '',
      buying_price: '',
      selling_price: '',
      quantity: '',
      unit: 'pcs',
      min_stock_alert: '5.00'
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditId(product.id);
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      buying_price: String(product.buying_price || ''),
      selling_price: String(product.selling_price || ''),
      quantity: String(product.quantity || ''),
      unit: product.unit || 'pcs',
      min_stock_alert: String(product.min_stock_alert || '5.00')
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.buying_price || !formData.selling_price || !formData.quantity) {
      Alert.alert("Kosa", "Tafadhali jaza taarifa zote muhimu!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editId) {
        await apiClient.put(`inventory/products/${editId}/`, formData);
      } else {
        await apiClient.post('inventory/products/', formData);
      }
      setIsSubmitting(false);
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Imeshindikana kuhifadhi bidhaa!");
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Thibitisha Ufutaji",
      "Je, una uhakika unataka kufuta bidhaa hii?",
      [
        { text: "Ghairi", style: "cancel" },
        { 
          text: "Futa", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.delete(`inventory/products/${id}/`);
              fetchProducts();
            } catch (err) {
              Alert.alert("Error", "Imeshindikana kufuta bidhaa!");
            }
          } 
        }
      ]
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

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
            
            {/* Top Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.headerTitleRow}>
                <Package size={24} color="#10b981" />
                <Text style={styles.headerTitle}>Usimamizi wa Stoko</Text>
              </View>
              <Text style={styles.headerSubtitle}>Ongeza bidhaa mpya au badilisha taarifa za bei na stoko.</Text>

              <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
                <Plus size={18} color="#020617" />
                <Text style={styles.addBtnText}>Ongeza Bidhaa Mpya</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Search size={18} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                placeholder="Tafuta bidhaa kwa jina au Barcode..."
                placeholderTextColor="#64748b"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            {/* Products List */}
            <View style={styles.tableCard}>
              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text style={styles.loadingText}>Inapakia orodha ya bidhaa...</Text>
                </View>
              ) : filteredProducts.length === 0 ? (
                <Text style={styles.emptyText}>Hakuna bidhaa iliyopatikana kwenye mfumo.</Text>
              ) : (
                <View style={styles.productList}>
                  {filteredProducts.map((p) => {
                    const isLowStock = Number(p.quantity) <= Number(p.min_stock_alert || 5);

                    return (
                      <View key={p.id} style={styles.productCard}>
                        <View style={styles.productHeader}>
                          <View style={styles.productTitleGroup}>
                            <Text style={styles.productName}>{p.name}</Text>
                            <Text style={styles.barcodeText}>Barcode: {p.barcode || 'N/A'}</Text>
                          </View>

                          <View style={styles.actionButtons}>
                            <TouchableOpacity onPress={() => openEditModal(p)} style={styles.iconBtn}>
                              <Edit3 size={16} color="#10b981" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(p.id)} style={styles.iconBtn}>
                              <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.productDetailsGrid}>
                          <View>
                            <Text style={styles.detailLabel}>BEI YA KUNUNUA</Text>
                            <Text style={styles.detailValue}>{Number(p.buying_price || 0).toLocaleString()} TZS</Text>
                          </View>

                          <View>
                            <Text style={styles.detailLabel}>BEI YA KUUZIA</Text>
                            <Text style={styles.sellingPriceValue}>{Number(p.selling_price || 0).toLocaleString()} TZS</Text>
                          </View>

                          <View>
                            <Text style={styles.detailLabel}>STOKO ILIYOPO</Text>
                            <View style={[styles.stockBadge, isLowStock ? styles.stockBadgeLow : styles.stockBadgeNormal]}>
                              {isLowStock && <AlertTriangle size={12} color="#fbbf24" />}
                              <Text style={[styles.stockBadgeText, isLowStock ? styles.stockTextLow : styles.stockTextNormal]}>
                                {p.quantity} {p.unit}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* MODAL FOR ADD / EDIT PRODUCT */}
            <Modal visible={showModal} animationType="slide" transparent>
              <KeyboardAvoidingView 
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <View style={styles.modalContent}>
                  
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editId ? 'Badilisha Taarifa za Bidhaa' : 'Sajili Bidhaa Mpya'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                      <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                    
                    {/* Barcode */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>BARCODE (SCAN AU ANDIKA)</Text>
                      <View style={styles.inputWrapper}>
                        <Scan size={18} color="#10b981" style={styles.inputIcon} />
                        <TextInput
                          value={formData.barcode}
                          onChangeText={(val) => handleInputChange('barcode', val)}
                          placeholder="Elekeza Scanner au andika kodi..."
                          placeholderTextColor="#64748b"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    {/* Product Name */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>JINA LA BIDHAA</Text>
                      <TextInput
                        value={formData.name}
                        onChangeText={(val) => handleInputChange('name', val)}
                        placeholder="Mfano: Azam Juice 1L"
                        placeholderTextColor="#64748b"
                        style={styles.standaloneInput}
                      />
                    </View>

                    {/* Buying & Selling Price */}
                    <View style={styles.rowGrid}>
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>BEI KUNUNUA (TZS)</Text>
                        <TextInput
                          value={formData.buying_price}
                          onChangeText={(val) => handleInputChange('buying_price', val)}
                          placeholder="2000"
                          placeholderTextColor="#64748b"
                          keyboardType="numeric"
                          style={styles.standaloneInput}
                        />
                      </View>

                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>BEI KUUZIA (TZS)</Text>
                        <TextInput
                          value={formData.selling_price}
                          onChangeText={(val) => handleInputChange('selling_price', val)}
                          placeholder="2500"
                          placeholderTextColor="#64748b"
                          keyboardType="numeric"
                          style={styles.standaloneInput}
                        />
                      </View>
                    </View>

                    {/* Quantity, Unit & Min Alert */}
                    <View style={styles.rowGrid}>
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>STOKO</Text>
                        <TextInput
                          value={formData.quantity}
                          onChangeText={(val) => handleInputChange('quantity', val)}
                          placeholder="50"
                          placeholderTextColor="#64748b"
                          keyboardType="numeric"
                          style={styles.standaloneInput}
                        />
                      </View>

                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>KIPIMO</Text>
                        <View style={styles.unitSelector}>
                          {['pcs', 'kg', 'liter', 'plate'].map((u) => (
                            <TouchableOpacity
                              key={u}
                              onPress={() => handleInputChange('unit', u)}
                              style={[styles.unitOption, formData.unit === u && styles.unitOptionActive]}
                            >
                              <Text style={[styles.unitText, formData.unit === u && styles.unitTextActive]}>{u}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>MIN ALERT</Text>
                      <TextInput
                        value={formData.min_stock_alert}
                        onChangeText={(val) => handleInputChange('min_stock_alert', val)}
                        placeholder="5"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        style={styles.standaloneInput}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                      style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#020617" />
                      ) : (
                        <View style={styles.submitBtnContent}>
                          <Check size={18} color="#020617" />
                          <Text style={styles.submitBtnText}>
                            {editId ? 'Hifadhi Mabadiliko' : 'Ongeza Kwenye Stoko'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                  </ScrollView>

                </View>
              </KeyboardAvoidingView>
            </Modal>

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
  headerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 6,
  },
  addBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 10,
    fontSize: 13,
  },
  tableCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
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
  productList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitleGroup: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  barcodeText: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  productDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sellingPriceValue: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  stockBadgeNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  stockBadgeLow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockTextNormal: {
    color: '#10b981',
  },
  stockTextLow: {
    color: '#fbbf24',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 8,
    fontSize: 13,
  },
  standaloneInput: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  unitOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#020617',
  },
  unitOptionActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  unitText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  unitTextActive: {
    color: '#020617',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 14,
  },
});