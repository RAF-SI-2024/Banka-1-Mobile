import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, FlatList } from 'react-native';
import axiosTransactions from '../services/axiosBanking';
import { getUserIdFromToken } from '../services/axiosUser';

const generateCode = () => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const VerificationScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeCodes, setActiveCodes] = useState<{ [id: number]: { code: string, expiresAt: number } }>({});
  const [completed, setCompleted] = useState<number[]>([]);
  const [ignored, setIgnored] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;
      try {
        const response = await axiosTransactions.get(`/transactions/${userId}`);
        const all = response.data.data.data || [];
        const pending = all.filter((tx: any) => tx.status === 'PENDING');
        setTransactions(pending);
      } catch (error) {
        console.error("Greška pri dobavljanju transakcija:", error);
      }
    };
    fetchData();
  }, []);

  const sendCodeToBackend = async (transakcijaId: number, otpKod: string) => {
    try {
      const response = await axiosTransactions.post('/otp/verification', {
        transakcijaId,
        otpKod,
      });

      if (response.data.success) {
        Alert.alert('Uspešno', 'Transakcija verifikovana.');
        setCompleted(prev => [...prev, transakcijaId]);
        setActiveCodes(prev => {
          const updated = { ...prev };
          delete updated[transakcijaId];
          return updated;
        });
      } else {
        Alert.alert('Greška', response.data.error || 'Verifikacija nije uspela.');
      }
    } catch (error) {
      console.error('Greška pri verifikaciji:', error);
      Alert.alert('Greška', 'Neuspešna konekcija ili greška na serveru.');
    }
  };

  const handleApprove = (transakcijaId: number) => {
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    setActiveCodes(prev => ({ ...prev, [transakcijaId]: { code, expiresAt } }));
    sendCodeToBackend(transakcijaId, code);
  };

  const handleIgnore = (transakcijaId: number) => {
    setIgnored(prev => [...prev, transakcijaId]);
    setActiveCodes(prev => {
      const updated = { ...prev };
      delete updated[transakcijaId];
      return updated;
    });
  };

  const getRemainingTime = (expiresAt: number) => {
    const ms = expiresAt - Date.now();
    if (ms <= 0) return 'Istekao';
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    if (completed.includes(item.id) || ignored.includes(item.id)) return null;
    const otpData = activeCodes[item.id];
    return (
      <View style={styles.card}>
        <Text style={styles.text}>Transfer ID: {item.id}</Text>
        <View style={styles.buttonRow}>
          <Button title="Approve" onPress={() => handleApprove(item.id)} color="#2E7D32" />
          <Button title="Ignore" onPress={() => handleIgnore(item.id)} color="#E53935" />
        </View>
        {otpData && (
          <View style={styles.otpBox}>
            <Text style={styles.codeText}>Kod: {otpData.code}</Text>
            <Text style={styles.timerText}>Važi još: {getRemainingTime(otpData.expiresAt)}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zahtevi za verifikaciju</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nema zahteva za potvrdu.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  otpBox: {
    marginTop: 10,
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
});

export default VerificationScreen;
