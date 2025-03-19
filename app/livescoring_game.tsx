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
import {useLocalSearchParams, useRouter} from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Battery from 'expo-battery';
import { useWebSocket } from "@/app/context/WebSocketProvider";

export default function AuthScreen() {
    const {match, competition} = useLocalSearchParams();
    const router = useRouter();

    const { socket, isConnected } = useWebSocket(); // ✅ Ensure `socket` and `isConnected` are returned

    useEffect(() => {
        if (socket && isConnected) {
            console.log("📡 WebSocket Available in LiveScoringScreen");
        }
    }, [socket, isConnected]);

    let [scoreLeftText, setScoreLeftText] = useState("00");
    let [scoreLeft, setScoreLeft] = useState(0);
    let [scoreRightText, setScoreRightText] = useState("00");
    let [scoreRight, setScoreRight] = useState(0);
    let scoreText = "00-00";
    let communicationMessage = [];
    let stringToSend = "";
    const [scoreHistory, setScoreHistory] = useState([]);
    let annonce = "";
    let reached21 = false;
    let shuttleCount = 1;
    let isDouble = 0;
    let setCount = 1;

    let pairLeft = 0;
    let pairRight = 0;
    let evenPlayerLeft = "";
    let oddPlayerLeft = "";
    let evenPlayerRight = "";
    let oddPlayerRight = "";

    let serverPlayer = 0;

    let isServerLeftSide = true;

    let startTime = new Date().toLocaleTimeString();
    let length = 0;
    useEffect(() => {
        // ✅ Lock to landscape when entering the screen
        /*const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        };
        lockOrientation();

        // ✅ Restore default orientation when leaving the screen
        return () => {
            ScreenOrientation.unlockAsync(); // Resets to system default
        };*/

        //["match",{"baseid":0,"eventid":29864,"number":2,"code":9796,"action":"match"}]

    }, []);

    useEffect(() => {
        if (socket && isConnected) {
            console.log("📡 WebSocket Available in LiveScoringScreen");

            const communicationMessage = {
                baseid: 0,
                eventid: parseInt(competition),
                number: parsedMatch.match.number,
                code: parsedMatch.match.code,
                action: "match"
            };

            console.log("📨 Sending match data:", communicationMessage);
            socket.emit("match", communicationMessage);
        }
    }, [socket, isConnected]); // Lancer quand `socket` est défini et connecté



    const parsedMatch = JSON.parse(match);

    const addScoreLeft = async () => {
        try {
            const level = await Battery.getBatteryLevelAsync(); // Returns a value between 0 and 1
            let batteryLevel = ((level * 100).toFixed(0));

            // Utilisation de la mise à jour fonctionnelle pour garantir la bonne incrémentation
            setScoreLeft(prevScore => {
                const newScore = prevScore + 1;

                // Mise à jour du texte du score en même temps
                setScoreLeftText(newScore.toString());

                // Ajouter le score à l'historique
                setScoreHistory(prevHistory => [...prevHistory, [newScore, scoreRight]]);
                console.log("📊 Score History:", scoreHistory);

                // Gestion de l'annonce
                if (newScore === scoreRight) {
                    annonce = newScore + " égalité.";
                } else if ((newScore === 20 && !reached21) || (scoreRight === 20 && !reached21)) {
                    if (newScore > scoreRight) {
                        annonce = "20 point de set " + scoreRight + ".";
                    } else {
                        annonce = "20 point de set " + newScore + ".";
                    }
                    reached21 = true;
                } else if (newScore === 29 || scoreRight === 29) {
                    if (newScore > scoreRight) {
                        annonce = "29 point de set " + scoreRight + ".";
                    } else if (newScore < scoreRight) {
                        annonce = "29 point de set " + newScore + ".";
                    } else {
                        annonce = "29 point de set 29.";
                    }
                } else {
                    annonce = newScore > scoreRight ? `${newScore}/${scoreRight}` : `${scoreRight}/${newScore}`;
                }

                return newScore; // Retourne la nouvelle valeur du score
            });

            if (player2Exists) {
                isDouble = 1;
            } else {
                isDouble = 0;
            }

            if(isServerLeftSide) {
                [evenPlayerLeft, oddPlayerLeft] = [oddPlayerLeft, evenPlayerLeft];
            } else {
                isServerLeftSide = true;
            }

            // @ts-ignore  - Time to 24h format
            length = new Date().toLocaleTimeString() - startTime;

            // Score avec zéro devant si inférieur à 10
            setScoreLeftText(prev => (prev < 10 ? "0" + (parseInt(prev) + 1).toString() : (parseInt(prev) + 1).toString()));

            scoreText = (scoreLeftText) + "-" + scoreRightText;

            communicationMessage = {
                base: 0,
                event: parseInt(competition),
                match: parsedMatch.match.number,
                code: parsedMatch.match.code,
                battery: parseInt(batteryLevel),
                annonce: annonce,
                volant: shuttleCount,
                court: parsedMatch.match.court,
                isdouble: isDouble,
                set: setCount,
                pair_left: pairLeft,
                player_left_even: evenPlayerLeft,
                player_left_odd: oddPlayerLeft,
                pair_right: pairRight,
                player_right_even: evenPlayerRight,
                player_right_odd: oddPlayerRight,
                server: parsedMatch.match.pair1.player1.member.licence,
                time: new Date().toLocaleTimeString('en-GB'),
                length: 12,
                score_left: scoreLeft + 1,
                score_right: scoreRight,
                score: scoreText,
                action: "score"
            };

            // @ts-ignore
            socket.emit("score", communicationMessage);
            console.log("📨 Message Sent: ", communicationMessage);

            if (!socket || !isConnected) {
                throw new Error("❌ WebSocket is not connected, cannot send message.");
            }
        } catch (error) {
            console.error("Error adding score to left side:", error);
        }
    };
    const addScoreRight = async () => {
        try {
            const level = await Battery.getBatteryLevelAsync(); // Returns a value between 0 and 1
            let batteryLevel = ((level * 100).toFixed(0));

            // Utilisation de la mise à jour fonctionnelle pour garantir la bonne incrémentation
            setScoreRight(prevScore => {
                const newScore = prevScore + 1;

                // Mise à jour du texte du score en même temps
                setScoreRightText(newScore.toString());

                // Ajouter le score à l'historique
                setScoreHistory(prevHistory => [...prevHistory, [newScore, scoreRight]]);
                console.log("📊 Score History:", scoreHistory);

                // Gestion de l'annonce
                if (newScore === scoreRight) {
                    annonce = newScore + " égalité.";
                } else if ((newScore === 20 && !reached21) || (scoreRight === 20 && !reached21)) {
                    if (newScore > scoreRight) {
                        annonce = "20 point de set " + scoreRight + ".";
                    } else {
                        annonce = "20 point de set " + newScore + ".";
                    }
                    reached21 = true;
                } else if (newScore === 29 || scoreRight === 29) {
                    if (newScore > scoreRight) {
                        annonce = "29 point de set " + scoreRight + ".";
                    } else if (newScore < scoreRight) {
                        annonce = "29 point de set " + newScore + ".";
                    } else {
                        annonce = "29 point de set 29.";
                    }
                } else {
                    annonce = newScore > scoreRight ? `${newScore}/${scoreRight}` : `${scoreRight}/${newScore}`;
                }

                return newScore; // Retourne la nouvelle valeur du score
            });

            if (player2Exists) {
                isDouble = 1;
            } else {
                isDouble = 0;
            }

            // @ts-ignore  - Time to 24h format
            length = new Date().toLocaleTimeString() - startTime;

            // Score avec zéro devant si inférieur à 10
            setScoreRightText(prev => (prev < 10 ? "0" + prev : prev.toString()));

            scoreText = scoreLeftText + "-" + scoreRightText;

            communicationMessage = {
                base: 0,
                event: parseInt(competition),
                match: parsedMatch.match.number,
                code: parsedMatch.match.code,
                battery: parseInt(batteryLevel),
                annonce: annonce,
                volant: shuttleCount,
                court: parsedMatch.match.court,
                isdouble: isDouble,
                set: setCount,
                pair_left: pairLeft,
                player_left_even: parsedMatch.match.pair1.player1.member.licence,
                player_left_odd: player2Exists ? parsedMatch.match.pair1.player2.member.licence : "",
                pair_right: pairRight,
                player_right_even: parsedMatch.match.pair2.player1.member.licence,
                player_right_odd: player2Exists ? parsedMatch.match.pair2.player2.member.licence : "",
                server: parsedMatch.match.pair1.player1.member.licence,
                time: new Date().toLocaleTimeString('en-GB'),
                length: 12,
                score_left: scoreLeft,
                score_right: scoreRight + 1,
                score: scoreText,
                action: "score"
            };

            // @ts-ignore
            socket.emit("score", communicationMessage);
            console.log("📨 Message Sent: ", communicationMessage);

            if (!socket || !isConnected) {
                throw new Error("❌ WebSocket is not connected, cannot send message.");
            }
        } catch (error) {
            console.error("Error adding score to left side:", error);
        }
    };


    const player2Exists = parsedMatch.match.pair1?.player2 !== undefined;
    pairLeft = parsedMatch.match.pair1.id;
    pairRight = parsedMatch.match.pair2.id;
    serverPlayer = parsedMatch.match.pair1.player1.member.licence;
    evenPlayerLeft = parsedMatch.match.pair1.player1.member.licence;
    oddPlayerLeft = player2Exists ? parsedMatch.match.pair1.player2.member.licence : "";
    evenPlayerRight = parsedMatch.match.pair2.player1.member.licence;
    oddPlayerRight = player2Exists ? parsedMatch.match.pair2.player2.member.licence : "";
    return (
        <View style={styles.container}>
            <View style={styles.infoBar}>
                <Text style={styles.infoBarText}>Match: {parsedMatch.match.number}</Text>
                <Text style={styles.infoBarText}>Terrain: {parsedMatch.match.court}</Text>
                <Text style={styles.infoBarText}>Série: {parsedMatch.match.draw.name}</Text>
                <Text style={styles.infoBarText}>Stade: {parsedMatch.match.round.name}</Text>
            </View>

            <View style={styles.gameContainer}>
                <View style={styles.leftSide}>
                    <View style={styles.playerContainer}>
                        <Text
                            style={[styles.playerName, serverPlayer == parsedMatch.match.pair1.player1.member.licence && styles.serverPlayer]}>
                            {player2Exists && (
                            <Text>
                                {parsedMatch.match.pair2.player2.member.lastname} {parsedMatch.match.pair2.player2.member.firstname}
                            </Text>
                        )}
                        </Text>
                        <Text style={[styles.playerName, styles.playerBottom, serverPlayer == parsedMatch.match.pair1.player1.member.licence && styles.serverPlayer]}>
                            {parsedMatch.match.pair1.player1.member.lastname} {parsedMatch.match.pair1.player1.member.firstname}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.scoreContainer} onPress={() => addScoreLeft()}>
                        <Text style={styles.score}>{scoreLeftText}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.rightSide}>
                    <View style={styles.playerContainer}>
                        <Text
                            style={[styles.playerName, serverPlayer == parsedMatch.match.pair2.player1.member.licence && styles.serverPlayer]}>{parsedMatch.match.pair2.player1.member.lastname} {parsedMatch.match.pair2.player1.member.firstname}</Text>
                        <Text style={[styles.playerName, styles.playerBottom, serverPlayer == parsedMatch.match.pair1.player1.member.licence && styles.serverPlayer]}>
                            {player2Exists && (
                                <Text>
                                    {parsedMatch.match.pair2.player2.member.lastname} {parsedMatch.match.pair2.player2.member.firstname}
                                </Text>
                            )}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.scoreContainer} onPress={() => addScoreRight()}>
                        <Text style={styles.score}>{scoreRightText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#0d4faf'
    },

    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'rgba(64,64,64,0.51)',
        width: "100%"
    },

    infoBarText: {
        color: "white",
        fontSize: 20,
        marginHorizontal: 10
    },

    gameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: "100%",
        padding: 20
    },

    leftSide: {
        flex: 1,
        alignItems: 'center'
    },

    rightSide: {
        flex: 1,
        alignItems: 'center'
    },

    playerContainer: {
        backgroundColor: 'rgba(64,64,64,0.51)',
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: 'center',
        margin: "auto"
    },

    scoreContainer: {
        backgroundColor: 'rgba(64,64,64,0.51)',
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: 'center',
        height: "40%",
        marginTop: 20
    },

    playerName: {
        color: "white",
        fontSize: 20,
        marginBottom: 20,
        margin: "auto",
        verticalAlign: "middle"
    },

    playerBottom: {
        borderTopWidth: 2,
        borderTopColor: "white",
        width: "100%",
        textAlign: "center",
        paddingTop: 20,
        marginBottom: 10
    },

    score: {
        color: "white",
        fontSize: 50,
        margin: "auto",
        fontWeight: 'bold'
    },

    serverPlayer: {
        color: "yellow"
    }


});