import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';

const logo = Asset.fromModule(require('/Users/brankadelic/Desktop/mobile/Banka-1-Mobile/assets/images/login.png')).uri;

import * as SecureStore from 'expo-secure-store';
import { loginUser } from '../services/axiosUser';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();


  const handleLogin = async () => {
    if (email === '' || password === '') {
      setError('Molimo unesite email i lozinku');
      return;
    }

    try {
      const token = await loginUser(email, password);
      const decoded: any = jwtDecode(token);

      if (decoded.isAdmin === true) {
        setError('Admin korisnici nemaju pristup mobilnoj aplikaciji.');
        return;
      }

      await SecureStore.setItemAsync('token', token);
      router.replace('/profile');
    } catch (err) {
      console.log(err);
      setError('Neispravan email ili lozinka');
    }
  };
  
  const isLoginButtonDisabled = email === '' || password === '';


  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Log In</Text>
      <View style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>Log In To Continue</Text>
            
            <Image source={{ uri: logo }} style={styles.logo} />


            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye' : 'eye-off'}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={[styles.button, isLoginButtonDisabled && styles.buttonDisabled]} 
              disabled={isLoginButtonDisabled} 
            >
              LOG IN
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2432',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    position: 'absolute',
    top: 80,
    left: 40
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: '80%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#161B22',
    marginBottom: 5,
    bottom: 50,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    bottom: 50,
    textAlign: 'center',
  },

  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
    bottom:50
  },


  input: {
    width: 250,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    bottom:50
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
    backgroundColor: '#161B22',

    width: '50%',
    alignSelf: 'center',
    bottom: 30
  },
  buttonDisabled: {
    backgroundColor: '#D3D3D3', 
    width: '100%',

  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,

    bottom:50
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
});

export default LoginForm;


