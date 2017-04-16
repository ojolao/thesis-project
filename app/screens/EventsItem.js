import React, { Component } from 'react';
import ReactNative from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ModalDropdown from 'react-native-modal-dropdown';
import { ActionCreators } from '../actions';

const {
  View,
  Text,
  TouchableHighlight,
  Image,
  ScrollView,
  StyleSheet,
} = ReactNative;

let baseURL;

if (process.env.NODE_ENV === 'production') {
  baseURL = 'https://hst-friend-ly.herokuapp.com';
} else if (process.env.NODE_ENV === 'staging') {
  baseURL = 'https://hst-friend-ly-staging.herokuapp.com';
} else {
  baseURL = 'http:/127.0.0.1:5000';
}

class EventsItem extends Component {
  constructor(props) {
    super(props);
    this.state = { participants: [] };
  }


  componentWillMount() {
    const { id } = this.props.navigation.state.params;

    // request all events from db
    fetch(baseURL + '/events/participants/list/:' + id)
    .then(response => response.json())
    .then((responseJSON) => {
      this.setState({ participants: responseJSON });
    });
  }

  createParticipants() {
    const { id } = this.props.navigation.state.params;
    console.log('participants id', id, this.props.navigation.state.params);
    return this.state.participants.map((participant, i) => {
      return (
        <View>
          { this.props.user.id === participant.user_id && 
            <ModalDropdown
              style={{ borderWidth: 0.5, borderRadius: 4, height: 20, width:60, backgroundColor: 'grey', flex: 1, alignItems: 'center'}}
              textStyle={{color: '#fff' }}
              adjustFrame={style => this.adjustFrame(style)}
              options={['yes', 'no', 'maybe']}
              defaultValue={participant.status}
              defaultIndex={['yes', 'no', 'maybe'].indexOf(participant.status)}
              onSelect={(idx, value) => this.changeResponse(idx, value, participant, id)}
          />
          }
          <Text key={i}>{participant.username}: {participant.status}</Text>
        </View>
      );
    });
  }

  adjustFrame(style) {
    style.height -= 65;
    return style;
  }
  changeResponse(idx, value, participant, eventID) {
    fetch( baseURL + '/events/participants/rsvp', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: eventID,
        participantId: participant.id,
        participantStatus: value,
      }),
    })
    .then(data => console.log(data))
    .catch(err => console.log(err));
  }

  render() {
    const { name, description, eventDate, location, startTime, endTime, username, photourl } = this.props.navigation.state.params;
    console.log('this.state.participants', this.state.participants);
    return (
      <ScrollView>
        <Text>{description}</Text>
        <Text>{eventDate}</Text>
        <Text>{location}</Text>
        <Text>Starts: {startTime}</Text>
        <Text>Ends: {endTime}</Text>
        <Text>Hosted by: {username}</Text>
        <Image
          style={{ width: 80, height: 80, borderRadius: 40 }}
          source={{ uri: photourl }}
        />
        <ScrollView>
          <Text>Invitees:</Text>
          {this.createParticipants()}
        </ScrollView>
      </ScrollView>
    );
  }
}


function mapStateToProps(state) {
  return { simpleCounter: state.simpleCounter, user: state.user };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EventsItem);
