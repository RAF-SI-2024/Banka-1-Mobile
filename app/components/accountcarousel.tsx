import React, { useState } from "react";
import { View, Text, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

type Account = {
    id: string;
    subtype: string;
    number: string;
    balance: string;
};


type AccountCarouselProps = {
    accounts: Account[];
    onAccountChange: (id: string) => void;
};

const AccountCarousel: React.FC<AccountCarouselProps> = ({ accounts, onAccountChange }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        if (index !== activeIndex && accounts[index]) {
            setActiveIndex(index);
            onAccountChange(accounts[index].id);
        }
    };

    return (
        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={200}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ alignItems: "center" }}
        > 
            {accounts.length > 0 ? (
                accounts.map((account) => (
                    <Card
                        key={account.id}
                        style={{
                            width: width * 0.9,
                            marginHorizontal: width * 0.05,
                            backgroundColor: "white",
                            padding: 16,
                            borderRadius: 12,
                            height: 130,  
                            marginTop: -50,
                            position: "relative",
                        }}
                    >
                         <Ionicons
                            name="card-outline"
                            size={30}
                            color="#1E2432"
                            style={{
                                position: "absolute",
                                left: 10,
                            }}
                        />
                        <Text style={{ color: "#1E2432", fontSize: 18, fontWeight: "bold", alignSelf: 'center' }}>{account.subtype}</Text>
                        <Text style={{ color: "#1E2432", marginTop: 4, alignSelf: 'center' }}>{account.number}</Text>
                        <Text style={{ color: "#1E2432", fontSize: 16, marginTop: 15, alignSelf: 'center' }}>Available:</Text>
                        <Text style={{ color: "#1E2432", fontSize: 22, fontWeight: "bold" , alignSelf: 'center'}}>{account.balance}</Text>
                    </Card>
                    
                ))
            ) : (
                <View style={{ width: width * 0.9, marginHorizontal: width * 0.05, alignItems: "center", padding: 20 }}>
                    <Text style={{ color: "white", fontSize: 18 }}>No accounts available</Text>
                </View>
            )} 
        </ScrollView>
    );
};

export default AccountCarousel;
