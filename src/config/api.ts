// Configuration for API usage
export const API_CONFIG = {
  // Set to true to use mock data, false to use real Firestore
  USE_MOCK_DATA: false,
  // Set to true to use Firestore directly, false to use REST API
  USE_FIRESTORE: true,
  
  // API Base URL (for future REST API integration)
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://us-central1-growup-513e7.cloudfunctions.net/api'
    : 'http://localhost:5001/growup-513e7/us-central1/api',
    
  // Mock data configuration
  MOCK_CONFIG: {
    // Simulate API delays (in milliseconds)
    API_DELAY: 500,
    
    // Simulate API failures
    FAILURE_RATE: 0, // 0 = no failures, 1 = always fail
    
    // Pagination defaults
    DEFAULT_PAGE_SIZE: 10,
  }
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = API_CONFIG.MOCK_CONFIG.API_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to simulate API failures
export const shouldSimulateFailure = (): boolean => {
  return Math.random() < API_CONFIG.MOCK_CONFIG.FAILURE_RATE;
};