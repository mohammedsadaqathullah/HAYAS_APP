/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Platform, SafeAreaView, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import WebView from 'react-native-webview';
import { Provider } from 'react-redux';
import { store } from './src/Redux/store';
import MainNavigator from './src/Navigation/MainNavigator';
import LinearGradient from 'react-native-linear-gradient';

function App() {

  return (
<Provider store={store}>
   <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <MainNavigator />
  </LinearGradient>
    </Provider>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
