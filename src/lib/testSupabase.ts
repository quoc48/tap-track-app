// src/lib/testSupabase.ts - ENHANCED DEBUG VERSION
import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check auth status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('🔐 Auth session:', session ? 'Authenticated' : 'Anonymous');
    console.log('🔐 Auth error:', authError);
    
    // Test 2: Basic connection với detailed error
    const { data, error, status, statusText } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    console.log('📊 Basic query status:', status);
    console.log('📊 Basic query statusText:', statusText);
    console.log('📊 Basic query data:', data);
    console.log('📊 Basic query error:', error);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // Test 3: Get categories với chi tiết
    const { data: categories, error: catError, status: catStatus } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    console.log('📁 Categories query status:', catStatus);
    console.log('📁 Categories query error:', catError);
    console.log('📁 Categories query data:', categories);
    
    if (catError) {
      console.error('❌ Categories fetch failed:', catError);
      console.error('❌ Categories error details:', JSON.stringify(catError, null, 2));
      return false;
    }
    
    console.log('✅ Categories fetched:', categories?.length || 0);
    if (categories && categories.length > 0) {
      console.log('✅ Sample category:', categories[0]);
    } else {
      console.log('⚠️ No categories returned - possible RLS issue');
    }
    
    // Test 4: Raw SQL query để bypass RLS
    console.log('🔧 Testing raw SQL query...');
    const { data: rawData, error: rawError } = await supabase
      .rpc('get_categories_count');
    
    console.log('🔧 Raw query result:', rawData);
    console.log('🔧 Raw query error:', rawError);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    console.error('❌ Exception details:', JSON.stringify(error, null, 2));
    return false;
  }
};