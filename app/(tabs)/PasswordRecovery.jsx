'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendRecoveryEmail } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

const PasswordRecovery = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { theme } = useTheme();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await sendRecoveryEmail(data.email);
      setMessage('Recovery email sent. Please check your inbox for further instructions.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending recovery email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-notion-bg dark:bg-[#191919] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-[#202020] rounded-lg shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Password Recovery
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange disabled:opacity-50 transition-colors duration-200"
            >
              {isSubmitting ? 'Sending...' : 'Send Recovery Email'}
            </button>
          </div>
        </form>
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes('Error')
              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200'
          } transition-colors duration-200`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordRecovery;
