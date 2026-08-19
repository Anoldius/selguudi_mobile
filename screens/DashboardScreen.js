import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  StyleSheet 
} from 'react-native';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Receipt, TrendingUp, AlertTriangle, Store } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = () => {
    apiClient.get('reports/dashboard/')
      .then(res => {
        setData(res.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard:", err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const businessName = user?.business?.name || user?.business_name || data?.business_name || "DUKA LAKO";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Inapakia muhtasari wa leo...</Text>
      </View>
    );
  }

  const statCards = [
    {
      title: 'Mauzo ya Leo',
      value: `${data?.today_total_sales?.toLocaleString() || 0} TZS`,
      icon: DollarSign,
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    {
      title: 'Risiti Zilizotoka',
      value: `${data?.today_receipts || 0}`,
      icon: Receipt,
      color: '#60a5fa',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
    },
    {
      title: 'Kadirio la Faida',
      value: `${data?.today_estimated_profit?.toLocaleString() || 0} TZS`,
      icon: TrendingUp,
      color: '#c084fc',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.2)',
    },
    {
      title: 'Stoko Ndogo Alert',
      value: `${data?.low_stock_items_count || 0} Bidhaa`,
      icon: AlertTriangle,
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
  ];

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
      }
    >
      {/* Top Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.welcomeTitle}>
            Karibu Selguudi 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Muhtasari halisi wa biashara yako kwa siku ya leo.
          </Text>
        </View>

        {/* Business Name Badge */}
        <View style={styles.businessBadge}>
          <View style={styles.storeIconWrapper}>
            <Store size={20} color="#10b981" />
          </View>
          <View>
            <Text style={styles.badgeLabel}>BIASHARA / DUKA</Text>
            <Text style={styles.businessNameText}>{businessName}</Text>
          </View>
        </View>
      </View>

      {/* Analytics Cards */}
      <View style={styles.cardsGrid}>
        {statCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <View style={[styles.cardIconWrapper, { backgroundColor: card.bg, borderColor: card.border }]}>
                  <IconComponent size={20} color={card.color} />
                </View>
              </View>
              <Text style={styles.cardValue}>{card.value}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#020617',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  banner: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  bannerTextContainer: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  welcomeSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 12,
  },
  storeIconWrapper: {
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
  },
  badgeLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  businessNameText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  cardsGrid: {
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardIconWrapper: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
});