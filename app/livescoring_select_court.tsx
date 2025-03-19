import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    ScrollView
} from "react-native";
import {Input} from "postcss";
import {useLocalSearchParams, useRouter} from "expo-router";
import {Picker} from "@react-native-picker/picker";
import * as ScreenOrientation from "expo-screen-orientation";

export default function AuthScreen() {
    const {authData, competition} = useLocalSearchParams();
    // @ts-ignore
    const parsedData = JSON.parse(authData);
    const [selected, setSelected] = useState(null);
    const sportHalls = parsedData.sporthalls || [];
    const [selectedHall, setSelectedHall] = useState(sportHalls.length > 1 ? sportHalls[0].id : null);
    const [numCourts, setNumCourts] = useState(sportHalls.length === 1 ? sportHalls[0].courts : 0);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // ✅ Lock to landscape when entering the screen
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
        lockOrientation();

        // ✅ Restore default orientation when leaving the screen
        return () => {
            ScreenOrientation.unlockAsync(); // Resets to system default
        };
    }, []);

    // @ts-ignore
    const handlePress = (index) => {
        setSelected(index);
    };

    useEffect(() => {
        // @ts-ignore
        const hall = sportHalls.find((hall) => hall.id === selectedHall);
        if (hall) {
            setNumCourts(hall.courts);
        }
    }, [selectedHall]);

    const logInToCourt = async () => {
        try {
            let sportHallChosenEncoded;
            if(sportHalls.length == 1) {
                sportHallChosenEncoded = encodeURIComponent(sportHalls[0].name);
            }else {
                // @ts-ignore
                sportHallChosenEncoded = encodeURIComponent(sportHalls.find((hall) => hall.id === selectedHall).name);
            }
            const response = await fetch("http://api.badnet.org/api/event/0_" + competition + "/match/court/" + selectedCourt + "?sporthall=" + sportHallChosenEncoded, {
                "method": "GET",
                "headers": {
                    "x-badnet-token": "e6d4fe6456fd0ca1b3c42dc601fd184b",
                    "x-badnet-origin": "scorbad-ios-dev"
                },
            });

            const data = await response.json();

            if(response.ok) {
                router.push({
                    pathname: "/livescoring_game",
                    params: {match: JSON.stringify(data), competition: competition}, // Convert to string for safe transfer
                });

            }else {
                Alert.alert("Erreur", "Il n'y a pas de match en cours sur ce terrain")
            }
        }
        catch (error) {
            console.error("Error:", error);
        }
    }

    // @ts-ignore
    return (
        <View style={styles.container}>
            <Image source={require("@/assets/images/logo-scorbad.png")} style={styles.Logo} resizeMode="contain"/>

            {sportHalls.length === 1 ? (
                // ✅ Show Text if only one sport hall
                <Text style={styles.nomSalle}>{sportHalls[0].name}</Text>
            ) : (
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Choisir une salle:</Text>
                    <Picker
                        selectedValue={selectedHall}
                        onValueChange={(itemValue) => setSelectedHall(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem} // ✅ Custom item style for iOS
                    >
                        {// @ts-ignore
                            sportHalls.map((hall) => (
                                <Picker.Item key={hall.id} label={hall.name} value={hall.id}/>
                            ))}
                    </Picker>
                </View>
            )}

            {/* ✅ Court Selection Circles */}
            {numCourts > 0 && (
                <>
                    <View style={styles.circleContainer}>
                        {[...Array(numCourts).keys()].map((index) => {
                            const courtNumber = index + 1;
                            return (
                                <TouchableOpacity
                                    key={courtNumber}
                                    style={[
                                        styles.circle,
                                        selectedCourt === courtNumber && styles.selectedCircle, // Highlight selected
                                    ]}
                                    // @ts-ignore
                                    onPress={() => setSelectedCourt(courtNumber)}
                                >
                                    <Text
                                        style={[
                                            styles.text,
                                        ]}
                                    >
                                        T{courtNumber}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            )}

            {/* ✅ Display Selection */}
            {selectedHall && (
                <Text style={styles.selectedText}>
                    Selected Sport Hall: {// @ts-ignore
                    sportHalls.find((hall) => hall.id === selectedHall)?.name}
                </Text>
            )}
            {selectedCourt && (
                <Text style={styles.selectedText}>Selected Court: T{selectedCourt}</Text>
            )}
            <TouchableOpacity
                style={styles.button}
                onPress={() => logInToCourt()}
            >
                <Text>Choisir ce terrain</Text>
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

    circleContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // ✅ Wrap to new row if needed
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },

    Logo: {
        width: screenWidth - 50,
        alignSelf: "center",
        marginTop: 0
    },

    nomSalle: {
        marginTop: 30,
        fontSize: 20,
        marginLeft: 20,
        marginRight: 20,
        textAlign: "center"
    },

    circle: {
        marginVertical: 5,
        width: 60,
        height: 60,
        borderRadius: 30, // ✅ Makes it a circle
        backgroundColor: "#ddd",
        borderColor: "#ff7a00",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10, // Spacing between circles
    },

    selectedCircle: {
        borderWidth: 3, // ✅ Highlight selected circle
    },

    text: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold",
    },

    button: {
        padding: 20,
        color: '#fff',
        textAlign: 'center',
        backgroundColor: '#959595',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    pickerContainer: {
        width: "100%",
        alignItems: "center",
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    picker: {
        width: "80%",
        height: Platform.OS === "ios" ? 150 : 50, // ✅ iOS: Taller vertical picker
    },
    pickerItem: {
        fontSize: 18,
        color: "black",
    },
    selectedText: {
        fontSize: 16,
        marginTop: 10,
        color: "blue",
    },
});

const pickerStyles = {
    inputIOS: {
        marginHorizontal: 20,
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 4,
        color: "black",
        paddingRight: 30, // To ensure text is not clipped
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 4,
        color: "black",
        paddingRight: 30,
    },
};
