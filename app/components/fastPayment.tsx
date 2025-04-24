// components/FastPayments.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Avatar, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { fetchRecipientsForFast } from "../services/axiosBanking";
import { getUserIdFromToken } from "../services/axiosUser";

type Recipient = {
  id: number;
  firstName: string;
  lastName: string;
  accountNumber: string;
  address?: string;
  usageCount?: number;
};

type RecipientForm = Omit<Recipient, "id" | "usageCount">;

export default function FastPayments() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const [addVisible, setAddVisible] = useState(false);
  const [newRec, setNewRec] = useState<RecipientForm>({
    firstName: "",
    lastName: "",
    accountNumber: "",
    address: "",
  });


  useEffect(() => {
    (async () => {
      try {
        const uid = await getUserIdFromToken();
        if (!uid) throw new Error("No user ID");
        const data = await fetchRecipientsForFast(uid);
        // sort by usageCount desc and take top 3
        const top3 = data
          .sort((a:Recipient, b:Recipient) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 3);
        setRecipients(top3);
      } catch (e) {
        console.error(e);
        setError("Failed to load fast payments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getInitials = (r: Recipient) => {
    const f = r.firstName?.[0] ?? "?";
    const l = r.lastName?.[0] ?? "?";
    return `${f}`.toUpperCase();
  };

  const handleAdd = () => {
    // prazan recipient -> otvorimo new-payment bez params
    router.push({
      pathname: "/new-payment",
    });
  };

  const handleSelect = (r: Recipient) => {
    // pređemo na new-payment i šaljemo recipijenta
    router.push({
      pathname: "/new-payment",
      params: { recipient: JSON.stringify(r) },
    });
  };

  return (
    <View style={styles.container}>
        <Text style={styles.listTitle}>Fast Payment</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.row}>

          {/* Top 3 recipient */}
          {recipients.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.circle1}
              onPress={() => handleSelect(r)}
            >
              <Avatar.Text style={styles.name1} size={48} label={getInitials(r)} />
              <Text style={styles.name} numberOfLines={2}>
                {r.firstName} {r.lastName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
    listTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1E2432",
      },
  container: {
    padding: 16,
    top:12,
    left: 6,
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  circle: {
    alignItems: "center",
  },
  circle1: {
    alignItems: "center"
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#1E2432",
    justifyContent: "center",
  },
  addText: {
    fontSize: 24,
    color: "#1E2432",
    fontWeight: "bold",
    textAlign: "center",
  },
  name: {
    marginTop: 4,
    fontSize: 10,
    maxWidth: 60,
    textAlign: "center",
  },
  name1: {
    backgroundColor:"#1E2432"
  }
});
