import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard 
} from 'react-native';
import apiClient from '../api/axios';
import { Store, User, Lock, Phone, Mail, Building2, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    business_type: 'supermarket',
    phone: '',
    owner_email: '',
    owner_username: '',
    owner_password: '',
    owner_full_name: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await apiClient.post('auth/register/', formData);
      setIsSubmitting(false);
      navigation.navigate('Login', { message: 'Usajili umekamilika! Ingia sasa.' });
    } catch (err) {
      setIsSubmitting(false);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
          const firstKey = Object.keys(data.errors)[0];
          const firstErrVal = data.errors[firstKey];
          const errorText = Array.isArray(firstErrVal) ? firstErrVal[0] : firstErrVal;
          setError(`${firstKey.toUpperCase()}: ${errorText}`);
        } 
        else if (data.message && data.message !== "Imetokea kosa wakati wa kuchakata ombi lako.") {
          setError(data.message);
        } 
        else {
          setError('Tafadhali kagua taarifa ulizojaza.');
        }
      } else {
        setError('Imeshindikana kuunganisha na Server.');
      }
    }
  };

  return (
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
          <View style={styles.content}>
            
            {/* Brand Header */}
            <View style={styles.header}>
              <View style={styles.iconBadge}>
                <Store size={28} color="#10b981" />
              </View>
              <Text style={styles.brandTitle}>
                Selguudi <Text style={styles.brandHighlight}>POS</Text>
              </Text>
              <Text style={styles.brandSubtitle}>Sajili Duka Lako Jipya na Anza Mauzo</Text>
            </View>

            {/* Card Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fomu ya Usajili wa Duka</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Business Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>JINA LA DUKA / BIASHARA</Text>
                <View style={styles.inputWrapper}>
                  <Building2 size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={formData.name}
                    onChangeText={(val) => handleChange('name', val)}
                    style={styles.input}
                    placeholder="Mfano: Pasua Supermarket"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              {/* Business Type Buttons */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>AINA YA BIASHARA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                  {[
                    { id: 'supermarket', label: 'Supermarket' },
                    { id: 'pharmacy', label: 'Pharmacy' },
                    { id: 'hardware', label: 'Hardware' },
                    { id: 'clothing', label: 'Nguo/Viatu' },
                    { id: 'other', label: 'Nyengine' }
                  ].map((item) => (
                    <TouchableOpacity 
                      key={item.id}
                      onPress={() => handleChange('business_type', item.id)}
                      style={[
                        styles.typeChip, 
                        formData.business_type === item.id && styles.typeChipActive
                      ]}
                    >
                      <Text style={[
                        styles.typeChipText,
                        formData.business_type === item.id && styles.typeChipTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Owner Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>JINA KAMILI LA MMILIKI</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={formData.owner_full_name}
                    onChangeText={(val) => handleChange('owner_full_name', val)}
                    style={styles.input}
                    placeholder="Mfano: Anoldius Ishemwa"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NAMBA YA SIMU</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={formData.phone}
                    onChangeText={(val) => handleChange('phone', val)}
                    style={styles.input}
                    placeholder="0712345678"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Owner Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>BARUA PEPE (EMAIL) YA MMILIKI</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={formData.owner_email}
                    onChangeText={(val) => handleChange('owner_email', val)}
                    style={styles.input}
                    placeholder="anoldpaul86@gmail.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Owner Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME YA MMILIKI</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={formData.owner_username}
                    onChangeText={(val) => handleChange('owner_username', val)}
                    style={styles.input}
                    placeholder="anoldius_owner"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Owner Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NENOSIRI (PASSWORD)</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={formData.owner_password}
                    onChangeText={(val) => handleChange('owner_password', val)}
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={isSubmitting}
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Kamilisha Usajili</Text>
                    <ArrowRight size={20} color="#020617" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Tayari una duka?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Ingia Hapa</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <ShieldCheck size={16} color="#10b981" />
              <Text style={styles.securityText}>Multi-Tenant Enterprise Security Protected</Text>
            </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  brandHighlight: {
    color: '#10b981',
  },
  brandSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 10,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typeChip: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  typeChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#10b981',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 15,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  loginText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  loginLink: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 13,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityText: {
    color: '#64748b',
    fontSize: 11,
  },
});