import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rbcpejxugsumgvpkobda.supabase.co';
const supabaseAnonKey = 'sb_publishable_z-AvNw_IGbKb56zu6ddTBg_YJTkIlMj';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('settings').select('*').limit(1);
    console.log('Data:', data);
    console.log('Error:', error);
}

check();
