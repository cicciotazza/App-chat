// import { StyleSheet, View, Text, TextInput, Button } from ReactNative;
import React, { Component } from 'react';
// import react native gesture handler
import 'react-native-gesture-handler';
// import statusbar
import { StatusBar } from 'expo-status-bar';
// import two components screens files
import { Start } from './components/Start';
import { Chat } from './components/Chat';
// import react native gesture handler
import 'react-native-gesture-handler';
// import React Navigation tool
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import stylesheet
import { StyleSheet } from 'react-native';

// create the navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    // convention of writing the React Navigation container
    <NavigationContainer>
      {/* Stack.Navigator puts the screen on top of each other: Start & Chat */}
      <Stack.Navigator initialRouteName='Start'>
        {/* first screen to show up */}
        <Stack.Screen name='Start' component={Start} />
        <Stack.Screen name='Chat' component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// stykes declared, with "flex: 1" the item is going to fill over the available space
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});