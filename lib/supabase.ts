import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

// Recovery emails configured with the Site URL may return to the homepage.
// Move the URL to the reset screen without reloading or losing its tokens.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if ((query.get('type') === 'recovery' || hash.get('type') === 'recovery') &&
      window.location.pathname !== '/reset-password') {
    window.history.replaceState(window.history.state, '',
      '/reset-password' + window.location.search + window.location.hash);
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;


 
const CHUNK_SIZE = 1800;

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(`${key}.count`);
    if (!count) return null;

    const parts: string[] = [];
    for (let i = 0; i < Number(count); i += 1) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part === null) return null; 
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    await secureStorage.removeItem(key);

    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? [];
    for (let i = 0; i < chunks.length; i += 1) {
      await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
    }
    await SecureStore.setItemAsync(`${key}.count`, String(chunks.length));
  },

  async removeItem(key: string): Promise<void> {
    const count = await SecureStore.getItemAsync(`${key}.count`);
    if (count) {
      for (let i = 0; i < Number(count); i += 1) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }
    await SecureStore.deleteItemAsync(`${key}.count`);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS === 'web' ? {} : { storage: secureStorage }),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});


if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}