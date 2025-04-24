import React, { useRef, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Card, Text } from "react-native-paper";

const { width } = Dimensions.get("window");

type Account = {
  id: string;
  subtype: string;
  number: string;
  balance: string;
};

type Props = {
  accounts: Account[];
  selectedAccountId: string;
  onAccountChange: (id: string) => void;
};

export default function AccountCarouselFlatList({ accounts, selectedAccountId, onAccountChange }: Props) {
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
        const idx = accounts.findIndex(acc => acc.id === selectedAccountId);
        if (idx >= 0) {
          flatRef.current?.scrollToIndex({
            index: idx,
            animated: true,
          });
       }
    }, [selectedAccountId, accounts]);

  // Širina jedne kartice je 85% ekrana
  const CARD_WIDTH = width * 0.85;
  // Razmak između kartica
  const SPACING = 16;
  // Padding da prva i poslednja budu centrirane
  const SIDE_PADDING = (width - CARD_WIDTH) / 2;

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / (CARD_WIDTH + SPACING));
    if (accounts[idx]) onAccountChange(accounts[idx].id);
  };

  const renderItem = ({ item }: { item: Account }) => (
    <TouchableOpacity activeOpacity={0.8}>
      <Card style={[styles.card, { width: CARD_WIDTH }]}>
        <Text style={styles.title}>{item.subtype}</Text>
        <Text style={styles.number}>{item.number}</Text>
        <Text style={styles.label}>Available:</Text>
        <Text style={styles.balance}>{item.balance}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <FlatList
      ref={flatRef}
      horizontal
      data={accounts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SIDE_PADDING,
      }}
      ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      snapToInterval={CARD_WIDTH + SPACING}
      decelerationRate="fast"
      onMomentumScrollEnd={onMomentumScrollEnd}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    height: 140,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  number: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    // Omogućavamo wrap teksta ukoliko je broj predugačak
    flexWrap: "wrap",
    // Ili, ukoliko više voliš da se broj smanji umesto wrap-a:
    flexShrink: 1,
  },
  label: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
  balance: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
});
