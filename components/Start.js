import React from 'react';
// components needed 
import { View, Text, Button, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Icon from "react-native-vector-icons/FontAwesome";

const colors = {
    color1: "#44C5CB",
    color2: "#FCE315",
    color3: "#F53D52",
    color4: "#FF9200"
}

// the background colour to choose 
let bgColor = '';

export class Start extends React.Component {
    constructor(props) {
        super(props);
        // the state of the name at the beginning is empty by default
        this.state = {
            name: '',
            bgColor: '',
        }
    };

    // color choosen for the chat screen
    changeBgColor = (newColor) => {
        bgColor = colors.color1;
        this.setState({ bgColor: newColor });
    };

    render() {
        return (
            <ImageBackground source={require('../assets/background.png')} resizeMode="cover" style={styles.image}>
                <View style={styles.container}>
                    {/* title of the application showed */}
                    <Text style={styles.title}>App-Chat</Text>
                    <View style={styles.box1}>
                        <View style={styles.input}>
                            <Icon name="user" size={30} color="#888" style={styles.icon} />
                            <TextInput accessible={true}
                                accessibilityLabel="Your Name"
                                accessibilityHint="Please insert the name you want to use on Chat-App"
                                // inputText will change the state of the name above which was set to be empty by default
                                style={styles.inputText} onChangeText={(name) =>
                                    this.setState({ name })}
                                //setState is passed into this.state.name similar to Js Query 
                                value={this.state.name}
                                placeholder='Your Name' />
                        </View>
                        <View style={styles.colorBox}>
                            <View style={styles.colorTextBox}>
                                <Text style={styles.colorText}>Choose a Color for your chat:</Text>
                            </View>
                            <View style={styles.color}>
                                <TouchableOpacity accessible={true}
                                    accessibilityLabel="light-blue background"
                                    accessibilityHint="Adds light-blue background to the chat screen"
                                    accessibilityRole="button"
                                    style={styles.color1} onPress={() => this.changeBgColor(colors.color1)}></TouchableOpacity>
                                <TouchableOpacity accessible={true}
                                    accessibilityLabel="yellow background"
                                    accessibilityHint="Adds yellow background to the chat screen"
                                    accessibilityRole="button"
                                    style={styles.color2} onPress={() => this.changeBgColor(colors.color2)}></TouchableOpacity>
                                <TouchableOpacity accessible={true}
                                    accessibilityLabel="red background"
                                    accessibilityHint="Adds red background to the chat screen"
                                    accessibilityRole="button"
                                    style={styles.color3} onPress={() => this.changeBgColor(colors.color3)}></TouchableOpacity>
                                <TouchableOpacity accessible={true}
                                    accessibilityLabel="orange background"
                                    accessibilityHint="Adds orange background to the chat screen"
                                    accessibilityRole="button"
                                    style={styles.color4} onPress={() => this.changeBgColor(colors.color4)}></TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.button}>
                            <TouchableOpacity accessible={true}
                                accessibilityLabel="Start your chat"
                                accessibilityHint="Change screen to the chat"
                                accessibilityRole="button"
                                style={styles.buttonHeight}
                                //by pressing the button "onPress" it will go to the second screen with the "props.navigation" to 'Chat' 
                                //and passes both name ("this.state.name") and the background color ("this.state.bgcolor")
                                onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, bgColor: this.state.bgColor })}>
                                <Text style={styles.buttonText}>Start Chatting</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        )
    }
};

// style define apart as it would be with CSS  comving from the React Native {Component}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 1,
    },

    box1: {
        marginBottom: 30,
        height: '44%',
        width: '88%',
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexShrink: 0,
    },

    title: {
        flex: 1,
        fontSize: 45,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },

    image: {
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },

    button: {
        height: 70,
        width: '88%',
        marginBottom: -15,
    },

    buttonHeight: {
        backgroundColor: '#757083',
        height: 60,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'stretch'
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,

    },

    color: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        marginLeft: 45,
        width: 250,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexShrink: 0,
        alignItems: "flex-start",
        flexShrink: 0,
    },

    color1: {
        backgroundColor: '#44C5CB',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: '#090C08',
    },

    color2: {
        backgroundColor: '#FCE315',
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    color3: {
        backgroundColor: '#F53D52',
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    color4: {
        backgroundColor: '#FF9200',
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    colorBox: {
        width: '88%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginRight: 40,
    },

    input: {
        alignItems: "flex-start",
        flexDirection: "row",
        height: 60,
        width: '88%',
        borderColor: '#757083',
        borderWidth: 1,
        position: 'relative',
        marginTop: -5,
        marginBottom: -5,
        flexShrink: 0,
    },

    icon: {
        margin: 10,
        opacity: .5,
    },

    inputText: {
        marginTop: 15,
        marginLeft: 2,
        opacity: .5,
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
    },

    colorText: {
        color: '#757083',
        fontWeight: '300',
        fontSize: 16,
        opacity: 1,
        marginBottom: 9,
        marginLeft: 5,
    },

    colorTextBox: {
        alignItems: "stretch",
        width: '88%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})