import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/theme';

import TabNavigator from './TabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator();

// Dark theme so there is never a white flash between screens or during
// a stack transition.
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.gold,
    background: colors.bg,
    card: colors.bg,
    text: colors.textPrimary,
    border: colors.borderSubtle,
    notification: colors.gold,
  },
};

// The tabs are the app; product detail is pushed over them as a full
// screen with the native transition and swipe-back gesture. Customers
// have no accounts, so there are no auth screens.
export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ gestureEnabled: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
