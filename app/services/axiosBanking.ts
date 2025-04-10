import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AxiosError } from 'axios';


//ip svog kompa
const BANKING_BASE_URL = 'http://192.168.88.44:8082';

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
      number: acc.accountNumber,
      balance: `${acc.balance} ${acc.currencyType}`,
    }));
  
    return formatted;
  };


  export const fetchAccountsTransactions = async (accountId: string) => {
    try {
      const response = await apiBanking.get(`/accounts/${accountId}/transactions`);
      console.log("Full API response:", response.data);
  
      return response.data.data.transactions;  // Vraćamo transakcije ako postoje
    } catch (error: unknown) {
      // Proveravamo da li je greška instanca AxiosError
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          // Ako je greška 404, ne logujemo je
          return [];
        }
        // Ako nije 404 greška, logujemo je
        console.error("Error fetching transactions:", error);
      } else {
        // Ako greška nije AxiosError, logujemo generičku grešku
        console.error("An unexpected error occurred:", error);
      }
      return [];  // Vraćamo praznu listu u svim slučajevima greške
    }
  };

  export interface Account {
    id: number;
    ownerID: number;
    accountNumber: string;
    // ... ostalo ako treba
  }

  // Tipovi transfera
export interface Transfer {
  id: number;
  amount: number;
  fromAccountId: Account;
  toAccountId: Account;
  receiver: string;
  adress: string;
  paymentCode: string;
  paymentReference: string;
  paymentDescription: string;
  fromCurrency: { code: string };
  toCurrency: { code: string };
  createdAt: number;
  otp?: string;
  type: string;
  status: 'PENDING' | 'COMPLETED' | string;
  completedAt?: number;
  note?: string;
}


// Odgovor za GET /mobile-transfers
interface GetTransfersResponse {
  success: boolean;
  data: {
    transfers: Transfer[];
  };
}

// Dohvatanje svih transfera za ulogovanog korisnika (JWT identifikuje usera)
export const getAllTransfers = async (): Promise<Transfer[]> => {
  const response = await apiBanking.get<GetTransfersResponse>('/mobile-transfers');
  if (response.data.success) {
    return response.data.data.transfers;
  }
  console.error('Failed to fetch transfers', response.data);
  return [];
};
  

  
export default apiBanking;
