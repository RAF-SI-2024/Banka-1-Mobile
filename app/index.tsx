import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LoginForm from './components/loginform';

export default function Index() {
  const router = useRouter();

  const handleLogin = () => {
    // Nakon logovanja preusmeri na tabs
    router.push('/(tabs)/profile');
  };
  return (
    <View style={styles.container}>
      <LoginForm onLogin={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 20,
  },
});
