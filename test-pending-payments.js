// Simple test to verify the pending payments endpoint integration
import { fetchPendingPayments } from './src/services/reportService.js';

const testPendingPayments = async () => {
  try {
    console.log('Testing pending payments endpoint...');
    
    const result = await fetchPendingPayments({
      limit: 10
    });
    
    console.log('Result:', result);
    
    if (result.success) {
      console.log(`✅ Success! Found ${result.data.length} pending payments`);
      console.log('Sample data:', JSON.stringify(result.data[0], null, 2));
    } else {
      console.log('❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Export for manual testing
export { testPendingPayments };