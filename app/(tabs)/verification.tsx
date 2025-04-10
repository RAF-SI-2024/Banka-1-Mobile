
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAllTransfers, Transfer } from '../services/axiosBanking';
import apiUser, { getUserIdFromToken } from '../services/axiosUser';

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

const OTP_TTL = 5 * 60 * 1000;
const POLL_INTERVAL = 2000;

export default function VerificationScreen() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  
  useEffect(() => {
    (async () => {
      const uid = await getUserIdFromToken();
      if (!uid) return setLoadingUser(false);
      try {
        const res = await apiUser.get(`/api/customer/${uid}`);
        setUser(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);


  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Fetch transfera
  const fetchTransfers = useCallback(async () => {
    setRefreshing(true);
    try {
      const all = await getAllTransfers();
      // filtriraj provizije (Promena valute)
      const filtered = all.filter(t => t.paymentDescription !== 'Promena valute');
      setTransfers(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
    const poll = setInterval(fetchTransfers, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [fetchTransfers]);

  useFocusEffect(useCallback(() => { fetchTransfers(); }, [fetchTransfers]));

  // sortiraj PENDING prvo, ostali po createdAt desc
  const sorted = [...transfers].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return b.createdAt - a.createdAt;
  });

  if (loadingUser) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  const renderItem = ({ item }: { item: Transfer }) => {
    const { amount, receiver, adress, fromCurrency, status, createdAt, otp, toAccountId } = item;
    const createdDate = new Date(createdAt).toLocaleString();

    // odredi primaoca:
    let displayReceiver: string;
    if (receiver) {
      displayReceiver = receiver;
    } else if (user && toAccountId.ownerID === user.id) {
      displayReceiver = `${user.firstName} ${user.lastName}`;
    } else {
      displayReceiver = toAccountId.accountNumber;
    }

    // countdown za OTP
    let countdown = '';
    if (status === 'PENDING' && otp) {
      const ms = createdAt + OTP_TTL - now;
      countdown = ms > 0
        ? `${Math.floor(ms/60000)}:${Math.floor((ms%60000)/1000).toString().padStart(2,'0')}`
        : 'EXPIRED';
    }

    return (
      <View style={styles.card}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        <Text style={styles.dateText}>Created: {createdDate}</Text>

        <Text style={styles.label}>Receiver:</Text>
        <Text style={styles.value}>{displayReceiver}</Text>
        <Text style={styles.subValue}>Account #: {toAccountId.accountNumber}</Text>

        {adress && <>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{adress}</Text>
        </>}

        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.value}>{amount} {fromCurrency.code}</Text>

        {status === 'PENDING' && otp && (
          <View style={styles.otpContainer}>
            <Text style={styles.otpText}>{otp.toUpperCase()}</Text>
            <Text style={styles.countdownText}>Expires in: {countdown}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfers</Text>
      <FlatList
        contentContainerStyle={{ paddingTop: 16 }}
        data={sorted}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTransfers} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No transfers.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#1E2432' },
  title: {
    fontSize:22,
    fontWeight:'bold',
    marginTop: 60,
    marginBottom:16,
    textAlign:'center',
    color:'white'
  },
  card: {
    backgroundColor:'#fff',
    padding:18,
    borderRadius:12,
    marginHorizontal:16,
    marginBottom:12,
    elevation:3
  },
  statusText: {
    fontSize:18,
    fontWeight:'bold',
    textTransform:'uppercase',
    textAlign:'center',
    color:'#d32f2f'
  },
  dateText: {
    fontSize:12,
    color:'#888',
    marginBottom:8,
    textAlign:'center'
  },
  label: {
    fontSize:14,
    color:'#555',
    marginTop:4
  },
  value: {
    fontSize:16,
    marginBottom:4
  },
  subValue: {
    fontSize:14,
    color:'#777',
    marginBottom:8
  },
  otpContainer: {
    marginTop:12,
    alignItems:'center',
    backgroundColor:'#e8f4fd',
    padding:12,
    borderRadius:8
  },
  otpText: {
    fontSize:32,
    fontWeight:'bold',
    textTransform:'uppercase',
    marginBottom:4
  },
  countdownText: {
    fontSize:14,
    color:'#555'
  },
  emptyText: {
    textAlign:'center',
    marginTop:40,
    color:'#888'
  },
});
