import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import { router, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { signIn } from '../../lib/auth-client';
import { validateEmail, validatePassword } from '../../lib/schemas';
import type { SignInFormData } from '../../lib/schemas';

export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    if (!validateEmail(data.email)) {
      setFieldError('email', { message: 'Please enter a valid email address' });
      return;
    }
    if (!validatePassword(data.password)) {
      setFieldError('password', { message: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      await signIn.email(data, {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: (error) => {
          console.error('Sign in error:', error);
          setSubmitError('Failed to sign in');
        },
      });
    } catch (err) {
      console.error('Sign in failed:', err);
      setSubmitError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to your D&D Campaign Manager account
              </Text>
            </View>

            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {submitError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{submitError}</Text>
                  </View>
                )}

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Email"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          error={!!errors.email}
                          mode="outlined"
                        />
                      )}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email?.message}
                    </HelperText>
                  </View>

                  <View style={styles.inputContainer}>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Password"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          secureTextEntry
                          autoComplete="current-password"
                          error={!!errors.password}
                          mode="outlined"
                        />
                      )}
                    />
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password?.message}
                    </HelperText>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitButton}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Link href="/auth/sign-up" style={styles.link}>
                  Sign up
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    marginBottom: 24,
  },
  cardContent: {
    padding: 24,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    fontWeight: '500',
  },
});
