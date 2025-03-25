import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { logoutUser, getUserIdFromToken } from '../services/axiosUser';
import apiUser from '../services/axiosUser';
import { Card } from 'react-native-paper';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) return;

        const response = await apiUser.get(`/api/customer/${userId}`);
        console.log('User data:', response.data.data);
        setUserData(response.data.data);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Error while logging out:', error);
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'gray' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          backgroundColor: "#1E2432",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          padding: 20,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Text style={styles.hello}>Hello, {userData.username}!</Text>
        <Text style={styles.info}>
          {userData.firstName} {userData.lastName}, {userData.email}
        </Text>
        <Text style={styles.info}>{userData.address}</Text>
      </Card>

      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#E53935" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingTop: 420,
  },
  hello: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  logoutContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
});
