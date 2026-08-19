import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import apiClient from '../api/axios';
import { KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ResetPasswordScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');

    if (!token || !password || !confirmPassword) {
      setError('Tafadhali jaza sehemu zote!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password mpya na confirmation hazifanani!');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('password_reset/confirm/', {
        token: token.trim(),
        password: password
      });

      setSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (err) {
      console.error("Reset confirm error:", err);
      const resData = err.response?.data;
      if (resData?.token) {
        setError('Token / Code uliyoweka si sahihi au ime-expire!');
      } else if (resData?.password) {
        setError(resData.password[0]);
      } else {
        setError('Imeshindikana kubadilisha password. Jaribu tena!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <KeyRound size={32} color="#10b981" />
          </View>
          <Text style={styles.title}>Weka Password Mpya</Text>
          <Text style={styles.subtitle}>
            Ingiza Token/Code uliyopokea pamoja na Password yako mpya.
          </Text>
        </View>

        {success ? (
          <View style={styles.successBox}>
            <CheckCircle2 size={40} color="#10b981" />
            <Text style={styles.successTitle}>Password Imebadilishwa Vizuri! 🎉</Text>
            <Text style={styles.successSubtitle}>Tunakupeleka kwenye ukurasa wa Login...</Text>
          </View>
        ) : (
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Token Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TOKEN / CODE YA RESET</Text>
              <TextInput
                value={token}
                onChangeText={setToken}
                placeholder="Weka Token hapa..."
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                style={[styles.standaloneInput, styles.tokenInput]}
              />
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD MPYA</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>HAKIKISHA PASSWORD MPYA</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text style={styles.primaryBtnText}>Badilisha Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={styles.backLink}
        >
          <ArrowLeft size={16} color="#94a3b8" />
          <Text style={styles.backLinkText}>Rudi Kwenye Login</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 15,
  },
  successSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  form: {
    gap: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  standaloneInput: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  tokenInput: {
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 10,
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  backLinkText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});