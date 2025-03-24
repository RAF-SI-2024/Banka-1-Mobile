import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { Card } from "react-native-paper";
import AccountCarousel from "@/components/accountcarousel";
import { Image } from "react-native";
import { Asset } from "expo-asset";

const { width } = Dimensions.get("window");
const avatar = Asset.fromModule(require('/Users/brankadelic/Desktop/mobile/Banka-1-Mobile/assets/images/avatar.png')).uri;


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

type Transactions = {
    [key: string]: Transaction[];
};


const mockAccounts: Account[] = [
    { id: "1", subtype: "Checking Account", number: "**** 1234", balance: "$3,469.52" },
    { id: "2", subtype: "Savings Account", number: "**** 5678", balance: "$12,540.75" },
    { id: "3", subtype: "Business Account", number: "**** 9101", balance: "$7,320.10" },
];

const mockTransactions : Transactions= {
    "1": [
        { receiverAccount: "**** 5678", amount: "$500.00", currency: "USD" },
        { receiverAccount: "**** 9101", amount: "$200.00", currency: "USD" },
    ],
    "2": [
        { receiverAccount: "**** 1234", amount: "$1,000.00", currency: "USD" },
        { receiverAccount: "**** 9101", amount: "$300.00", currency: "USD" },
    ],
    "3": [
        { receiverAccount: "**** 1234", amount: "$750.00", currency: "USD" },
        { receiverAccount: "**** 5678", amount: "$450.00", currency: "USD" },
    ],
};


const MobileAccountTransaction: React.FC = () => {
    const [selectedAccountId, setSelectedAccountId] = useState<string>(mockAccounts[0]?.id || "");
    const [transactions, setTransactions] = useState(mockTransactions[selectedAccountId]);

    useEffect(() => {
        // Simulate fetching transactions based on selectedAccountId
        const fetchTransactions = () => {
            setTransactions(mockTransactions[selectedAccountId]);
        };

        fetchTransactions();
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
                source={{ uri: avatar }} 
                style={{
                    position: 'absolute', 
                    top: 80, 
                    left: 20, 
                    width: 50, 
                    height: 50, 
                    borderRadius: 25
                }} 
            />
            <Text style={{ color: "white", fontSize: 24, position: 'absolute', top: 90, left: 70, marginBottom: 50, fontWeight:'bold' }}> Welcome!</Text>
            <Text style={{ color: "white", fontSize: 24, textAlign: "center", marginTop: 30 }}>Transaction Report</Text>
            <AccountCarousel accounts={mockAccounts} onAccountChange={setSelectedAccountId} />
            
            <Text style={{ color: "black", textAlign: "left", marginTop: 5, fontSize:20, marginLeft: 15, marginBottom: 10, fontWeight: 'bold' }}>
                Recent Transactions
            </Text>


            <ScrollView>
                   {transactions?.map((transaction, index) => (
                         <Card key={index} style={{ backgroundColor: "#1E2432", margin: 10, padding: 16, borderRadius: 12 }}>
                               <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ color: "white", fontSize: 16 }}>{transaction.receiverAccount}</Text>
                                <Text style={{ color: "white", fontSize: 16 }}>{transaction.amount} {transaction.currency}</Text>
                              </View>
                     </Card>
             ))}
            </ScrollView>


        </View>
    );
};

export default MobileAccountTransaction;
