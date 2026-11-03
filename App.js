import 'react-native-gesture-handler';
import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Import each weight from its own path. The package root re-exports every
// weight and italic, and Metro would then bundle all of them (~10 MB).
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display/400Regular_Italic';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono/500Medium';

import { colors } from './src/theme/theme';
import { CurrencyProvider, useCurrency } from './src/context/CurrencyContext';
import { ConfigProvider } from './src/context/ConfigContext';
import { CartProvider, useCart } from './src/context/CartContext';
import RootNavigator from './src/navigation/RootNavigator';
import AppSplash from './src/components/AppSplash';
import CurrencySheet from './src/components/CurrencySheet';

// Keep the native splash (dark background + monogram, configured in
// app.json) up until we dismiss it ourselves, so there is no blank flash
// while fonts and saved state load.
SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_SPLASH_MS = 1100; // long enough to register as a brand moment, not a flicker

function AppContent() {
  const { hydrated: cartReady } = useCart();
  const { loaded: currencyReady } = useCurrency();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  const ready = cartReady && currencyReady && minTimeElapsed;

  // The native and custom splash share the same look, so hiding the
  // native one once this has painted its first frame is seamless.
  const onLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!ready) return <AppSplash onLayout={onLayout} />;

  return (
    <>
      {/* Dark app: light status-bar icons. */}
      <StatusBar style="light" />
      <RootNavigator />
      <CurrencySheet />
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMMono_500Medium,
  });

  // Hold on the native splash until the fonts are in, so text never
  // renders in a fallback face first. If a font fails to load, carry on
  // with system fonts rather than trapping the user on the splash.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <CurrencyProvider>
          <ConfigProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </ConfigProvider>
        </CurrencyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
