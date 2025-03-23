import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  // Dummy podaci
  const user = {
    firstName: 'Ana',
    lastName: 'Vukov',
    email: 'ana@example.com',
  };

  const handleLogout = () => {
    // Ovde kasnije brišemo token i čistimo podatke
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moj profil</Text>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Ime i Prezime:</Text>
        <Text style={styles.value}>{user.firstName} {user.lastName}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>
      <Button title="Logout" onPress={handleLogout} color="#E53935" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  infoBox: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
