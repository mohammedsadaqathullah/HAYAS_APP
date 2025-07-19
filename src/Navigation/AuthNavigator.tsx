import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../Login';
import RegisterScreen from '../Register';
import IntroLottie from '../IntroLottie';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{animation:'slide_from_right',headerShown:false}}>
      <Stack.Screen name="Intro" component={IntroLottie} />

      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
