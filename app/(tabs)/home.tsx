
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import { Card } from "react-native-paper";
import AccountCarousel from "@/components/accountcarousel";
import { getUserIdFromToken } from "../services/axiosUser";
import {
  fetchAccountsId,
  fetchAccountsTransactions,
} from "../services/axiosBanking";

const { width } = Dimensions.get("window");

type Transaction = {
  receiverAccount: string;
  amount: number;
  currency: string;
  direction: string;
  timestamp: number;
};

type Account = {
  id: string;
  subtype: string;
  number: string;
  balance: string;
};

export default function MobileAccountTransaction() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // 1) Učitaj račune
  useEffect(() => {
    (async () => {
      const uid = await getUserIdFromToken();
      if (!uid) {
        setLoadingAccounts(false);
        return;
      }
      try {
        const accs = await fetchAccountsId(uid);
        setAccounts(accs);
        if (accs.length) setSelectedAccountId(accs[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, []);

  // 2) Učitaj transakcije kad se promeni selectedAccountId
  const loadTransactions = useCallback(async () => {
    if (!selectedAccountId) {
      setLoadingTransactions(false);
      return;
    }
    setLoadingTransactions(true);
    try {
      const list = await fetchAccountsTransactions(selectedAccountId);
      const formatted = list
        .map((t: any) => {
          const incoming = Number(selectedAccountId) === t.toAccountId.id;
          return {
            receiverAccount: t.toAccountId.accountNumber,
            amount: t.amount,
            currency: t.currency.code,
            direction: incoming ? "incoming" : "outgoing",
            timestamp: t.timestamp,
          } as Transaction;
        })
        .sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);
      setTransactions(formatted);
    } catch (e) {
      console.error(e);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <Card style={styles.txCard}>
      <View style={styles.txRow}>
        <Text style={styles.txReceiver}>{item.receiverAccount}</Text>
        <Text
          style={[
            styles.txAmount,
            { color: item.direction === "incoming" ? "green" : "red" },
          ]}
        >
          {item.direction === "incoming" ? "+" : "-"}
          {item.amount} {item.currency}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* A) Header + Carousel */}
      <Card style={styles.headerCard}>
        <Text style={styles.headerText}>Transaction Report</Text>
        {loadingAccounts ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.carouselWrapper}>
            <AccountCarousel
              accounts={accounts}
              onAccountChange={setSelectedAccountId}
            />
          </View>
        )}
      </Card>

      {/* B) Lista ispod */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recent Transactions</Text>
        {loadingTransactions ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#1E2432" />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  
  headerCard: {
    backgroundColor: "#1E2432",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 130,
    paddingHorizontal: 16,
    justifyContent:'center',
    alignSelf: "center",
    
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  // Ograničavamo visinu carousel wrappera
  carouselWrapper: {
    height: 200,
    justifyContent: "center",
    alignSelf: 'center'
  },
  

  listContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 8,    // malo manje razmaka
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E2432",
  },

  txCard: {
    backgroundColor: "#1E2432",
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txReceiver: { color: "white", fontSize: 16 },
  txAmount: { fontSize: 16, fontWeight: "bold" },
});
