import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import apiClient from '../api/axios';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle,
  PackageCheck,
  RefreshCw
} from 'lucide-react-native';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    today_total_sales: 0,
    today_estimated_profit: 0,
    today_receipts: 0,
    low_stock_items_count: 0
  });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const summaryRes = await apiClient.get('reports/dashboard/');
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }

      const topRes = await apiClient.get('reports/top-selling/');
      if (topRes.data) {
        setTopProducts(topRes.data);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        
        {/* Top Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <BarChart3 size={24} color="#10b981" />
            <Text style={styles.headerTitle}>Takwimu za Mauzo ya Leo</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Kagua mchanganuo wa mauzo, faida, na bidhaa zinazotoka zaidi leo.
          </Text>

          <TouchableOpacity onPress={fetchReportData} style={styles.refreshBtn}>
            <RefreshCw size={16} color="#ffffff" />
            <Text style={styles.refreshBtnText}>Anza Upya / Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Inapakia takwimu za leo...</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards Grid */}
            <View style={styles.statsGrid}>
              
              {/* Sales Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>MAUZO YA LEO</Text>
                  <View style={[styles.iconWrapper, styles.greenWrapper]}>
                    <DollarSign size={20} color="#10b981" />
                  </View>
                </View>
                <Text style={styles.cardValue}>
                  {Number(summary.today_total_sales || 0).toLocaleString()} <Text style={styles.unitText}>TZS</Text>
                </Text>
                <Text style={styles.cardSubtext}>Jumla ya fedha zilizoingia</Text>
              </View>

              {/* Profit Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>FAIDA YA LEO (EST.)</Text>
                  <View style={[styles.iconWrapper, styles.greenWrapper]}>
                    <TrendingUp size={20} color="#10b981" />
                  </View>
                </View>
                <Text style={styles.profitValue}>
                  {Number(summary.today_estimated_profit || 0).toLocaleString()} <Text style={styles.unitText}>TZS</Text>
                </Text>
                <Text style={styles.cardSubtext}>Mauzo minus Bei za kununulia</Text>
              </View>

              {/* Transactions Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>MIAMALA / RISITI</Text>
                  <View style={[styles.iconWrapper, styles.blueWrapper]}>
                    <ShoppingBag size={20} color="#60a5fa" />
                  </View>
                </View>
                <Text style={styles.cardValue}>
                  {summary.today_receipts || 0} <Text style={styles.unitText}>Risiti</Text>
                </Text>
                <Text style={styles.cardSubtext}>Idadi ya mauzo yaliyofanyika</Text>
              </View>

              {/* Low Stock Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>ALERT YA STOKO</Text>
                  <View style={[styles.iconWrapper, styles.amberWrapper]}>
                    <AlertTriangle size={20} color="#fbbf24" />
                  </View>
                </View>
                <Text style={styles.amberValue}>
                  {summary.low_stock_items_count || 0} <Text style={styles.unitText}>Bidhaa</Text>
                </Text>
                <Text style={styles.cardSubtext}>Bidhaa zinazokaribia kuisha</Text>
              </View>

            </View>

            {/* TOP SELLING PRODUCTS SECTION */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <PackageCheck size={20} color="#10b981" />
                <Text style={styles.tableTitle}>Bidhaa Zinazotoka Sana (Top 10)</Text>
              </View>

              {topProducts.length === 0 ? (
                <Text style={styles.emptyText}>Hakuna data za bidhaa zilizouzwa bado.</Text>
              ) : (
                <View style={styles.topList}>
                  {topProducts.map((p, idx) => (
                    <View key={idx} style={styles.topItem}>
                      <View style={styles.productMeta}>
                        <Text style={styles.productIndex}>#{idx + 1}</Text>
                        <View style={styles.productTextWrapper}>
                          <Text style={styles.productName} numberOfLines={1}>{p.product__name}</Text>
                          <Text style={styles.productQty}>Idadi Iliyouzwa: {p.total_quantity_sold}</Text>
                        </View>
                      </View>
                      <Text style={styles.revenueText}>
                        {Number(p.total_revenue || 0).toLocaleString()} TZS
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
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
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    gap: 6,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 13,
  },
  statsGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  greenWrapper: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  blueWrapper: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  amberWrapper: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 12,
  },
  profitValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 12,
  },
  amberValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fbbf24',
    marginTop: 12,
  },
  unitText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#94a3b8',
  },
  cardSubtext: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  tableCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    paddingVertical: 20,
    fontSize: 13,
  },
  topList: {
    gap: 10,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  productTextWrapper: {
    flex: 1,
  },
  productIndex: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 13,
  },
  productName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  productQty: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  revenueText: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 13,
  },
});