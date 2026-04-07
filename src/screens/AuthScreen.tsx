import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { signUp, signIn, resetPassword } from '../services/authService';
import { useAlert } from '../contexts/AlertContext';

export default function AuthScreen() {
  const C = useColors();
  const { showAlert } = useAlert();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [experience, setExperience] = useState<string>('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert({ title: 'Thiếu thông tin', message: 'Vui lòng nhập email và mật khẩu.', type: 'warning' });
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      showAlert({ title: 'Thiếu thông tin', message: 'Vui lòng nhập tên của bạn.', type: 'warning' });
      return;
    }
    if (password.length < 6) {
      showAlert({ title: 'Mật khẩu yếu', message: 'Mật khẩu cần ít nhất 6 ký tự.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, fullName.trim());
        showAlert({ title: 'Đăng ký thành công', message: 'Kiểm tra email để xác nhận tài khoản. Sau đó đăng nhập lại.', type: 'success' });
        setMode('login');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      const msg = err?.message || 'Có lỗi xảy ra';
      const friendlyMsg = msg.includes('Invalid login') ? 'Email hoặc mật khẩu không đúng.'
        : msg.includes('already registered') ? 'Email này đã được đăng ký.'
        : msg.includes('Email not confirmed') ? 'Vui lòng xác nhận email trước khi đăng nhập.'
        : msg;
      showAlert({ title: 'Lỗi', message: friendlyMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showAlert({ title: 'Nhập email', message: 'Vui lòng nhập email để lấy lại mật khẩu.', type: 'warning' });
      return;
    }
    try {
      await resetPassword(email.trim());
      showAlert({ title: 'Đã gửi', message: 'Kiểm tra email để đặt lại mật khẩu.', type: 'success' });
    } catch {
      showAlert({ title: 'Lỗi', message: 'Không thể gửi email. Kiểm tra lại địa chỉ email.', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.appName}>Sales Coach</Text>
            <Text style={styles.tagline}>THE TRUSTED ADVISOR</Text>
            <Text style={styles.subtitle}>Phương pháp Bán bằng Vị thế</Text>
          </View>

          <View style={[styles.card, { backgroundColor: C.CARD }]}>
            <Text style={[styles.cardTitle, { color: C.TEXT }]}>
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </Text>

            {mode === 'signup' && (
              <>
                <View style={[styles.inputWrap, { backgroundColor: C.SURFACE, borderColor: C.BORDER }]}>
                  <Ionicons name="person-outline" size={18} color={C.TEXT_LIGHT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    placeholderTextColor={C.TEXT_LIGHT}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.TEXT_SECONDARY, marginBottom: 6 }}>Kinh nghiệm bán hàng</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                  {[
                    { key: 'new', label: 'Mới bắt đầu', icon: 'leaf-outline' },
                    { key: 'mid', label: '1-3 năm', icon: 'trending-up-outline' },
                    { key: 'senior', label: '3+ năm', icon: 'trophy-outline' },
                    { key: 'manager', label: 'Quản lý', icon: 'people-outline' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[{
                        flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                        borderWidth: 1, gap: 2,
                        borderColor: experience === opt.key ? '#1A7F64' : C.BORDER,
                        backgroundColor: experience === opt.key ? '#1A7F6410' : 'transparent',
                      }]}
                      onPress={() => setExperience(opt.key)}
                    >
                      <Ionicons name={opt.icon as any} size={16} color={experience === opt.key ? '#1A7F64' : COLORS.TEXT_LIGHT} />
                      <Text style={{ fontSize: 11, fontWeight: '600', color: experience === opt.key ? '#1A7F64' : C.TEXT_LIGHT, textAlign: 'center' }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={C.TEXT_LIGHT} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={C.TEXT_LIGHT}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={C.TEXT_LIGHT} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mật khẩu"
                placeholderTextColor={C.TEXT_LIGHT}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.TEXT_LIGHT} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#1A7F64' }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </Text>
              )}
            </TouchableOpacity>

            {mode === 'login' && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.linkBtn}>
                <Text style={styles.linkText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={styles.linkBtn}
            >
              <Text style={styles.switchText}>
                {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                <Text style={styles.switchBold}>
                  {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>by Coach Duy Nguyễn</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4F3' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 36, fontWeight: '900', color: '#1A7F64', letterSpacing: -0.5 },
  tagline: { fontSize: 12, fontWeight: '800', color: '#1A7F64', letterSpacing: 3, marginTop: 6, opacity: 0.7 },
  subtitle: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: COLORS.TEXT, marginBottom: 20, textAlign: 'center' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.BORDER,
    marginBottom: 12, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, paddingVertical: 14 },
  submitBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
  linkText: { fontSize: 13, color: '#1A7F64', fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.BORDER, marginVertical: 12 },
  switchText: { fontSize: 14, textAlign: 'center' },
  switchBold: { color: '#1A7F64', fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 24 },
});
