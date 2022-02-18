//this file handles the CustomAction button in text input field

// import PropTypes
import PropTypes from "prop-types";
//import react
import React from "react";
//import necessary components from react-native
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
//import permissions and imagepicker
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
//import firebase
import firebase from 'firebase';
import firestore from 'firebase';


// "+ button" component for user action as message composer
export default class CustomActions extends React.Component {

    // Let the user pick an image from the device's image library
    pickImage = async () => {
        // permission to access the user device's gallery
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        try {
            // pick image           
            if (status === "granted") {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch((error) => {
                    console.error(error);
                });
                // canceled process
                if (!result.cancelled) {
                    const imageUrl = await this.uploadImage(result.uri);
                    this.props.onSend({ image: imageUrl });
                }
            }
        } catch (error) {
            console.error(error);
        }
    };


    // Let the user take a photo with device's camera
    takePhoto = async () => {
        // permission needed to access the camera (used it your smartphone, NO emulation)
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        try {
            if (status === "granted") {
                let result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                }).catch((error) => {
                    console.error(error);
                });
                if (!result.cancelled) {
                    const imageUrl = await this.uploadImage(result.uri);
                    this.props.onSend({ image: imageUrl });
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    //get the location of the user by using GPS
    getLocation = async () => {
        // permission needed to access the location while the app is working in the background
        const { status } = await Location.requestForegroundPermissionsAsync();
        try {
            if (status === "granted") {
                let result = await Location.getCurrentPositionAsync({}).catch(
                    (error) => {
                        console.error(error);
                    }
                );
                // Send latitude and longitude to locate the position on the map
                if (result) {
                    this.props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude,
                        },
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    };


    // Upload images to firebase
    uploadImage = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        const imageNameBefore = uri.split("/");
        const imageName = imageNameBefore[imageNameBefore.length - 1];

        const ref = firebase.storage().ref().child(`images/${imageName}`);

        const snapshot = await ref.put(blob);

        blob.close();

        return await snapshot.ref.getDownloadURL();
    };

    // function that handles communication features
    onActionPress = () => {
        const options = [
            "Choose From Library",
            "Take Picture",
            "Send Location",
            "Cancel",
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log("user wants to pick an image");
                        return this.pickImage();
                    case 1:
                        console.log("user wants to take a photo");
                        return this.takePhoto();
                    case 2:
                        console.log("user wants to get their location");
                        return this.getLocation();
                }
            }
        );
    };

    //render function
    render() {
        return (
            <TouchableOpacity
                accessible={true}
                accessibilityLabel="More options"
                accessibilityHint="Let’s you choose to send an image or your geolocation."
                style={[styles.container]}
                onPress={this.onActionPress}
            >
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: "#b2b2b2",
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: "#b2b2b2",
        fontWeight: "bold",
        fontSize: 16,
        backgroundColor: "transparent",
        textAlign: "center",
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};
