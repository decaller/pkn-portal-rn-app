import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius } from '@/theme';
import api from '@/services/api';
import { SymbolView } from 'expo-symbols';

export default function NativeLoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { colors } = useAppTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setErrorText('Phone number and password are required.');
      return;
    }
    
    setErrorText('');
    setIsLoading(true);

    try {
      // Assuming standard API implementation structure
      const response = await api.post('/auth/login', {
        phone_number: identifier.trim(), // Assuming 'phone_number' or 'email' based on portal specs
        password: password,
      });

      // Based on standard Laravel Sanctum return format: { token: '...', user: {...} }
      // This may need adjustment depending on the exact API response structure.
      const { token, user } = response.data;
      
      if (token && user) {
        setAuth(user, token);
        
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setErrorText('Invalid response from server.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorText(
        error?.message || error?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.xl,
      justifyContent: 'center',
    },
    headerBox: {
      marginBottom: spacing['2xl'],
      alignItems: 'center',
    },
    title: {
      ...typography.title1,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.subhead,
      color: colors.text.primary,
      marginBottom: spacing.xs,
      fontWeight: '600',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      height: 52,
    },
    inputContainerError: {
      borderColor: colors.status.danger,
    },
    icon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.text.primary,
      height: '100%',
    },
    passwordToggle: {
      padding: spacing.xs,
    },
    errorText: {
      ...typography.subhead,
      color: colors.status.danger,
      marginTop: spacing.sm,
    },
    loginButton: {
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.md,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
      shadowColor: colors.brand.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    loginButtonDisabled: {
      opacity: 0.7,
      shadowOpacity: 0,
      elevation: 0,
    },
    loginButtonText: {
      ...typography.headline,
      color: '#FFFFFF',
      fontSize: 16,
    },
    fallbackButton: {
      marginTop: spacing.xl,
      alignItems: 'center',
      padding: spacing.md,
    },
    fallbackButtonText: {
      ...typography.subhead,
      color: colors.brand.primary,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerBox}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your PKN Portal account</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputContainer, errorText ? styles.inputContainerError : null]}>
            <SymbolView 
              name="phone" 
              size={20} 
              tintColor={colors.text.secondary} 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. 08123456789"
              placeholderTextColor={colors.text.secondary}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setErrorText('');
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer, errorText ? styles.inputContainerError : null]}>
            <SymbolView 
              name="lock" 
              size={20} 
              tintColor={colors.text.secondary} 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.text.secondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorText('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!isLoading}
            />
            <Pressable 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <SymbolView 
                name={showPassword ? "eye.slash" : "eye"} 
                size={20} 
                tintColor={colors.text.secondary} 
              />
            </Pressable>
          </View>
        </View>

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            (pressed || isLoading) && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
