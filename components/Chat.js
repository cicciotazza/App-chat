import React from 'react';
// KeyboardAvoidingView importer to fix keyboard issues for older Android devices
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
// import GiftedChat, a popular chat UI library 
//--https://github.com/FaridSafi/react-native-gifted-chat--
import { GiftedChat, Bubble, Day, SystemMessage, InputToolbar } from 'react-native-gifted-chat';
// import Firebase for storing messages and authenticate
import * as firebase from 'firebase';
import "firebase/firestore";

//import AsyncStorage, a storage system provided for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

//import AsyncStorage from '@react-native-community/async-storage';
//import AsyncStorage from @react-native-community/async-storage;
//import AsyncStorage from '@react-native-community/async-storage';
//import {AsyncStorage} from @react-native-community/async-storage;
//import { AsyncStorage } from '@react-native-community/async-storage';
//import { AsyncStorage } from 'react-native';
//import { useAsyncStorage } from '@react-native-async-storage/async-storage';


// import NetInfo to know wether or not an user is online
import NetInfo from '@react-native-community/netinfo';
// import a function that renders a map if the object contains a location
import MapView from 'react-native-maps';
// import che circle button from the new component
import CustomActions from './CustomActions';


// initialize and configure Firebase keys
const firebaseConfig = {
	apiKey: "AIzaSyAkxv6covPsXz4zjucic3xNdIRBqSIThxQ",
	authDomain: "app-chat-f0902.firebaseapp.com",
	projectId: "app-chat-f0902",
	storageBucket: "app-chat-f0902.appspot.com",
	messagingSenderId: "293480862484",
	appId: "1:293480862484:web:d1b6c89d24e38ed27ae801",
	measurementId: "G-WX0C65FGFP"
};

export class Chat extends React.Component {
	constructor() {
		super();
		this.state = {
			messages: [],
			uid: 0,
			loggedInText: 'Please wait, while loggin in...',
			user: {
				_id: "",
				name: "",
				avatar: "",
			},
			isConnected: false,
			image: null,
			location: null
		};

		// if condition to initialize Firebase
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig);
		}
		// reference to the Firestore message collection created on https://console.firebase.google.com
		this.referenceChatMessages = firebase
			.firestore()
			.collection("messages");
		this.refMsgsUser = null;
	};

	// when get updates will fetch messages from the querySnapshot as current data 
	onCollectionUpdate = (querySnapshot) => {
		const messages = [];
		// go through each document
		querySnapshot.forEach((doc) => {
			// get the QueryDocumentSnapshot's data
			let data = { ...doc.data() };
			messages.push({
				_id: data._id,
				text: data.text,
				createdAt: data.createdAt.toDate(),
				user: {
					_id: data.user._id,
					name: data.user.name,
					avatar: data.user.avatar
				},
				image: data.image || null,
				location: data.location || null,
			});
		});
		// start by querying your db
		this.setState({
			messages
		})
		// save all messages to local AsyncStorage
		this.saveMessages()
	}

	// getting messages from AsyncStorage, storage function in ReactNative
	getMessages = async () => {
		let messages = '';
		try {
			// await used to make it work with promises
			messages = (await AsyncStorage.getItem('messages')) || [];
			this.setState({
				messages: JSON.parse(messages),
			});
		} catch (error) {
			console.log(error.message);
		}
	};

	// async used to SAVE messages on asyncStorage
	saveMessages = async () => {
		try {
			// JSON.stringify convert messages object into a string
			await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
		} catch (error) {
			console.log(error.message);
		}
	};

	// async used to DELETE message from asyncStorage butin (DEV mode only)
	deleteMessages = async () => {
		try {
			await AsyncStorage.removeItem('messages');
			this.setState({
				messages: [],
			});
		} catch (error) {
			console.log(error.message);
		}
	};

	componentDidMount() {
		// name given back from the router in Start
		let name = this.props.route.params.name;
		// above name passed into here as a title
		this.props.navigation.setOptions({ title: name });

		// check wheather of not the user is online/offline
		NetInfo.fetch().then(connection => {
			if (connection.isConnected) {
				this.setState({ isConnected: true });
				console.log('online');
				// listens for updates in the collection
				this.unsubscribe = this.referenceChatMessages
					.orderBy('createdAt', 'desc')
					.onSnapshot(this.onCollectionUpdate);

				// anonymous authentication
				//is Firebase authenticates the user, fetch the lists from Firestore and render it in the application.
				this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
					if (!user) {
						return await firebase.auth().signInAnonymously();
					}

					//get user state using the currently active user data
					this.setState({
						uid: user.uid,
						messages: [],
						user: {
							_id: user.uid,
							name: name,
							avatar: "https://placeimg.com/140/140/any",
						},
						isConnected: true
					});

					//referencing the messages about the current user
					this.refMsgsUser = firebase
						.firestore()
						.collection('messages')
						.where('uid', '==', this.state.uid);
				});

				// async SAVES messages locally on AsyncStorage
				this.saveMessages();
			} else {
				// if user offline
				this.setState({ isConnected: false });
				console.log('offline');
				this.getMessages();
			}
		});
	}

	// Allow to send messages to database
	addMessages() {
		const message = this.state.messages[0];
		// this adds new messages to the collection
		this.referenceChatMessages.add({
			_id: message._id,
			text: message.text || "",
			createdAt: message.createdAt,
			user: this.state.user,
			image: message.image || "",
			location: message.location || null
		});
	}

	// Returns your own custom view to render a map when a user adds a location in his message
	renderCustomView(props) {
		const { currentMessage } = props;
		if (currentMessage.location) {
			return (
				<MapView
					style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
					region={{
						latitude: currentMessage.location.latitude,
						longitude: currentMessage.location.longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
				/>
			);
		}
		return null;
	}

	// action button for the features
	renderCustomActions(props) {
		return <CustomActions {...props} />;
	}

	onSend(messages = []) {
		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}), () => {
			this.saveMessages();
			this.addMessages();
		})
	};

	// renderBubble allows to alter how message bubbles are displayed
	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: '#000',
						// usually is key and value, in this case a "black" colour wrapper for the text
					}
				}}
			/>
		)
	};

	// default system messages on the background
	renderSystemMessage(props) {
		return (
			<SystemMessage
				{...props}
				textStyle={{
					color: "#fff",
				}}
			/>
		);
	}

	// day message
	renderDay(props) {
		return (
			<Day
				{...props}
				textStyle={{
					color: "#fff",
				}}
			/>
		);
	}

	// hide/show input toolbar if offline/online
	renderInputToolbar(props) {
		if (this.state.isConnected == false) {
		} else {
			return (
				<InputToolbar
					{...props}
				/>
			);
		}
	}

	componentWillUnmount() {
		//unsubscribe from collection updates
		NetInfo.fetch().then((connection) => {
			if (connection.isConnected) {
				this.unsubscribe();
				this.authUnsubscribe();
			}
		});
	}

	render() {
		let bgColor = this.props.route.params.bgColor;

		return (
			<View style={styles.container}>
				<View style={{ ...styles.container, backgroundColor: bgColor ? bgColor : '#FFF' }}  >
					{/*renderBubble can be applied here to for customization */}
					<GiftedChat
						renderBubble={this.renderBubble.bind(this)}
						renderSystemMessage={this.renderSystemMessage.bind(this)}
						renderDay={this.renderDay.bind(this)}
						renderInputToolbar={this.renderInputToolbar.bind(this)}
						renderActions={this.renderCustomActions}
						renderCustomView={this.renderCustomView}
						messages={this.state.messages}
						onSend={(messages) => this.onSend(messages)}
						user={{
							_id: this.state.user._id,
							name: this.state.name,
							avatar: this.state.user.avatar,
						}}
					/>
					{/* //Cannot be inside Giftedchat or would be considerer a prom -> Error 
					"if" cannot be used as this is a JSX file for React*/}
					{Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
				</View>
			</View>
		)
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})