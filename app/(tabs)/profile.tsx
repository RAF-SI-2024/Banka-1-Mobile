import { View, Text, StyleSheet, Button} from 'react-native';
import { useRouter } from 'expo-router';



export default function ProfileScreen() {
    const router = useRouter(); 

    const handleLogout = () => {
        router.push('/');
      };

  return (
    <View style={styles.container}>
      <Text>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
