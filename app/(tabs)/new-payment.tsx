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
} from "react-native-paper";
import {
  createNewMoneyTransfer,
  verifyOTP,
  fetchAccountsForUser,
  getPaymentCodes,
  getAllTransfers,
} from "../services/axiosBanking";
import { getUserIdFromToken } from "../services/axiosUser";

export default function NewPaymentScreen() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentCodes, setPaymentCodes] = useState<{ code: string; description: string }[]>([]);

  // Modal visibility
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  // Form fields
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [receiverName, setReceiverName] = useState<string>("");
  const [recipientAccount, setRecipientAccount] = useState<string>("");
  const [paymentPurpose, setPaymentPurpose] = useState<string>("");
  const [paymentCode, setPaymentCode] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // OTP state
  const [transferId, setTransferId] = useState<string>("");
  const [generatedOtp, setGeneratedOtp] = useState<string>("");

  // Load accounts and payment codes
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

  // Update selectedCurrency when account changes
  useEffect(() => {
    const acc = accounts.find(a => a.accountNumber === selectedAccountNumber);
    if (acc) {
      setSelectedCurrency(acc.currencyType || acc.currency?.code || "");
    }
  }, [selectedAccountNumber, accounts]);

  // Validate form
  const isFormValid = () =>
    !!selectedAccountNumber &&
    !!receiverName.trim() &&
    !!recipientAccount &&
    !!paymentPurpose.trim() &&
    !!paymentCode &&
    !!amount && !isNaN(Number(amount));

  // Submit transfer, then fetch and display OTP in modal
  const handleContinue = async () => {
    if (!isFormValid()) {
      Alert.alert("Greška", "Molimo popunite sva polja ispravno.");
      return;
    }
    try {
      // Create pending transfer
      const result: { transferId: string } = await createNewMoneyTransfer({
        fromAccountNumber: selectedAccountNumber,
        receiver: receiverName.trim(),
        recipientAccount,
        payementCode: paymentCode,
        payementReference: "",
        payementDescription: paymentPurpose,
        amount: parseFloat(amount),
        adress: "",
        savedReceiver: null,
      });
      setTransferId(result.transferId);

      // Fetch transfers to get OTP
      const allTransfers = await getAllTransfers();
      const transferIdNum = Number(result.transferId);
      const pending = allTransfers.find((t) => t.id === transferIdNum);
      if (pending?.otp) {
        setGeneratedOtp(pending.otp);
      }
      setOtpModalVisible(true);
    } catch {
      Alert.alert("Error", "Failed payment. Try again.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    try {
      await verifyOTP({ transferId, otpCode: generatedOtp });
      setOtpModalVisible(false);
      Alert.alert("Success", "Payment verified!");
      // Reset form
      setReceiverName("");
      setRecipientAccount("");
      setPaymentPurpose("");
      setPaymentCode("");
      setAmount("");
      setGeneratedOtp("");
    } catch {
      Alert.alert("Error", "OTP not valid");
    }
  };

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
              <TextInput.Icon icon="menu-down" onPress={() => setAccountModalVisible(true)} />
            }
            style={styles.input}
            showSoftInputOnFocus={false}
            onFocus={() => setAccountModalVisible(true)}
          />

          {/* Receiver Name */}
          <TextInput
            mode="outlined"
            label="Receiver Name"
            value={receiverName}
            onChangeText={setReceiverName}
            style={styles.input}
          />

          {/* Recipient Account */}
          <TextInput
            mode="outlined"
            label="Recipient Account"
            value={recipientAccount}
            onChangeText={setRecipientAccount}
            style={styles.input}
            keyboardType="numeric"
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
              <TextInput.Icon icon="menu-down" onPress={() => setCodeModalVisible(true)} />
            }
            style={styles.input}
            showSoftInputOnFocus={false}
            onFocus={() => setCodeModalVisible(true)}
          />

          {/* Amount & Currency */}
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
            buttonColor='#1E2432'
          >
            Continue
          </Button>
        </Card>

        {/* Account Selection Modal */}
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

        {/* Code Selection Modal */}
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

        {/* OTP modal on same page */}
        <Portal>
          <Modal
            visible={otpModalVisible}
            onDismiss={() => setOtpModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <Text style={{ marginBottom: 16, padding:16, alignSelf: 'center' }}>Your OTP Code:</Text>
            <Text style={styles.otpText}>{generatedOtp}</Text>
            <Button onPress={handleVerifyOtp} mode="contained" buttonColor="green" style={styles.verifyButton}>
              Verify
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor:'#1E2432' },
  centeredCard: { width: '100%', maxWidth: 400, padding: 16 , backgroundColor:'white'},
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, alignSelf:'center' },
  input: { marginBottom: 12,  backgroundColor:'white' },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  currencyText: { marginLeft: 8, fontSize: 18, fontWeight: 'bold' },
  button: { marginTop: 8 },
  modal: { backgroundColor: "white", marginHorizontal: 16, borderRadius:'3%' },
  otpText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  verifyButton: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    // width smaller
    width: 120,
    borderRadius: 8,
  },
  
});