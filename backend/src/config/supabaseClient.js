const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'dummy-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'dummy-key';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
