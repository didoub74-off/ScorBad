import {Image, StyleSheet, Platform, Dimensions, Button, Alert} from 'react-native';

import {HelloWave} from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";
import RNPickerSelect from 'react-native-picker-select';

export default function HomeScreen() {
    const router = useRouter();
    const openAuthView = () => {
        // @ts-ignore
        router.push("livescoring_auth");
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
            headerImage={
                <Image
                    source={require('@/assets/images/logo-scorbad.png')}
                    style={styles.reactLogo}
                    resizeMode="contain"
                />
            }
        >


            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">SCORBAD iOS</ThemedText>
                <HelloWave/>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Choisissez le mode de compétition.</ThemedText>
                <ThemedText>
                    Auto-arbitrage si les joueurs viennent à la table inscrire les résultats à la fion des matchs. Live-scoring pour arbitrer les matchs en live-scoring.
                </ThemedText>
            </ThemedView>
            <Button
                title="Entrer dans le mode live-scoring"
                onPress={() => openAuthView()}
            />
            <Button
                title="Entrer dans le mode auto-arbitrage"
                onPress={() => Alert.alert('Simple Button pressed')}
            />
        </ParallaxScrollView>
    );
}
const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        width: screenWidth - 50,
        alignSelf: "center",
        marginTop: "auto",
        marginBottom: "auto",
    }
});
