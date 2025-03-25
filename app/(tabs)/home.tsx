import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions, Image } from "react-native";
import { Card } from "react-native-paper";
import AccountCarousel from "@/components/accountcarousel";
import { getUserIdFromToken } from "../services/axiosUser";
import { fetchAccountsId } from "../services/axiosBanking";

const { width } = Dimensions.get("window");

type Transaction = {
  receiverAccount: string;
  amount: string;
  currency: string;
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

  useEffect(() => {
    const fetchAccounts = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      try {
        const accountList = await fetchAccountsId(userId);
        setAccounts(accountList);
        if (accountList.length > 0) {
          setSelectedAccountId(accountList[0].id);
        }
      } catch (error) {
        console.error("Greška pri dobavljanju računa:", error);
      }
    };

    fetchAccounts();
  }, []);

  // Automatski osveži transakcije kada se promeni izabrani račun
  useEffect(() => {
    const fetchTransactionsForAccount = async () => {
      setTransactions([]); // trenutno prazno
    };

    if (selectedAccountId) {
      fetchTransactionsForAccount();
    }
  }, [selectedAccountId]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 120 }}>
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
        source={require('../../assets/images/avatar.png')}
        style={{
          position: 'absolute',
          top: 80,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: 25,
        }}
      />

      <Text style={{ color: "white", fontSize: 24, position: 'absolute', top: 90, left: 70, fontWeight: 'bold' }}>
        Welcome!
      </Text>
      <Text style={{ color: "white", fontSize: 24, textAlign: "center", marginTop: 30 }}>
        Transaction Report
      </Text>

      <AccountCarousel accounts={accounts} onAccountChange={setSelectedAccountId} />

      <Text style={{
        color: "black",
        textAlign: "left",
        marginTop: 5,
        fontSize: 20,
        marginLeft: 15,
        marginBottom: 10,
        fontWeight: 'bold'
      }}>
        Recent Transactions
      </Text>

      <ScrollView>
        {transactions.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888' }}>No transactions available.</Text>
        ) : (
          transactions.map((transaction, index) => (
            <Card key={index} style={{ backgroundColor: "#1E2432", margin: 10, padding: 16, borderRadius: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "white", fontSize: 16 }}>{transaction.receiverAccount}</Text>
                <Text style={{ color: "white", fontSize: 16 }}>{transaction.amount} {transaction.currency}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default MobileAccountTransaction;
