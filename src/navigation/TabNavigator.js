import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, ShoppingBag, MoreHorizontal } from 'lucide-react-native';
import { colors, fonts } from '../theme/theme';
import { useCart } from '../context/CartContext';
import { hapticSelect } from '../utils/haptics';

import ShopScreen from '../screens/ShopScreen';
import CartScreen from '../screens/CartScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

// Shop, Cart, More. Cart gets a badge with the total unit count.
// The bar height follows the device's bottom inset, so it clears the iOS
// home indicator and Android gesture/nav bar instead of using a fixed
// height that fits only some phones.
export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { units } = useCart();

  return (
    <Tab.Navigator
      initialRouteName="ShopTab"
      screenListeners={{ tabPress: () => hapticSelect() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarAllowFontScaling: false,
        tabBarStyle: [
          styles.tabBar,
          { height: 58 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={{ title: 'Shop', tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
          tabBarBadge: units > 0 ? units : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreScreen}
        options={{ title: 'More', tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  tabLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase' },
  badge: { backgroundColor: colors.gold, color: colors.onGold, fontFamily: fonts.bodyBold, fontSize: 10.5 },
});
