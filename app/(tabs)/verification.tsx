import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

const generateCode = () => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function VerificationScreen() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const transakcijaId = 1; //mock trenutno

  const sendCodeToBackend = async (otpKod: string) => {
    try {
      const response = await fetch('http://localhost:8082/otp/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transakcijaId,
          otpKod,
        }),
      });

      if (response.ok) {
        Alert.alert('Uspešno', 'Kod je uspešno poslat i verifikovan.');
      } else {
        const errorText = await response.text();
        Alert.alert('Greška', `Verifikacija nije uspela:\n${errorText}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Greška', 'Greška pri povezivanju sa serverom.');
    }
  };

  const handleVerify = () => {
    const newCode = generateCode();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minuta
    setCode(newCode);
    setExpiresAt(expiry);

    sendCodeToBackend(newCode);
  };

  const getRemainingTime = () => {
    if (!expiresAt) return null;
    const ms = expiresAt - Date.now();
    if (ms <= 0) return 'Kod je istekao.';
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikacija transakcije</Text>
      <Button title="Generiši i Pošalji Kod" onPress={handleVerify} color="#2E7D32" />

      {code && (
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>Kod: {code}</Text>
          <Text style={styles.timerText}>Važi još: {getRemainingTime()}</Text>
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
