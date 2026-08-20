import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import apiClient from '../api/axios';
import { Store, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Tafadhali weka barua pepe (email)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('password_reset/', { email });
      setSubmitted(true);
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        err.response?.data?.email?.[0] || 
        'Imeshindikana kutuma ombi. Hakikisha Email ni sahihi!'
      );
    } finally {
      setLoading(false);
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
            <View style={styles.card}>
              
              {/* Brand Header */}
              <View style={styles.header}>
                <View style={styles.iconWrapper}>
                  <Store size={32} color="#10b981" />
                </View>
                <Text style={styles.title}>Umesahau Password?</Text>
                <Text style={styles.subtitle}>
                  Weka email yako hapa chini ili tukutumie code ya kubadilisha password.
                </Text>
              </View>

              {submitted ? (
                <View style={styles.submittedContainer}>
                  <View style={styles.successBox}>
                    <CheckCircle2 size={40} color="#10b981" />
                    <Text style={styles.successTitle}>Ombi Lilitumwa Vizuri!</Text>
                    <Text style={styles.successSubtitle}>
                      Kama email hiyo imesajiliwa, angalia terminal ya backend (au inbox yako) kupata Code/Token ya Reset.
                    </Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ResetPassword')}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>Weka Code / Reset Password</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  {error ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL YAKO</Text>
                    <View style={styles.inputWrapper}>
                      <Mail size={18} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="mfano@gmail.com"
                        placeholderTextColor="#64748b"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#020617" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Tuma Code ya Reset</Text>
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
  submittedContainer: {
    gap: 16,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 14,
  },
  successSubtitle: {
    color: '#cbd5e1',
    fontSize: 11,
    textAlign: 'center',
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