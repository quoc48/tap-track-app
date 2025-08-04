// src/lib/authHelper.ts
import { supabase } from './supabase';

export class AuthHelper {
  // Guest auth với email cố định
  static async signInAsGuest(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Attempting guest sign in...');
      
      const guestEmail = 'guest@taptrack.app';
      const guestPassword = 'guestpassword123';
      
      // Try sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });
      
      if (!signInError && signInData.user) {
        console.log('✅ Guest email sign in successful');
        return { success: true };
      }
      
      // If sign in fails, try sign up
      console.log('🔄 Guest account not found, creating...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          emailRedirectTo: undefined, // Skip email verification
        }
      });
      
      if (signUpError) {
        console.error('❌ Guest sign up failed:', signUpError);
        return { success: false, error: signUpError.message };
      }
      
      console.log('✅ Guest account created');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Auth helper failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}