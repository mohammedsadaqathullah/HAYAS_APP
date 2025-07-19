import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setUserData } from './Redux/slice/userSlice';
import { useGetUserByEmailQuery } from './Redux/Api/userApi';
import BikeLottie from './Assets/Lottie/introBike.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const IntroLottie = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [email, setEmail] = useState<string | null>(null);

  const text = 'HAYAS';

  useEffect(() => {
    AsyncStorage.getItem("cachelogged").then((storedEmail) => {
      if (storedEmail) {
        setEmail(storedEmail);
      }
    });
  }, []);
  
  const { data, isLoading, refetch } = useGetUserByEmailQuery(email, {
    skip: !email,
  });

  const setData = async () => {
    refetch();
    if (data && !isLoading) {
      try {
        dispatch(setUserData(data.userObject));
      } catch (err) {
        console.error('Failed to decrypt user:', err);
      }
    }
  };

  useEffect(() => {
    setData();
  }, [data, isLoading]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisibleLetters((prev) => (prev < text.length ? prev + 1 : prev));
    }, 150);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const userValid = data && data.userObject;
      if (email && userValid && !isLoading) {
        dispatch(setUserData(data.userObject)); 
        navigation.navigate('HomeTabs');
      } else {
        navigation.replace('Login'); 
      }
    }, 3000);
  
    return () => clearTimeout(timeoutId);
  }, [email, data, isLoading]);
  
  return (
    <View style={styles.container}>
      <View style={styles.bikeAnimation}>
        <LottieView
          source={BikeLottie}
          autoPlay
          loop
          style={styles.bike}
        />
        <View style={styles.textContainer}>
          {text.split('').map((char, index) => (
            <Text
              key={index}
              style={[
                styles.letter,
                { opacity: index < visibleLetters ? 1 : 0 },
              ]}
            >
              {char}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default IntroLottie;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"black",
    justifyContent: 'center',
    alignItems: 'center',
  },
  bikeAnimation: {
    width: 400,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bike: {
    height: 300,
    width:200
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  letter: {
    fontSize: width * 0.1,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 5,
    marginHorizontal: 2,
  },
});
