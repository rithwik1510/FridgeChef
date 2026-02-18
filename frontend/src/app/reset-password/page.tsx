'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { passwordResetApi } from '@/lib/api';
import { isHttpError } from '@/lib/errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LockKey, CheckCircle } from '@phosphor-icons/react';

const resetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setError(null);
    try {
      await passwordResetApi.confirm(data.token, data.newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      if (isHttpError(err, 400)) {
        setError('Invalid or expired reset token. Please request a new one.');
      } else if (isHttpError(err, 429)) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-cream-lightest bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-dark via-cream-lightest to-cream-lightest">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-terracotta/10 rounded-2xl flex items-center justify-center">
              {success ? (
                <CheckCircle size={48} className="text-sage" weight="duotone" />
              ) : (
                <LockKey size={48} className="text-terracotta" weight="duotone" />
              )}
            </div>
          </div>
          <h1 className="text-4xl font-fraunces text-charcoal mb-2">
            {success ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p className="text-charcoal/60 text-lg">
            {success ? 'You can now sign in with your new password.' : 'Enter your reset token and new password.'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl">
          {success ? (
            <div className="space-y-6">
              <div className="bg-sage/10 text-sage p-4 rounded-xl text-sm border border-sage/20 text-center">
                Your password has been updated successfully.
              </div>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => router.push('/login')}
                className="font-fraunces"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <Input
                label="Reset Token"
                type="text"
                placeholder="Paste your reset token here"
                autoComplete="off"
                {...register('token')}
                error={errors.token?.message}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register('newPassword')}
                error={errors.newPassword?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  className="font-fraunces"
                >
                  Reset Password
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <Link href="/forgot-password" className="block text-sm text-charcoal/40 hover:text-charcoal/80 transition-colors">
            Need a new token?
          </Link>
          <Link href="/login" className="block text-sm text-charcoal/40 hover:text-charcoal/80 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
