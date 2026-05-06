import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivmjlizqwwcjvizyoryi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bWpsaXpxd3djanZpenlvcnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjQ2MDcsImV4cCI6MjA5MzY0MDYwN30.W0GxJKViQIOTvuGc99KEEGT9VL9GafwLUlD06s2DhiY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  PROMOCODES: 'promocodes',
  STATS: 'stats'
};