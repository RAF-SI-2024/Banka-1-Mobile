import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AxiosError } from 'axios';
import { jwtDecode } from "jwt-decode";


//ip svog kompa
const BANKING_BASE_URL = 'http://192.168.88.10:8082';

const apiBanking = axios.create({
  baseURL: BANKING_BASE_URL,
  timeout: 20000,
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
  
    const formatted = rawAccounts.map((acc: any) => {
      const balanceNum = Number(acc.balance);
      const roundedBalance = isNaN(balanceNum)
        ? acc.balance
        : balanceNum.toFixed(2);
  
      return {
        id: acc.id.toString(),
        subtype: acc.subtype,
        number: acc.accountNumber,
        // Zaokruženo na dve decimale
        balance: `${roundedBalance} ${acc.currencyType}`,
      };
    });
  
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
  recipientAccount: string; 
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

/*
// Dohvatanje svih transfera za ulogovanog korisnika (JWT identifikuje usera)
export const getAllTransfers = async (): Promise<Transfer[]> => {
  const response = await apiBanking.get<GetTransfersResponse>('/mobile-transfers');
  if (response.data.success) {
   // console.log(response.data.data.transfers)
    return response.data.data.transfers;
  }
  console.error('Failed to fetch transfers', response.data);
  return [];

};
*/
export const getAllTransfers = async (): Promise<Transfer[]> => {
  const response = await apiBanking.get<GetTransfersResponse>('/mobile-transfers');
  if (!response.data.success) {
    console.error('getAllTransfers ▶ server error', response.data);
    return [];
  }

  const raw = response.data.data.transfers;
  console.log('getAllTransfers ▶ raw payload:', raw);

  return raw.map(t => ({
    ...t,
    // always give yourself somewhere safe to read a string
    recipientAccount: t.toAccountId?.accountNumber ?? '(no account)',
  }));
};

// Fetch svih računa za korisnika
export const fetchAccountsForUser = async (userId: number): Promise<any[]> => {
  const response = await apiBanking.get(`/accounts/user/${userId}`);
  // Pretpostavljamo da backend vraća data.accounts
  return response.data?.data?.accounts || [];
};

// Fetch svih brzih recipijenata za korisnika
export const getAllRecipientsForUser = async (userId: number): Promise<any[]> => {
  const response = await apiBanking.get(`/receiver/${userId}`);
  return response.data?.data?.receivers || [];
};

// Fetch payment codes
export const getPaymentCodes = async (): Promise<{ code: string; description: string }[]> => {
  const response = await apiBanking.get('/metadata/payment-codes');
  return response.data?.data?.codes || [];
};

// Kreiranje novog transfera (plaćanja)
export const createNewMoneyTransfer = async (transferData: any): Promise<{ transferId: string }> => {
  const response = await apiBanking.post('/money-transfer', transferData);
  console.log(response.data?.data);
  return response.data?.data;
};

// Verifikacija OTP koda za transfer
export const verifyOTP = async (otpData: { transferId: string; otpCode: string }): Promise<void> => {
  await apiBanking.post('/otp/verification', otpData);
};

// shape your Fast‐Recipient form
export interface FastRecipientForm {
  firstName: string;
  lastName: string;
  accountNumber: string;
  address?: string;
  ownerAccountId: number;
}

// what the backend returns (and what you display)
export interface Recipient {
  id: number;
  firstName: string;
  lastName: string;
  accountNumber: string;
  address?: string;
  usageCount?: number;
}

// fetch top‐3 quick recipients
export const fetchRecipientsForFast = async (
  customerId: number
): Promise<Recipient[]> => {
  const res = await apiBanking.get(`/receiver/${customerId}`);
  const list = res.data?.data?.receivers as any[];
  if (!Array.isArray(list)) return [];
  return list
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 3)
    .map(r => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      accountNumber: r.accountNumber,
      address: r.address,
      usageCount: r.usageCount,
    }));
};

export const getUserIdFromToken = async (): Promise<number | null> => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.id;
  } catch (error) {
    console.error("Greška pri dekodiranju tokena:", error);
    return null;
  }
};

export const fetchMyRecipients = async (): Promise<Recipient[]> => {
  const userId = await getUserIdFromToken();
  if (!userId) return [];

  // backend path is /receiver/:userId
  const res = await apiBanking.get<{
    data: { receivers: Recipient[] }
  }>(`/receiver/${userId}`);

  const list = res.data.data.receivers;
  return Array.isArray(list) ? list : [];
};


  
export default apiBanking;
