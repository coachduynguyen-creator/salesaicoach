import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://zylhbymktdtmitxsunqv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bAPWC5uJXV_3Iu_C0TJS1w_TGsGS6qQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
