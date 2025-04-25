// app/(tabs)/new-payment.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Modal,
  Portal,
  Text,
  Card,
  List,
  IconButton
} from "react-native-paper";
import {
  createNewMoneyTransfer,
  verifyOTP,
  fetchAccountsForUser,
  getPaymentCodes,
  getAllTransfers,
  fetchMyRecipients,            // ← make sure this returns response.data.data.receivers
} from "../services/axiosBanking";
import { getUserIdFromToken } from "../services/axiosUser";
import { useTokenExpiryLogout } from '../../.expo/hooks/useTokenExpiryLogout';
import { useLocalSearchParams }  from "expo-router";

export default function NewPaymentScreen() {
  useTokenExpiryLogout();
  const params = useLocalSearchParams();
  const recipientParam = params.recipient;

  // form state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentCodes, setPaymentCodes] = useState<{ code: string; description: string }[]>([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [address, setAddress] = useState("");
  const [paymentPurpose, setPaymentPurpose] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [amount, setAmount] = useState("");

  // OTP
  const [transferId, setTransferId] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  // built-in modals
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);

  // ** fast-pay modal + saved recipients
  const [fastModalVisible, setFastModalVisible] = useState(false);
  const [savedRecipients, setSavedRecipients] = useState<any[]>([]);

  // parse incoming `recipient` param (from fast-pay)
  useEffect(() => {
    if (!recipientParam) return;
    const recStr = Array.isArray(recipientParam) ? recipientParam[0] : recipientParam;
    try {
      const r = JSON.parse(recStr);
      setReceiverName(`${r.firstName || ""} ${r.lastName || ""}`.trim());
      setRecipientAccount(r.accountNumber || "");
      setAddress(r.address || "");
    } catch {}
  }, [recipientParam]);

  // load accounts + payment codes
  useEffect(() => {
    (async () => {
      const uid = await getUserIdFromToken();
      if (!uid) return;
      const accs = await fetchAccountsForUser(uid);
      setAccounts(accs);
      if (accs.length) {
        setSelectedAccountNumber(accs[0].accountNumber);
        setSelectedCurrency(accs[0].currencyType || accs[0].currency?.code);
      }
      const codes = await getPaymentCodes();
      setPaymentCodes(codes);
    })();
  }, []);

  // whenever you pick a different account, update its currency…
  useEffect(() => {
    const acc = accounts.find(a => a.accountNumber === selectedAccountNumber);
    if (acc) setSelectedCurrency(acc.currencyType || acc.currency?.code || "");
  }, [selectedAccountNumber, accounts]);

  // validate
  const isFormValid = () =>
    !!selectedAccountNumber &&
    !!receiverName.trim() &&
    !!recipientAccount &&
    !!address.trim() &&
    !!paymentPurpose.trim() &&
    !!paymentCode &&
    !!amount && !isNaN(Number(amount));

  // submit → show OTP in this same screen
  const handleContinue = async () => {
    if (!isFormValid()) {
      Alert.alert("Greška", "Molimo popunite sva polja ispravno.");
      return;
    }
    try {
      const result = await createNewMoneyTransfer({
        fromAccountNumber: selectedAccountNumber,
        receiver: receiverName.trim(),
        recipientAccount,
        payementCode: paymentCode,
        payementReference: "",
        payementDescription: paymentPurpose,
        amount: parseFloat(amount),
        adress: address.trim(),
        savedReceiver: null,
      });
      console.log("REsult: "+result);
      setTransferId(result.transferId);

      const all = await getAllTransfers();
      const tx = all.find(t => t.id === Number(result.transferId));
      if (tx?.otp) setGeneratedOtp(tx.otp);

      setOtpModalVisible(true);
    } catch {
      Alert.alert("Error", "Failed payment. Try again.");
    }
  };

  // OTP verify
  const handleVerifyOtp = async () => {
    try {
      await verifyOTP({ transferId, otpCode: generatedOtp });
      setOtpModalVisible(false);
      Alert.alert("Success", "Payment verified!");
      // reset…
      setReceiverName("");
      setRecipientAccount("");
      setAddress("");
      setPaymentPurpose("");
      setPaymentCode("");
      setAmount("");
      setGeneratedOtp("");
    } catch {
      Alert.alert("Error", "Payment unseccessful");
    }
  };

 
  const loadSavedRecipients = async () => {
    try {
      const list = await fetchMyRecipients();
      setSavedRecipients(list);
    } catch (err) {
      console.error("Could not load recipients:", err);
    }
  };

  // load them once when component mounts
  useEffect(() => {
    loadSavedRecipients();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.centeredCard}>
          <Text style={styles.header}>New Payment</Text>

          {/* From Account */}
          <TextInput
            mode="outlined"
            label="From Account"
            value={selectedAccountNumber}
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={() => setAccountModalVisible(true)}
              />
            }
            style={styles.input}
            showSoftInputOnFocus={false}
            onFocus={() => setAccountModalVisible(true)}
          />

        <View style={styles.row}>
          <TextInput
            mode="outlined"
            label="Receiver Name"
            value={receiverName}
            onChangeText={setReceiverName}
            style={[styles.input, { flex: 1 }]}
          />
          <IconButton
            icon="flash"
            size={24}
            onPress={async () => {
              await loadSavedRecipients();
              setFastModalVisible(true);
            }}
          />
        </View>

          {/* Recipient Account */}
          <TextInput
            mode="outlined"
            label="Recipient Account"
            value={recipientAccount}
            onChangeText={setRecipientAccount}
            style={styles.input}
            keyboardType="numeric"
          />

          {/* Address */}
          <TextInput
            mode="outlined"
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />

          {/* Payment Purpose */}
          <TextInput
            mode="outlined"
            label="Payment Purpose"
            value={paymentPurpose}
            onChangeText={setPaymentPurpose}
            style={styles.input}
          />

          {/* Payment Code */}
          <TextInput
            mode="outlined"
            label="Payment Code"
            value={paymentCode}
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={() => setCodeModalVisible(true)}
              />
            }
            style={styles.input}
            showSoftInputOnFocus={false}
            onFocus={() => setCodeModalVisible(true)}
          />

          {/* Amount + Currency */}
          <View style={styles.amountRow}>
            <TextInput
              mode="outlined"
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              style={[styles.input, { flex: 1 }]}
              keyboardType="decimal-pad"
            />
            <Text style={styles.currencyText}>{selectedCurrency}</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!isFormValid()}
            style={styles.button}
            buttonColor="#1E2432"
          >
            Continue
          </Button>
        </Card>

        {/* — account picker — */}
        <Portal>
          <Modal
            visible={accountModalVisible}
            onDismiss={() => setAccountModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <ScrollView>
              {accounts.map(acc => (
                <List.Item
                  key={acc.id}
                  title={`${acc.accountNumber} (${acc.subtype})`}
                  onPress={() => {
                    setSelectedAccountNumber(acc.accountNumber);
                    setAccountModalVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </Modal>
        </Portal>

        {/* — payment-code picker — */}
        <Portal>
          <Modal
            visible={codeModalVisible}
            onDismiss={() => setCodeModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <ScrollView>
              {paymentCodes.map(pc => (
                <List.Item
                  key={pc.code}
                  title={`${pc.code} – ${pc.description}`}
                  onPress={() => {
                    setPaymentCode(pc.code);
                    setCodeModalVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </Modal>
        </Portal>

        {/* — fast-pay recipient list — */}
        <Portal>
          <Modal
            visible={fastModalVisible}
            onDismiss={() => setFastModalVisible(false)}
            contentContainerStyle={styles.modal1}
          >
             <Text style={{ marginBottom: 16, padding: 16, alignSelf: "center" , fontWeight: 'bold', fontSize:14}}>
              Your Receivers
            </Text>
            <ScrollView>
              {savedRecipients.map(r => (
                <List.Item
                  key={r.id}
                  title={`${r.firstName || ""} ${r.lastName || ""}`.trim()}
                  description={r.accountNumber}
                  onPress={() => {
                    setReceiverName(`${r.firstName || ""} ${r.lastName || ""}`.trim());
                    setRecipientAccount(r.accountNumber);
                    setAddress(r.address || "");
                    setFastModalVisible(false);
                  }}
                />
              ))}
              {savedRecipients.length === 0 && (
                <Text style={{ textAlign: "center", marginTop: 16 }}>
                  No saved recipients.
                </Text>
              )}
            </ScrollView>
          </Modal>
        </Portal>

        {/* — OTP modal — */}
        <Portal>
          <Modal
            visible={otpModalVisible}
            onDismiss={() => setOtpModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <Text style={{ marginBottom: 16, padding: 16, alignSelf: "center" }}>
              Your OTP Code:
            </Text>
            <Text style={styles.otpText}>{generatedOtp}</Text>
            <Button
              onPress={handleVerifyOtp}
              mode="contained"
              buttonColor="green"
              style={styles.verifyButton}
            >
              Verify
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1E2432",
  },
  centeredCard: {
    width: "100%",
    maxWidth: 400,
    padding: 16,
    backgroundColor: "white",
  },
 
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, alignSelf: "center" },
  input: { marginBottom: 12, backgroundColor: "white" },
  amountRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  currencyText: { marginLeft: 8, fontSize: 18, fontWeight: "bold" },
  button: { marginTop: 8 },
  modal1: { backgroundColor: "white", marginHorizontal: 16, borderRadius: 8, maxHeight: "100%" },
  modal: { backgroundColor: "white", marginHorizontal: 16, borderRadius: 8, maxHeight: "100%" },
  otpText: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  verifyButton: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 16,
    width: 120,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
