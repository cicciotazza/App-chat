import React from 'react';
//KeyboardAvoidingView importer to fix keyboard issues for older Android devices
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
//import GiftedChat, a popular chat UI library 
import { GiftedChat, Bubble, Day, SystemMessage } from 'react-native-gifted-chat';
//--https://github.com/FaridSafi/react-native-gifted-chat--

export class Chat extends React.Component {
	constructor() {
		super();
		this.state = {
			messages: [],
		};
	};

	componentDidMount() {
		//name given back from the router in Start
		let name = this.props.route.params.name;
		//above name passed into here as a title
		this.props.navigation.setOptions({ title: name });

		this.setState({
			messages: [
				{
					_id: 1,
					//greeting message in chat
					text: 'Hi developer',
					createdAt: new Date(),
					user: {
						_id: 2,
						name: 'React Native',
						avatar: 'https://placeimg.com/140/140/any',
					},
				},
				{
					_id: 2,
					text: 'Message provided by App-Chat',
					createdAt: new Date(),
					system: true,
				},
			],
		});
	}

	onSend(messages = []) {
		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}));
	};

	//renderBubble allows to alter how message bubbles are displayed
	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: '#000',
						//usually is key and value, in this case a "black" colour wrapper for the text
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
							_id: 1,
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