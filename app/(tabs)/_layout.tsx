import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
  return (
      <Tabs>
        <Tabs.Screen name="home"
        options={{
          headerTitle:"Home",
          headerShown:false,
          tabBarIcon: ({focused,color}) =>  
           <Ionicons name={focused? "wallet-sharp": "wallet-outline"} 
           size={25}> </Ionicons>
        }}/>
        <Tabs.Screen name="new-payment"
        options={{
          title: "New Payment",
          headerShown:false,
          tabBarIcon:  ({focused,color}) =>  
          <Ionicons name={focused? "cash-sharp": "cash-outline"} 
          size={25}> </Ionicons>,
        }}
      />
        <Tabs.Screen name="profile"
        options={{
          headerTitle:"Profile",
          headerShown:false,
          tabBarIcon: ({focused,color}) =>  
          <Ionicons name={focused? "person-circle-sharp": "person-circle-outline"} 
          size={25}> </Ionicons>
        }}/>
        <Tabs.Screen
          name="verification"
          options={{
            headerTitle: "Verification",
            headerShown:false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
                size={25}
                color={focused ? "green" : "gray"}
              />
            ),
          }}
        />
      </Tabs>
  );

  
}
