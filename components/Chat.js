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
	appId: "1:293480862484:web:d1b6c89d24e38ed27ae801"
};

export class Chat extends React.Component {
	constructor() {
		super();
		this.state = {
			messages: [],
			uid: 0,
			loggedInText: 'Please wait, you are getting logged in',
			user: {
				_id: '',
				name: '',
				avatar: '',
			},
			isConnected: false,
			image: null,
			location: null
		};

		//initialize firebase
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig);
		}

		// reference to the Firestore messages collection
		this.referenceChatMessages = firebase.firestore().collection('messages');
		this.refMsgsUser = null;

	};

	onCollectionUpdate = QuerySnapshot => {
		const messages = [];
		// go through each document
		QuerySnapshot.forEach(doc => {
			// get the queryDocumentSnapshot's data
			let data = doc.data();
			messages.push({
				_id: data._id,
				text: data.text,
				createdAt: data.createdAt.toDate(),
				user: {
					_id: data.user._id,
					name: data.user.name,
					avatar: data.user.avatar,
				},
				image: data.image || null,
				location: data.location || null,
			});
		});
		this.setState({
			messages: messages,
		});
	};

	// get messages from AsyncStorage
	getMessages = async () => {
		let messages = '';
		try {
			messages = (await AsyncStorage.getItem('messages')) || [];
			this.setState({
				messages: JSON.parse(messages),
			});
		} catch (error) {
			console.log(error.message);
		}
	};

	// save messages on the asyncStorage
	saveMessages = async () => {
		try {
			await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
		} catch (error) {
			console.log(error.message);
		}
	};

	// delete message from asyncStorage
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
		// Set the page title once Chat is loaded
		let name = this.props.route.params.name;
		// Adds the name to top of screen
		this.props.navigation.setOptions({ title: name })

		// check if user is online
		NetInfo.fetch().then(connection => {
			if (connection.isConnected) {
				this.setState({ isConnected: true });
				console.log('online');
				// listens for updates in the collection
				this.unsubscribe = this.referenceChatMessages
					.orderBy('createdAt', 'desc')
					.onSnapshot(this.onCollectionUpdate);

				// user authentication
				this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
					if (!user) {
						return await firebase.auth().signInAnonymously();
					}

					//update user state with currently active user data
					this.setState({
						uid: user.uid,
						messages: [],
						user: {
							_id: user.uid,
							name: name,
							avatar: "https://placeimg.com/140/140/any",
						},
					});

					//referencing messages of current user
					this.refMsgsUser = firebase
						.firestore()
						.collection('messages')
						.where('uid', '==', this.state.uid);
				});

				// save messages locally to AsyncStorage
				this.saveMessages();
			} else {
				// if the user is offline
				this.setState({ isConnected: false });
				console.log('offline');
				this.getMessages();
			}
		});
	}

	// Add messages to database
	addMessages() {
		const message = this.state.messages[0];
		// add a new message to the collection
		this.referenceChatMessages.add({
			_id: message._id,
			text: message.text || '',
			createdAt: message.createdAt,
			user: this.state.user,
			image: message.image || "",
			location: message.location || null
		});
	}

	// Returns a mapview when user adds a location to current message
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

	// action button to access custom features
	renderCustomActions(props) {
		return <CustomActions {...props} />;
	}

	//attaches messages to chat
	onSend(messages = []) {
		this.setState(
			previousState => ({
				messages: GiftedChat.append(previousState.messages, messages),
			}),
			() => {
				this.saveMessages();
				this.addMessages();
			});
	}

	//customizes text bubbles
	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: '#000',
					}
				}}
			/>
		)
	};

	// customizes system messages
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

	// customizes day messages
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

	//customizes input toolbar if online
	renderInputToolbar(props) {
		if (this.state.isConnected == false) {
		} else {
			return <InputToolbar {...props} />;
		}
	}

	componentWillUnmount() {
		// close connections when we close the app
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