import * as mysqlService from './src/services/mysqlService.js';

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    const result = await mysqlService.testConnection();
    console.log('Connection test result:', result);
  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

testConnection();