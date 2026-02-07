// src/utils/validators.ts

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 手机号验证
export const validatePhone = (phone: string): string => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phone) return '请输入手机号';
  if (!phoneRegex.test(phone)) return '手机号格式不正确';
  return '';
};

// 邮箱验证
export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return '请输入邮箱';
  if (!emailRegex.test(email)) return '邮箱格式不正确';
  return '';
};

// 密码验证
export const validatePassword = (password: string): string => {
  if (!password) return '请输入密码';
  if (password.length < 6) return '密码至少6位';
  if (password.length > 20) return '密码最多20位';
  return '';
};

// 确认密码验证
export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) return '请确认密码';
  if (password !== confirmPassword) return '两次密码不一致';
  return '';
};

// 登录表单验证
export const validateLoginForm = (phoneOrEmail: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!phoneOrEmail.trim()) {
    errors.phoneOrEmail = '请输入手机号或邮箱';
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 注册表单验证
export const validateRegisterForm = (data: {
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  purpose: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  
  if (!data.purpose?.trim()) {
    errors.purpose = '请输入用途';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
