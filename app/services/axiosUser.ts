import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

export default apiUser;
