import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    
    <>
    <StatusBar style="light"/>
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index"
        options={{
          headerShown:false
        }}/>
        <Stack.Screen name="(tabs)"
        options={{
          headerShown:false
        }}/>
      </Stack>
      </PaperProvider>
      </>
  );

  
}
