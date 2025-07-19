import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import DrawerNavigator from './DrawerNavigator';
import { SafeAreaView } from 'react-native';

export default function MainNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.user.email);

  return (
    <NavigationContainer>
        <SafeAreaView style={{backgroundColor:isAuthenticated ? '#011627': '#000000',flex:1}}>
      
      {isAuthenticated !== '' ? <DrawerNavigator /> : <AuthNavigator />}
      </SafeAreaView>
    </NavigationContainer>
  );
}
