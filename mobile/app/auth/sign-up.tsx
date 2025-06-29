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
import { signUp } from '../../lib/auth-client';
import { validateEmail, validatePassword, validateRequired } from '../../lib/schemas';
import type { SignUpFormData } from '../../lib/schemas';

export default function SignUpScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    if (!validateRequired(data.name)) {
      setFieldError('name', { message: 'Name is required' });
      return;
    }
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
      await signUp.email(data, {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: (error) => {
          console.error('Sign up error:', error);
          setSubmitError('Failed to create account');
        },
      });
    } catch (err) {
      console.error('Sign up failed:', err);
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
              <Text style={styles.title}>Create an account</Text>
              <Text style={styles.subtitle}>
                Join D&D Campaign Manager to start your adventure
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
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Name"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          autoComplete="name"
                          error={!!errors.name}
                          mode="outlined"
                        />
                      )}
                    />
                    <HelperText type="error" visible={!!errors.name}>
                      {errors.name?.message}
                    </HelperText>
                  </View>

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
                          autoComplete="new-password"
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
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Link href="/auth/sign-in" style={styles.link}>
                  Sign in
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
