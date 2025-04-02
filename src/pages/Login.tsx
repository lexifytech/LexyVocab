import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to continue to LexyVocab</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          theme="default"
          redirectTo={import.meta.env.VITE_SITE_URL}
        />
      </div>
    </div>
  );
}; 