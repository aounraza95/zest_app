import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzsrrtmrnzkegebzcfih.supabase.co';
const supabaseAnonKey = 'sb_publishable_IzDE3x11CpjhWj1MKtihHQ_0tO-5BM4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
