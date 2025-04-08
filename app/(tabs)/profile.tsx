import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { logoutUser, getUserIdFromToken } from '../services/axiosUser';
import apiUser from '../services/axiosUser';
import { Card } from 'react-native-paper';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) return;

        const response = await apiUser.get(`/api/customer/${userId}`);
        console.log('User data:', response.data.data);
        setUserData(response.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nema dostupnih podataka.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header deo sa avatarom i imenom */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.nameText}>Welcome</Text>
        <Text style={styles.nameText}>
          {userData.firstName} {userData.lastName}
        </Text>
        <Text style={styles.usernameText}>@{userData.username}</Text>
      </View>

      {/* Card sa email-om i adresom */}
      <Card style={styles.infoCard}>
        <Text style={styles.cardLabel}>Email:</Text>
        <Text style={styles.cardValue}>{userData.email}</Text>
        <Text style={styles.cardLabel}>Adress:</Text>
        <Text style={styles.cardValue}>{userData.address}</Text>
        <Text style={styles.cardLabel}>Phone Number:</Text>
        <Text style={styles.cardValue}>{userData.phoneNumber}</Text>
        
        <Text style={styles.cardLabel}>Date of Birth:</Text>
        <Text style={styles.cardValue}>{userData.birthDate}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      </Card>

    
     
    </View>
  );
}

const styles = StyleSheet.create({
  // Glavni kontejner ekrana
  container: {
    flex: 1,
    backgroundColor: '#1E2432',
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  // Kontejner dok se učitava
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
  },
  // Header deo
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    top: 30
  },
  avatar: {
    width: 125,
    height: 125,
    borderRadius: 50,
    marginBottom: 15,
  },
  nameText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  usernameText: {
    fontSize: 20,
    color: '#777',
    marginTop: 5,
  },
  // Stil za Card koji sadrži email i adresu
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 30,
    marginHorizontal: 10,
    marginBottom: 30,
    top:10,
  },
  cardLabel: {
    fontSize: 20,
    color: '#1E2432',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 20,
    color: '#1E2432',
    marginBottom: 10,
  },
 
  logoutButton: {
    backgroundColor: '#1E2432',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    width:100,
    alignSelf: 'center',
    top:30
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

