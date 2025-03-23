import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Clipboard } from 'react-native';

const generateCode = () => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function MenuScreen() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    const newCode = generateCode();
    const expiry = Date.now() + 5 * 60 * 1000; 
    setCode(newCode);
    setExpiresAt(expiry);
    setAttempts(0);
    Alert.alert('Code generated.', `Your code: ${newCode}`);
  };

  const handleCopy = () => {
    if (code) {
      Clipboard.setString(code);
      Alert.alert('Copied', 'Copied to clipboard.');
    }
  };

  const getRemainingTime = () => {
    if (!expiresAt) return null;
    const ms = expiresAt - Date.now();
    if (ms <= 0) return 'Code expired.';
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification</Text>

      <Button title="Verify transaction" onPress={handleVerify} color="#2E7D32" />

      {code && (
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>Code: {code}</Text>
          <Text style={styles.timerText}>Valid for: {getRemainingTime()}</Text>
          <Button title="Copy code" onPress={handleCopy} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1E88E5',
  },
  timerText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
});
