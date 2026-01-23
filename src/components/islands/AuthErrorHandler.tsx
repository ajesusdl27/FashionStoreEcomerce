import { useEffect } from 'react';

export default function AuthErrorHandler() {
  useEffect(() => {
    // Check if we're on the home page with auth error parameters
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      const error = params.get('error');
      const errorCode = params.get('error_code');
      
      console.log('AuthErrorHandler - checking hash:', { hash, error, errorCode });
      
      // If there's an auth error, redirect to reset-password page
      if (error || errorCode === 'otp_expired') {
        console.log('Redirecting to reset-password with hash:', hash);
        window.location.href = `/cuenta/reset-password#${hash}`;
      }
    }
  }, []);

  return null;
}
