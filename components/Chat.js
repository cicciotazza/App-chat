import React from 'react';
// KeyboardAvoidingView importer to fix keyboard issues for older Android devices
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
// import GiftedChat, a popular chat UI library 
//--https://github.com/FaridSafi/react-native-gifted-chat--
import { GiftedChat, Bubble, Day, SystemMessage } from 'react-native-gifted-chat';
// import Firebase for storing messages and authenticate
import * as firebase from 'firebase';
import "firebase/firestore";

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
			user: {
				_id: "",
				name: "",
				avatar: "",
			},
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

	componentDidMount() {
		// name given back from the router in Start
		let name = this.props.route.params.name;
		// above name passed into here as a title
		this.props.navigation.setOptions({ title: name });

		// anonymous authentication
		this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
			if (!user) {
				await firebase.auth().signInAnonymously();
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
			});
			// waiting for updates in the collection
			this.unsubscribe = this.referenceChatMessages
				.orderBy("createdAt", "desc")
				.onSnapshot(this.onCollectionUpdate)
		});
	};

	// Allow to send messages to database
	addMessages() {
		const message = this.state.messages[0];
		// this adds new messages to the collection
		this.referenceChatMessages.add({
			_id: message._id,
			text: message.text || "",
			createdAt: message.createdAt,
			user: this.state.user
		});
	}

	onSend(messages = []) {
		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}), () => {
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

	// when get updates will fetch messages from the querySnapshot as current data 
	onCollectionUpdate = (querySnapshot) => {
		const messages = [];
		// go through each document
		querySnapshot.forEach((doc) => {
			// get the QueryDocumentSnapshot's data
			let data = doc.data();
			messages.push({
				_id: data._id,
				text: data.text,
				createdAt: data.createdAt.toDate(),
				user: {
					_id: data.user._id,
					name: data.user.name,
					avatar: data.user.avatar
				}
			});
		});
		// start querying your database
		this.setState({
			messages: messages
		});
	};

	componentWillUnmount() {
		//unsubscribe from collection updates
		this.authUnsubscribe();
		this.unsubscribe();
	}

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
						messages={this.state.messages}
						onSend={(messages) => this.onSend(messages)}
						user={{
							_id: this.state.user._id,
							name: this.state.user.name,
							avatar: this.state.user.avatar
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