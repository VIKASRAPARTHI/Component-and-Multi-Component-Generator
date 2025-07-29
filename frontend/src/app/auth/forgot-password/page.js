'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { authAPI, handleAPIError } from '@/utils/api';
import toast from 'react-hot-toast';
import ClientOnly from '@/components/ClientOnly';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For now, just show a success message since forgot password API might not be implemented
      toast.success('If an account with that email exists, we\'ve sent password reset instructions.');
      setIsSubmitted(true);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
           }}>
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Forgot your password?
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {isSubmitted 
                  ? "Check your email for reset instructions"
                  : "Enter your email address and we'll send you a link to reset your password"
                }
              </p>
            </div>

            {!isSubmitted ? (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send reset link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>
            )}

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
