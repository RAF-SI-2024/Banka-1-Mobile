import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BANKING_BASE_URL = 'http://192.168.0.179:8082';

const apiBanking = axios.create({
  baseURL: BANKING_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatski dodaj JWT token za svaki zahtev
apiBanking.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Verifikacija OTP koda
export const verifyOtpCode = async (transakcijaId: number, otpKod: string): Promise<void> => {
  const response = await apiBanking.post('/otp/verification', {
    transakcijaId,
    otpKod,
  });
  return response.data;
};

// Dohvatanje svih transakcija za korisnika
export const getAllTransactions = async (userId: number): Promise<any[]> => {
  const response = await apiBanking.get(`/transactions/${userId}`);
  return response.data.data.data; // jer je struktura data -> data -> [] ????
};


export const fetchAccountsId = async (userId: number) => {
    const response = await apiBanking.get(`/accounts/user/${userId}`);
    console.log("Accounts: ", response.data);
  
    const rawAccounts = response.data.data?.accounts;
  
    if (!rawAccounts || !Array.isArray(rawAccounts)) {
      console.error("Nema validnih računa u odgovoru!");
      return [];
    }
  
    const formatted = rawAccounts.map((acc: any) => ({
      id: acc.id.toString(),
      subtype: acc.subtype,
      number: `**** ${acc.accountNumber.slice(-4)}`,
      balance: `${acc.balance} ${acc.currencyType}`,
    }));
  
    return formatted;
  };
  

  
export default apiBanking;
