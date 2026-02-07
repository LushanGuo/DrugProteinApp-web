// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authAPI } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: 输入手机号, 2: 输入验证码, 3: 设置新密码
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 发送验证码
  const handleSendCode = async () => {
    const trimmedPhone = phone.trim();
    
    if (!/^1[3-9]\d{9}$/.test(trimmedPhone)) {
      Alert.alert('提示', '请输入正确的手机号格式');
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendResetCode(trimmedPhone);
      Alert.alert('成功', '验证码已发送到您的手机');
      setStep(2);
      startCountdown();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '发送失败，请稍后重试';
      Alert.alert('发送失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyResetCode(phone, verificationCode);
      setStep(3);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '验证码错误或已过期';
      Alert.alert('验证失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('提示', '密码至少需要6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(phone, verificationCode, newPassword);
      Alert.alert('成功', '密码重置成功，请使用新密码登录', [
        { text: '确定', onPress: () => navigation.replace('Login') }
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '重置失败，请重试';
      Alert.alert('重置失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 倒计时
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;
    await handleSendCode();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 顶部装饰 */}
          <View style={styles.topWave}>
            <View style={styles.waveCircle1} />
            <View style={styles.waveCircle2} />
          </View>

          {/* 返回按钮 */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          {/* 标题区域 */}
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <Icon name="lock-reset" size={50} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>忘记密码</Text>
            <Text style={styles.headerSubtitle}>
              {step === 1 && '请输入您的手机号'}
              {step === 2 && '请输入验证码'}
              {step === 3 && '设置新密码'}
            </Text>
          </View>

          {/* 步骤指示器 */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
              </View>
              <Text style={styles.stepLabel}>验证手机</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
              </View>
              <Text style={styles.stepLabel}>验证码</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= 3 && styles.stepNumberActive]}>3</Text>
              </View>
              <Text style={styles.stepLabel}>重置密码</Text>
            </View>
          </View>

          {/* 表单卡片 */}
          <View style={styles.card}>
            {/* 步骤 1: 输入手机号 */}
            {step === 1 && (
              <>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>手机号</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="cellphone" size={22} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="请输入11位手机号"
                      placeholderTextColor="#B0BEC5"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]} 
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>发送验证码</Text>
                      <Icon name="arrow-right" size={20} color="white" style={styles.arrowIcon} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* 步骤 2: 输入验证码 */}
            {step === 2 && (
              <>
                <View style={styles.phoneDisplay}>
                  <Icon name="cellphone-check" size={20} color="#4CAF50" />
                  <Text style={styles.phoneDisplayText}>{phone}</Text>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>验证码</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="shield-check" size={22} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="请输入6位验证码"
                      placeholderTextColor="#B0BEC5"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={countdown > 0}
                >
                  <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                    {countdown > 0 ? `${countdown}秒后重新发送` : '重新发送验证码'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]} 
                  onPress={handleVerifyCode}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>验证</Text>
                      <Icon name="arrow-right" size={20} color="white" style={styles.arrowIcon} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* 步骤 3: 设置新密码 */}
            {step === 3 && (
              <>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>新密码</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="请输入新密码（至少6位）"
                      placeholderTextColor="#B0BEC5"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon} 
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#78909C" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>确认密码</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="lock-check" size={22} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="请再次输入新密码"
                      placeholderTextColor="#B0BEC5"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon} 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#78909C" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]} 
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>完成重置</Text>
                      <Icon name="check" size={20} color="white" style={styles.arrowIcon} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* 底部提示 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>遇到问题？请联系管理员</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
  },
  waveCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -200,
    right: -100,
  },
  waveCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -100,
    left: -80,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 30,
    zIndex: 1,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 30,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#78909C',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  stepLineActive: {
    backgroundColor: '#4CAF50',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  phoneDisplayText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEF2',
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#263238',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
    padding: 4,
  },
  resendText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#B0BEC5',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#81C784',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#90A4AE',
  },
});

export default ForgotPasswordScreen;
