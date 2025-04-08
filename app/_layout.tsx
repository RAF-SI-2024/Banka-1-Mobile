import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import NotificationHandler from "./components/NotificationHandler";

export default function RootLayout() {
  return (
    
    <>
    <StatusBar style="light"/>
    <NotificationHandler />
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
      </>
  );

  
}
