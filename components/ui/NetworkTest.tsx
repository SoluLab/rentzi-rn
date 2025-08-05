import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from './Button';
import { Typography } from './Typography';
import { testNetworkConnectivity } from '@/services/apiClient';
import { API_URLS } from '@/constants/urls';

export const NetworkTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);

  const testEndpoints = [
    { name: 'Renter API', url: `${API_URLS.AUTH_API_RENTER}/auth/signin` },
    { name: 'Homeowner API', url: `${API_URLS.AUTH_API_HOMEOWNER}/auth/signin` },
  ];

  const runNetworkTest = async () => {
    setIsTesting(true);
    const results: Record<string, boolean> = {};

    for (const endpoint of testEndpoints) {
      console.log(`[NetworkTest] Testing ${endpoint.name}...`);
      const isConnected = await testNetworkConnectivity(endpoint.url);
      results[endpoint.name] = isConnected;
      setTestResults({ ...results });
    }

    setIsTesting(false);
  };

  return (
    <View style={styles.container}>
      <Typography variant="h4" style={styles.title}>
        Network Connectivity Test
      </Typography>
      
      <Button
        title={isTesting ? "Testing..." : "Test Network"}
        onPress={runNetworkTest}
        disabled={isTesting}
        style={styles.testButton}
      />

      <View style={styles.results}>
        {testEndpoints.map((endpoint) => (
          <View key={endpoint.name} style={styles.resultItem}>
            <Typography variant="body" style={styles.endpointName}>
              {endpoint.name}:
            </Typography>
            <Typography
              variant="body"
              style={[
                styles.status,
                testResults[endpoint.name] === true
                  ? styles.success
                  : testResults[endpoint.name] === false
                  ? styles.error
                  : styles.pending
              ]}
            >
              {testResults[endpoint.name] === true
                ? "✅ Connected"
                : testResults[endpoint.name] === false
                ? "❌ Failed"
                : "⏳ Not tested"}
            </Typography>
          </View>
        ))}
      </View>

      <Typography variant="caption" style={styles.note}>
        Check console logs for detailed error information
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  testButton: {
    marginBottom: 16,
  },
  results: {
    gap: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  endpointName: {
    fontWeight: '600',
  },
  status: {
    fontWeight: '500',
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  pending: {
    color: '#9E9E9E',
  },
  note: {
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 