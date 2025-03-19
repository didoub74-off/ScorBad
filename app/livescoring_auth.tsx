import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, Image, Dimensions, TextInput, TouchableOpacity, Alert} from "react-native";
import {Input} from "postcss";
import {useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

export default function AuthScreen() {

    const [status, setStatus] = useState("Checking connection..."); // Default message
    const [statusColor, setStatusColor] = useState("black");
    const [isFocused1, setIsFocused1] = useState(false);
    const [isFocused2, setIsFocused2] = useState(false);
    const [code, setCode] = useState("");
    const [competition, setCompetition] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Load saved competition number and code when the app starts
        const loadStoredData = async () => {
            try {
                const storedCompetition = await AsyncStorage.getItem("competition");
                const storedCode = await AsyncStorage.getItem("code");
                if (storedCompetition) setCompetition(storedCompetition);
                if (storedCode) setCode(storedCode);
            } catch (error) {
                console.error("Error loading stored data:", error);
            }
        };

        loadStoredData();
    }, []);

    useEffect(() => {
        // Function to check server connection
        const checkConnection = async () => {
            try {
                const response = await fetch("http://51.91.64.195:8093/socket.io/?EIO=3&transport=polling", {
                    method: "GET",
                });

                if (response.ok) {
                    setStatus("Connexion réussie, vous pouvez utiliser le mode compétition!");
                    setStatusColor("green");
                } else {
                    setStatus("❌ Connexion échouée, veuillez vérifier votre connexion ou réessayer plus tard.");
                    setStatusColor("red");
                }
            } catch (error) {
                setStatus("❌ Connexion échouée, veuillez vérifier votre connexion ou réessayer plus tard.");
                setStatusColor("red");
            }
        };

        checkConnection();
    }, []);

    // @ts-ignore
    const handleCompetitionChange = async (text) => {
        setCompetition(text);
        await AsyncStorage.setItem("competition", text); // Save competition number
    };

    // @ts-ignore
    const handleCodeChange = async (text) => {
        setCode(text);
        await AsyncStorage.setItem("code", text); // Save tournament code
    };

    const authentification = async () => {

        try {
            const response = await fetch(
                "https://api.badnet.org/api/livescoring/live/auth?id=0_" + competition + "&code=" + code,
                {
                    method: "GET",
                    headers: {
                        "x-badnet-token": "e6d4fe6456fd0ca1b3c42dc601fd184b",
                        "x-badnet-origin": "scorbad-ios-dev"
                    }
                }
            );


            const data = await response.json();

            if (response.ok) {

                router.push({
                    pathname: "/livescoring_select_court",
                    params: { authData: JSON.stringify(data), competition: competition }, // Convert to string for safe transfer
                });
            } else {
                Alert.alert("Erreur", "Connexion échouée, veuillez vérifier les informations saisies.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }

    }

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/logo-scorbad.png')}
                style={styles.Logo}
                resizeMode="contain"
            />
            <Text style={[styles.statusText, {color: statusColor}]}>{status}</Text>
            <TextInput
                style={[styles.input, isFocused2 && styles.inputFocused]}
                placeholder="Numéro de compétition"
                keyboardType="numeric"
                onFocus={() => setIsFocused2(true)}
                onBlur={() => setIsFocused2(false)}
                value={competition}
                onChangeText={handleCompetitionChange}
            />
            <TextInput
                style={[styles.input, isFocused1 && styles.inputFocused]}
                placeholder="Code du tournoi disponible sur Badnet"
                keyboardType="numeric"
                onFocus={() => setIsFocused1(true)}
                onBlur={() => setIsFocused1(false)}
                value={code}
                onChangeText={handleCodeChange}
            />
            <Text style={styles.noteText}>Entrez le numéro du tournoi et son code pour pouvoir utiliser cet appareil en
                mode livescoring au bord d'un terrain. Il recevra automatiquement le match en cours sur le terrain
                spécifié dans le prochain écran.</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => authentification()}
            >
                <Text>Entrer dans le mode compétition</Text>
            </TouchableOpacity>

        </View>
    );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    statusText: {
        marginTop: 30,
        fontSize: 16,
        textAlign: "center"
    },
    Logo: {
        width: screenWidth - 50,
        alignSelf: "center",
        marginTop: 0
    },

    input: {
        width: screenWidth - 50,
        height: 40,
        margin: 12,
        borderBottomWidth: 1,
        padding: 10,
        borderColor: '#ff7a00'
    },

    inputFocused: {
        borderBottomWidth: 2,
        borderColor: '#ffb700'
    },

    noteText: {
        marginLeft: 40,
        marginRight: 40,
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center'
    },

    button: {
        padding: 20,
        color: '#fff',
        textAlign: 'center',
        backgroundColor: '#959595',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff'
    }
});

