//import { StyleSheet, View, Text, TextInput, Button } from ReactNative;
import React, { Component } from 'react';
// import react native gesture handler
import 'react-native-gesture-handler';
// import statusbar
import { StatusBar } from 'expo-status-bar';
// import two screens to visualize
import { Start } from './components/Start';
import { Chat } from './components/Chat';
// import react native gesture handler
import 'react-native-gesture-handler';
//import React Navigation tool
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
//import stylesheet
import { StyleSheet } from 'react-native';
//create the navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Start'>
        <Stack.Screen name='Start' component={Start} />
        <Stack.Screen name='Chat' component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});