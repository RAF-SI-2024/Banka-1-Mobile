import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import { Card } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AccountCarousel from "@/components/accountcarousel";
import { getUserIdFromToken } from "../services/axiosUser";
import {
  fetchAccountsId,
  fetchAccountsTransactions,
} from "../services/axiosBanking";
import FastPayments from "@/components/fastPayment";

const { width } = Dimensions.get("window");

type Transaction = {
  receiverAccount: string;
  amount: number;
  currency: string;
  direction: "incoming" | "outgoing";
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
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);

  // 1) Učitaj račune SAMO JEDNOM pri mount-u, i inicijalno postavi selectedAccountId
  useEffect(() => {
    let isActive = true;
    (async () => {
      setLoadingAccounts(true);
      const uid = await getUserIdFromToken();
      if (!uid) {
        isActive && setLoadingAccounts(false);
        return;
      }
      try {
        const accs = await fetchAccountsId(uid);
        if (isActive) {
          setAccounts(accs);
          if (!selectedAccountId && accs.length) {
            setSelectedAccountId(accs[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        isActive && setLoadingAccounts(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);

  // 2) Fetch transakcija + refresh accounts kad god se promeni selectedAccountId ili screen dobije fokus
  const loadTransactionsAndRefreshAccounts = useCallback(async () => {
    if (!selectedAccountId) {
      setLoadingTransactions(false);
      return;
    }
    setLoadingTransactions(true);
    try {
      // 2a) Povuci transakcije
      const list: any[] = await fetchAccountsTransactions(selectedAccountId);
      const formatted: Transaction[] = list
        .map((t) => {
          const incoming = selectedAccountId === t.toAccountId.id.toString();
          return {
            receiverAccount: t.toAccountId.accountNumber,
            amount: parseFloat(t.amount.toFixed(2)),
            currency: t.currency.code,
            direction: incoming ? "incoming" : "outgoing",
            timestamp: t.timestamp,
          } as Transaction;
        })
        .sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);
      setTransactions(formatted);

      // 2b) Refresh accounts da bi se balans ažurirao
      const uid = await getUserIdFromToken();
      if (uid) {
        const accs = await fetchAccountsId(uid);
        setAccounts(accs);
      }
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, [selectedAccountId]);

  useFocusEffect(
    useCallback(() => {
      loadTransactionsAndRefreshAccounts();
    }, [loadTransactionsAndRefreshAccounts])
  );

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
      {/* Header + Carousel */}
      <Card style={styles.headerCard}>
        <Text style={styles.headerText}>Transaction Report</Text>
        <View style={styles.carouselWrapper}>
          <AccountCarousel
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onAccountChange={setSelectedAccountId}
          />
          {loadingAccounts && (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              color="white"
              size="large"
            />
          )}
        </View>
      </Card>

      <FastPayments />

      {/* Transactions list */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
            justifyContent:
              !loadingTransactions && transactions.length === 0
                ? "center"
                : "flex-start",
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loadingTransactions ? (
              <Text style={styles.emptyText}>
                No transactions for this account.
              </Text>
            ) : null
          }
          ListFooterComponent={
            loadingTransactions ? (
              <ActivityIndicator style={{ margin: 16 }} color="#1E2432" />
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerCard: {
    backgroundColor: "#1E2432",
    width: "100%",
    paddingTop:125,
    paddingVertical: 40,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  carouselWrapper: {
    height: 150,
    justifyContent: "center",
    width: "100%",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    paddingTop:25,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E2432",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
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
