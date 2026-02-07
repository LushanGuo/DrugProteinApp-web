// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authAPI } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: { registeredPhone?: string };
  Register: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    purpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const generateRandomPhone = (): string => {
    const random = Math.floor(Math.random() * 90000000) + 10000000;
    return `138${random}`.substring(0, 11);
  };

  const handleRegister = async () => {
    // 验证
    if (!formData.phone || !formData.email || !formData.password || !formData.purpose) {
      Alert.alert('提示', '请填写所有必填字段');
      return;
    }

    if (formData.phone.length !== 11) {
      Alert.alert('提示', '请输入11位手机号');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('提示', '密码至少需要6位');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.register({
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        purpose: formData.purpose,
      });
      
      if (result.success) {
        Alert.alert(
          '注册成功',
          '账号已创建成功！请使用新账号登录。',
          [
            { 
              text: '去登录', 
              onPress: () => navigation.replace('Login', { 
                registeredPhone: formData.phone 
              })
            }
          ]
        );
      } else {
        Alert.alert('注册失败', result.message || '注册失败，请稍后重试');
      }
    } catch (error: any) {
      Alert.alert('注册失败', error.response?.data?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = () => {
    const newPhone = generateRandomPhone();
    setFormData({
      phone: newPhone,
      email: `user${newPhone.substring(7)}@example.com`,
      password: '123456',
      confirmPassword: '123456',
      purpose: '科研使用',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>用户注册</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 注册表单卡片 */}
        <View style={styles.card}>
          {/* 进度指示器 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={styles.progressCircleActive}>
                <Icon name="account" size={20} color="white" />
              </View>
              <Text style={styles.progressTextActive}>填写信息</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressNumber}>2</Text>
              </View>
              <Text style={styles.progressText}>完成注册</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>基本信息</Text>

          {/* 手机号 */}
          <View style={styles.inputContainer}>
            <Icon name="phone" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入手机号"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <TouchableOpacity 
              style={styles.randomButton}
              onPress={() => setFormData({...formData, phone: generateRandomPhone()})}
            >
              <Icon name="dice-5" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* 邮箱 */}
          <View style={styles.inputContainer}>
            <Icon name="email" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入邮箱"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 密码 */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入密码（至少6位）"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? "eye-off" : "eye"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* 确认密码 */}
          <View style={styles.inputContainer}>
            <Icon name="lock-check" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请再次输入密码"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* 用途 */}
          <View style={styles.inputContainer}>
            <Icon name="briefcase" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入用途（例如：科研、学习等）"
              placeholderTextColor="#999"
              value={formData.purpose}
              onChangeText={(text) => setFormData({...formData, purpose: text})}
            />
          </View>

          {/* 提示信息 */}
          <View style={styles.tipContainer}>
            <Icon name="information" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              请确保手机号和邮箱真实有效，这将用于重要通知
            </Text>
          </View>

          {/* 注册按钮 */}
          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon name="account-check" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.registerButtonText}>立即注册</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 测试数据按钮 */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={fillTestData}
            disabled={loading}
          >
            <Icon name="test-tube" size={18} color="#4CAF50" style={styles.testIcon} />
            <Text style={styles.testButtonText}>生成测试数据</Text>
          </TouchableOpacity>

          {/* 用户协议 */}
          <View style={styles.termsContainer}>
            <TouchableOpacity style={styles.termsCheckbox}>
              <Icon name="checkbox-marked" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.termsText}>
              我已阅读并同意 
              <Text style={styles.termsLink}>《用户协议》</Text> 
              和 
              <Text style={styles.termsLink}>《隐私政策》</Text>
            </Text>
          </View>
        </View>

        {/* 底部信息 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>已有账号？</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>立即登录</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  placeholder: {
    width: 40,
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircleActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
    marginTop: -15,
  },
  progressTextActive: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  randomButton: {
    paddingHorizontal: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 5,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4CAF50',
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#81C784',
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: 'white',
    marginTop: 15,
  },
  testIcon: {
    marginRight: 10,
  },
  testButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  termsCheckbox: {
    marginRight: 10,
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  termsLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default RegisterScreen;
