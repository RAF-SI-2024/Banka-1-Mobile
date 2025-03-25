import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";


const BASE_URL = 'http://192.168.0.179:8081';

const apiUser = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodaje token 
apiUser.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funkcija za login
export const loginUser = async (email: string, password: string): Promise<string> => {
  const response = await apiUser.post("/api/auth/login", { email, password });
  const token = response.data.data.token;
  return token;
};

//logout 
export const logoutUser = async (): Promise<void> => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return;
  await apiUser.post("/api/auth/logout", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await SecureStore.deleteItemAsync("token");
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

export const getLoggedInUser = async () => {
  const userId = await getUserIdFromToken();
  if (!userId) throw new Error("Nema ID-ja u tokenu");

  const response = await apiUser.get(`/api/customer/${userId}`);
  return response.data;
};

export default apiUser;
