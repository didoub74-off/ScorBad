import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/useColorScheme';

import {WebSocketProvider} from "@/app/context/WebSocketProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <WebSocketProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{title: 'Home', headerShown: false}}/>
                    <Stack.Screen name="+not-found"/>
                    <Stack.Screen name="livescoring_auth" options={{title: 'Authentication'}}/>
                    <Stack.Screen name="livescoring_select_court" options={{title: 'Choix du terrain'}}/>
                    <Stack.Screen name="livescoring_game" options={{title: 'Live-scoring'}}/>
                </Stack>
                <StatusBar style="auto"/>
            </ThemeProvider>
        </WebSocketProvider>
    );
}
