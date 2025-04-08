import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions, Image, ActivityIndicator } from "react-native";
import { Card } from "react-native-paper";
import AccountCarousel from "@/components/accountcarousel";
import { getUserIdFromToken } from "../services/axiosUser";
import { fetchAccountsId, fetchAccountsTransactions } from "../services/axiosBanking";

const { width, height } = Dimensions.get("window");

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

const MobileAccountTransaction: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) {
        setLoadingAccounts(false);
        return;
      }

      try {
        const accountList = await fetchAccountsId(userId);
        setAccounts(accountList);
        if (accountList.length > 0) {
          setSelectedAccountId(accountList[0].id);
        }
      } catch (error) {
        console.error("Greška pri dobavljanju računa:", error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchTransactionsForAccount = async () => {
      if (!selectedAccountId) {
        console.warn("No selected account ID. Skipping transaction fetch.");
        setLoadingTransactions(false);
        return;
      }

      try {
        console.log(`Fetching transactions for account ID: ${selectedAccountId}`);
        const transactionList = await fetchAccountsTransactions(selectedAccountId);

        if (!transactionList || !Array.isArray(transactionList)) {
          console.error("Unexpected transactionList format:", transactionList);
          setTransactions([]);
          return;
        }

        console.log("Raw transactions:", JSON.stringify(transactionList, null, 2));

        const selectedAccId = Number(selectedAccountId);
        const formattedTransactions = transactionList.map((t: any) => {
          // Ako je selectedAccId jednak t.toAccountId.id, onda je transakcija incoming
          const isIncoming = selectedAccId === t?.toAccountId?.id;
          return {
            receiverAccount: t?.toAccountId?.accountNumber ?? "Unknown",
            amount: t?.amount ?? 0,
            currency: t?.currency?.code ?? "N/A",
            direction: isIncoming ? "incoming" : "outgoing",
            timestamp: t?.timestamp,
          };
        });

        console.log(formattedTransactions);

        const sortedTransactions = formattedTransactions.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        setTransactions(sortedTransactions);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn(`No transactions found for account ${selectedAccountId}`);
        } else {
          console.error("Error fetching transactions:", error);
        }
        setTransactions([]);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactionsForAccount();
  }, [selectedAccountId]);

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 120 }}>
      {/* Gornji fiksirani deo */}
      <Card
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          backgroundColor: "#1E2432",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          padding: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 12, textAlign: "center", marginBottom: 0 }}></Text>
      </Card>

      <Image
        source={require("../../assets/images/avatar.png")}
        style={{
          position: "absolute",
          top: 80,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: 25,
        }}
      />

      <Text
        style={{
          color: "white",
          fontSize: 24,
          position: "absolute",
          top: 90,
          left: 70,
          fontWeight: "bold",
        }}
      >
        Welcome!
      </Text>
      <Text style={{ color: "white", fontSize: 24, textAlign: "center", marginTop: 30 }}>
        Transaction Report
      </Text>

      {/* Ako se računi još učitavaju, prikazujemo ActivityIndicator */}
      {loadingAccounts ? (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <ActivityIndicator size="large" color="#1E2432" />
        </View>
      ) : (
        <AccountCarousel accounts={accounts} onAccountChange={setSelectedAccountId} />
      )}

      <View style={{ flex: 1, marginTop: 40, top: -100 }}>
        <Text
          style={{
            color: "black",
            textAlign: "left",
            fontSize: 20,
            marginLeft: 15,
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          Recent Transactions
        </Text>

        {/* Ako se transakcije učitavaju, prikazujemo ActivityIndicator */}
        <View style={{ flex: 1, minHeight: 300 }}>
          {loadingTransactions ? (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <ActivityIndicator size="large" color="#1E2432" />
            </View>
          ) : (
            <ScrollView>
              {transactions.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#888", marginTop: 50 }}>
                  No transactions available.
                </Text>
              ) : (
                transactions.map((transaction, index) => (
                  <Card
                    key={index}
                    style={{
                      backgroundColor: "#1E2432",
                      margin: 10,
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: "white", fontSize: 16 }}>{transaction.receiverAccount}</Text>
                      <Text
                        style={{
                          color: transaction.direction === "incoming" ? "green" : "red",
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        {transaction.direction === "incoming" ? "+" : "-"}
                        {transaction.amount} {transaction.currency}
                      </Text>
                    </View>
                  </Card>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

export default MobileAccountTransaction;
