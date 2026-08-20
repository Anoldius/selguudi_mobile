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
  Users, 
  CreditCard, 
  DollarSign, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  Check, 
  Phone,
  UserPlus
} from 'lucide-react-native';

export default function DebtsScreen() {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('debts');

  // Modals States
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  // Form States
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerData, setCustomerData] = useState({ name: '', phone: '' });
  const [debtData, setDebtData] = useState({ customer: '', total_amount: '', due_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [debtsRes, custRes] = await Promise.all([
        apiClient.get('sales/debts/'),
        apiClient.get('sales/customers/')
      ]);
      setDebts(debtsRes.data.results || debtsRes.data);
      setCustomers(custRes.data.results || custRes.data);
    } catch (err) {
      console.error("Error fetching debt data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!customerData.name) {
      Alert.alert("Kosa", "Tafadhali weka jina la mteja!");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('sales/customers/', customerData);
      setShowAddCustomerModal(false);
      setCustomerData({ name: '', phone: '' });
      fetchData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Imeshindikana kusajili mteja!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDebt = async () => {
    if (!debtData.customer || !debtData.total_amount) {
      Alert.alert("Kosa", "Tafadhali chagua mteja na uweke kiasi cha deni!");
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = parseFloat(debtData.total_amount);

      const payload = {
        customer: debtData.customer,
        total_amount: amount,
        remaining_amount: amount,
      };

      if (debtData.due_date && debtData.due_date.trim() !== '') {
        payload.due_date = debtData.due_date;
      }

      await apiClient.post('sales/debts/', payload);
      setShowAddDebtModal(false);
      setDebtData({ customer: '', total_amount: '', due_date: '' });
      fetchData();
    } catch (err) {
      console.error("Error creating debt:", err.response?.data);
      const resData = err.response?.data;
      const errorSource = resData?.errors || resData;

      if (errorSource && typeof errorSource === 'object') {
        const errorDetails = Object.entries(errorSource)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        Alert.alert("Imeshindikana Kurekodi Deni", errorDetails);
      } else {
        Alert.alert("Error", resData?.message || "Imeshindikana kurekodi deni!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayDebt = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      Alert.alert("Kosa", "Ingiza kiasi sahihi cha malipo!");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`sales/debts/${selectedDebt.id}/pay/`, {
        amount_paid: parseFloat(payAmount),
        notes: payNotes
      });
      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      fetchData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || err.response?.data?.message || "Imeshindikana kurekodi malipo!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDebtAmount = debts
    .filter(d => d.status !== 'PAID')
    .reduce((acc, curr) => acc + Number(curr.remaining_amount || 0), 0);

  const activeDebtorsCount = debts.filter(d => d.status !== 'PAID').length;

  const filteredDebts = debts.filter(d => 
    d.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    (d.customer_phone && d.customer_phone.includes(search))
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
            
            {/* HEADER SECTION */}
            <View style={styles.headerCard}>
              <View style={styles.headerTitleRow}>
                <CreditCard size={24} color="#10b981" />
                <Text style={styles.headerTitle}>Daftari la Madeni</Text>
              </View>
              <Text style={styles.headerSubtitle}>Simamia madeni ya wateja na rekodi malipo.</Text>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  onPress={() => setShowAddCustomerModal(true)} 
                  style={styles.secondaryBtn}
                >
                  <UserPlus size={16} color="#10b981" />
                  <Text style={styles.secondaryBtnText}>Mteja Mpya</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setShowAddDebtModal(true)} 
                  style={styles.primaryBtn}
                >
                  <Plus size={18} color="#020617" />
                  <Text style={styles.primaryBtnText}>Sajili Deni</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* STATS CARDS */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View>
                  <Text style={styles.statLabel}>JUMLA YA MADENI</Text>
                  <Text style={styles.statValueDebt}>
                    {totalDebtAmount.toLocaleString()} <Text style={styles.currencyText}>TZS</Text>
                  </Text>
                </View>
                <View style={styles.statIconWrapper}>
                  <DollarSign size={20} color="#fbbf24" />
                </View>
              </View>

              <View style={styles.statCard}>
                <View>
                  <Text style={styles.statLabel}>WATEJA WANAODAIWA</Text>
                  <Text style={styles.statValue}>{activeDebtorsCount} <Text style={styles.currencyText}>Wateja</Text></Text>
                </View>
                <View style={styles.statIconWrapper}>
                  <Users size={20} color="#60a5fa" />
                </View>
              </View>

              <View style={styles.statCard}>
                <View>
                  <Text style={styles.statLabel}>MADENI YALIYOLIPWA</Text>
                  <Text style={styles.statValuePaid}>
                    {debts.filter(d => d.status === 'PAID').length} <Text style={styles.currencyText}>Yalolipwa</Text>
                  </Text>
                </View>
                <View style={styles.statIconWrapper}>
                  <CheckCircle size={20} color="#10b981" />
                </View>
              </View>
            </View>

            {/* SEARCH AND TABS */}
            <View style={styles.filterSection}>
              <View style={styles.searchWrapper}>
                <Search size={18} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                  placeholder="Tafuta mteja au simu..."
                  placeholderTextColor="#64748b"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  onPress={() => setActiveTab('debts')}
                  style={[styles.tabBtn, activeTab === 'debts' && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabText, activeTab === 'debts' && styles.tabTextActive]}>Madeni</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('customers')}
                  style={[styles.tabBtn, activeTab === 'customers' && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabText, activeTab === 'customers' && styles.tabTextActive]}>Wateja</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DEBTS LIST */}
            {activeTab === 'debts' && (
              <View style={styles.listCard}>
                {loading ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#10b981" />
                    <Text style={styles.loadingText}>Inapakia madeni...</Text>
                  </View>
                ) : filteredDebts.length === 0 ? (
                  <Text style={styles.emptyText}>Hakuna kumbukumbu za madeni zilizopatikana.</Text>
                ) : (
                  <View style={styles.itemList}>
                    {filteredDebts.map((d) => (
                      <View key={d.id} style={styles.debtItem}>
                        <View style={styles.itemHeader}>
                          <View>
                            <Text style={styles.customerName}>{d.customer_name}</Text>
                            {d.customer_phone ? (
                              <View style={styles.phoneGroup}>
                                <Phone size={12} color="#64748b" />
                                <Text style={styles.phoneText}>{d.customer_phone}</Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={[
                            styles.statusBadge, 
                            d.status === 'PAID' ? styles.statusPaid : d.status === 'PARTIAL' ? styles.statusPartial : styles.statusPending
                          ]}>
                            {d.status === 'PAID' && <CheckCircle size={10} color="#10b981" />}
                            {d.status === 'PARTIAL' && <Clock size={10} color="#fbbf24" />}
                            {d.status === 'PENDING' && <AlertCircle size={10} color="#f87171" />}
                            <Text style={[
                              styles.statusText,
                              d.status === 'PAID' ? styles.statusTextPaid : d.status === 'PARTIAL' ? styles.statusTextPartial : styles.statusTextPending
                            ]}>
                              {d.status === 'PAID' ? 'Imelipwa Yote' : d.status === 'PARTIAL' ? 'Imelipwa Nusu' : 'Haijalipwa'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.debtValuesGrid}>
                          <View>
                            <Text style={styles.valLabel}>DENI LOTE</Text>
                            <Text style={styles.valText}>{Number(d.total_amount).toLocaleString()} TZS</Text>
                          </View>
                          <View>
                            <Text style={styles.valLabel}>KILICHOLIPWA</Text>
                            <Text style={styles.paidText}>{Number(d.paid_amount).toLocaleString()} TZS</Text>
                          </View>
                          <View>
                            <Text style={styles.valLabel}>LINALOBAKI</Text>
                            <Text style={styles.remainingText}>{Number(d.remaining_amount).toLocaleString()} TZS</Text>
                          </View>
                        </View>

                        {d.status !== 'PAID' && (
                          <TouchableOpacity
                            onPress={() => { setSelectedDebt(d); setShowPayModal(true); }}
                            style={styles.payActionBtn}
                          >
                            <Text style={styles.payActionBtnText}>Sajili Malipo</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* CUSTOMERS LIST */}
            {activeTab === 'customers' && (
              <View style={styles.listCard}>
                <View style={styles.itemList}>
                  {customers.map((c) => (
                    <View key={c.id} style={styles.customerItem}>
                      <View>
                        <Text style={styles.customerName}>{c.name}</Text>
                        <Text style={styles.phoneText}>Simu: {c.phone || 'N/A'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.valLabel}>ANAYODAIWA</Text>
                        <Text style={styles.remainingText}>{Number(c.total_debt || 0).toLocaleString()} TZS</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* MODAL 1: PAY DEBT */}
            <Modal visible={showPayModal} animationType="slide" transparent>
              <KeyboardAvoidingView 
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sajili Malipo ya Deni</Text>
                    <TouchableOpacity onPress={() => setShowPayModal(false)}>
                      <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView keyboardShouldPersistTaps="handled">
                    {selectedDebt && (
                      <View style={styles.debtSummaryBox}>
                        <Text style={styles.summaryText}>Mteja: <Text style={styles.boldText}>{selectedDebt.customer_name}</Text></Text>
                        <Text style={styles.summaryText}>Salio Linalobaki: <Text style={styles.amberText}>{Number(selectedDebt.remaining_amount).toLocaleString()} TZS</Text></Text>
                      </View>
                    )}

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>KIASI ANACHOLIPA SASA (TZS)</Text>
                      <TextInput
                        value={payAmount}
                        onChangeText={setPayAmount}
                        placeholder="10000"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        style={styles.modalInput}
                      />

                      <Text style={[styles.label, { marginTop: 10 }]}>MAELEZO</Text>
                      <TextInput
                        value={payNotes}
                        onChangeText={setPayNotes}
                        placeholder="Mfano: Kalipa kwa M-Pesa"
                        placeholderTextColor="#64748b"
                        style={styles.modalInput}
                      />

                      <TouchableOpacity
                        onPress={handlePayDebt}
                        disabled={isSubmitting}
                        style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                      >
                        {isSubmitting ? <ActivityIndicator color="#020617" /> : <Text style={styles.submitBtnText}>Hifadhi Malipo</Text>}
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            {/* MODAL 2: ADD CUSTOMER */}
            <Modal visible={showAddCustomerModal} animationType="slide" transparent>
              <KeyboardAvoidingView 
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sajili Mteja Mpya</Text>
                    <TouchableOpacity onPress={() => setShowAddCustomerModal(false)}>
                      <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>JINA LA MTEJA</Text>
                      <TextInput
                        value={customerData.name}
                        onChangeText={(val) => setCustomerData({ ...customerData, name: val })}
                        placeholder="Mama Maria"
                        placeholderTextColor="#64748b"
                        style={styles.modalInput}
                      />

                      <Text style={[styles.label, { marginTop: 10 }]}>NAMBA YA SIMU</Text>
                      <TextInput
                        value={customerData.phone}
                        onChangeText={(val) => setCustomerData({ ...customerData, phone: val })}
                        placeholder="0712345678"
                        placeholderTextColor="#64748b"
                        keyboardType="phone-pad"
                        style={styles.modalInput}
                      />

                      <TouchableOpacity
                        onPress={handleAddCustomer}
                        disabled={isSubmitting}
                        style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                      >
                        {isSubmitting ? <ActivityIndicator color="#020617" /> : <Text style={styles.submitBtnText}>Hifadhi Mteja</Text>}
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            {/* MODAL 3: RECORD DEBT */}
            <Modal visible={showAddDebtModal} animationType="slide" transparent>
              <KeyboardAvoidingView 
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Rekodi Deni Jipya</Text>
                    <TouchableOpacity onPress={() => setShowAddDebtModal(false)}>
                      <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>CHAGUA MTEJA</Text>
                      <ScrollView style={{ maxHeight: 120, marginBottom: 10 }} nestedScrollEnabled>
                        {customers.map((c) => (
                          <TouchableOpacity
                            key={c.id}
                            onPress={() => setDebtData({ ...debtData, customer: c.id })}
                            style={[
                              styles.customerSelectOption,
                              debtData.customer === c.id && styles.customerSelectOptionActive
                            ]}
                          >
                            <Text style={[
                              styles.customerSelectText,
                              debtData.customer === c.id && styles.customerSelectTextActive
                            ]}>{c.name} ({c.phone || 'Bila Simu'})</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <Text style={styles.label}>JUMLA YA DENI (TZS)</Text>
                      <TextInput
                        value={debtData.total_amount}
                        onChangeText={(val) => setDebtData({ ...debtData, total_amount: val })}
                        placeholder="50000"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        style={styles.modalInput}
                      />

                      <TouchableOpacity
                        onPress={handleAddDebt}
                        disabled={isSubmitting}
                        style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                      >
                        {isSubmitting ? <ActivityIndicator color="#020617" /> : <Text style={styles.submitBtnText}>Rekodi Deni</Text>}
                      </TouchableOpacity>
                    </View>
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
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#020617',
    flexGrow: 1,
    gap: 16,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  primaryBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValueDebt: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  statValuePaid: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  currencyText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 'normal',
  },
  statIconWrapper: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#020617',
  },
  filterSection: {
    gap: 10,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#10b981',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#020617',
  },
  listCard: {
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
  itemList: {
    gap: 12,
  },
  debtItem: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  customerItem: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  phoneGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    color: '#64748b',
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPaid: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  statusPartial: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  statusPending: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextPaid: { color: '#10b981' },
  statusTextPartial: { color: '#fbbf24' },
  statusTextPending: { color: '#f87171' },
  debtValuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
  },
  valLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
  },
  valText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  paidText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  remainingText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  payActionBtn: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  payActionBtnText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
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
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  debtSummaryBox: {
    backgroundColor: '#020617',
    padding: 10,
    borderRadius: 12,
    marginVertical: 12,
    gap: 4,
  },
  summaryText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  boldText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  amberText: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  formGroup: {
    marginTop: 10,
  },
  label: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  customerSelectOption: {
    padding: 10,
    backgroundColor: '#020617',
    borderRadius: 8,
    marginBottom: 4,
  },
  customerSelectOptionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  customerSelectText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  customerSelectTextActive: {
    color: '#10b981',
    fontWeight: '700',
  },
});