import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, Animated, PanResponder } from 'react-native';
import Expo from 'expo'
const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
const NumUsers = 7
var image = require('./../images/d3rs.jpg')
import Icon from 'react-native-vector-icons/Ionicons'
import {userToken3} from './Login'
import {userToken1} from './CheckAuth'
import {userToken2} from './RegCompleteProfile'
import {Header, Title, Left, Right, Body, Content, Container, Button} from "native-base";

const APIcall      = require("../API_calls/APIs");

var userToken;
//var userToken2;
var apiURL = APIcall.apiURL;
const Users = []
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
//var userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNWJlZjUxNTM3YjQ0NTg3YzlmM2ZmMDRmIiwiaWF0IjoxNTQyNDI1NjM0LCJleHAiOjE1NDI0MzI4MzR9.yj8_g1Vd43fR_6-AciWbjFzPZOZSrlLw0JylSteBz8o"
export default class Matches extends React.Component {

  constructor() {
    super()

    this.position = new Animated.ValueXY()
    this.state = {
      currentIndex: -1
    }

    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    })

    this.rotateAndTranslate = {
      transform: [{
        rotate: this.rotate
      },
      ...this.position.getTranslateTransform()
      ]
    }
    this.likehandler = (itemid) => {
      if(this.position.x < SCREEN_WIDTH / 2){
      }
    }
    this.likeOpacity= this.position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp'
    })
    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp'
    })
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    })

  }

   

  static navigationOptions = {
    header: null,
  };
   //Function that grabs a user from the database.
   getUser = async () => {
    userToken= await Expo.SecureStore.getItemAsync("userToken");

    if (userToken != null) {
      console.log(userToken);
      var grabUser = {
        method: 'GET',
        headers: {
          'Authorization': userToken
        },
      };
      await fetch(apiURL + '/user/getpotconn', grabUser)
      .then((response) => response.json())
      .then((response) => {
          if(response.success){
            if(response.array){
            var array = JSON.parse(response.array);
            for(let i=0; i< array.length; i++){
              Users[i] = (array[i]);
            }
          }
        }
      })
      .then( this.setState({ currentIndex: 0}, () => {
        this.position.setValue({ x: 0, y: 0 })
     }));
              
  };
}


  componentWillMount() {
    this.PanResponder = PanResponder.create({

      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {

        this.position.setValue({ x: gestureState.dx, y: gestureState.dy })
      },
      onPanResponderRelease: (evt, gestureState) => {

        if (gestureState.dx > 120) {
          console.log(20);
           Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 500, y: gestureState.dy },
            speed:200,
          }).start(async() => {
           await APIcall.likedUser(Users[this.state.currentIndex]._id);
           if(this.state.currentIndex ==NumUsers-1){
            await this.getUser();
            }
            else {
             await this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
            this.position.setValue({ x: 0, y: 0 })
            })
          }
          })

        }
        else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            speed:200,
          }).start(() => {
            APIcall.dislikedUser(Users[this.state.currentIndex]._id);
            if(this.state.currentIndex ==0){
              this.getUser();
             this.setState({ currentIndex: NumUsers-1 }, () => {
               this.position.setValue({ x: 0, y: 0 })
            });
           }
           else {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            })
          }
          })
        }
        else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4
          }).start()
        }
      }
    })
    this.getUser();
  }

  renderUsers = () => {

    return Users.map((item, i) => {
      if(this.state.currentIndex == -1){
        return(
          <Text key={item._id} >LOADING</Text>
        )
      }

      if (i < this.state.currentIndex) {
        return null
      }
      else if (i == this.state.currentIndex ) {

        return (
         
          <Animated.View
            {...this.PanResponder.panHandlers}
            key={item._id} style={[this.rotateAndTranslate, { height: SCREEN_HEIGHT*0.75, width: SCREEN_WIDTH, padding: 10, position: 'absolute' }]}>
          
              <Header  iosBarStyle='light-content' androidStatusBarColor='#ffffff' style={styles.Name}>
            <Left/>
            <Body>
            <Text style={styles.NameText}>{item.firstName + " " + item.lastName}</Text>
            </Body>
            <Right />
            </Header>
            
            <Animated.View style={{ opacity: this.likeOpacity, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 300 }}>
              <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>
            </Animated.View>

            <Animated.View style={{ opacity: this.dislikeOpacity, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 300 }}>
              <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>
            </Animated.View>
           
           <Container style={styles.Image}>
            <Image
              style={{ flex: 1, height: null, width: width*0.85, resizeMode: 'cover', borderRadius: 20, backgroundColor: 'black' }}
              source={image} />
            </Container>

            {/* <Container style={styles.Tags}>
            <Text style = {styles.Tag}>IA</Text>
            <Text style = {styles.Tag}>IB</Text>
            </Container>  */}

            <Container style= {styles.BIO}>
            <Text style={styles.BIOText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed mi ex. Proin luctus, purus non faucibus bibendum, ligula justo blandit quam, interdum elementum dui eros sed erat. Aliquam consectetur massa id augue viverra facilisis.  </Text>
            </Container>
          
          </Animated.View>
          
        )
      }
      else {
        console.log(item);
        return (
          <Animated.View
            key={item._id} style={[{
              opacity: this.nextCardOpacity,
              transform: [{ scale: this.nextCardScale }],
              height: SCREEN_HEIGHT*0.75, width: SCREEN_WIDTH, padding: 10, position: 'absolute'
            }]}>
             <Header  iosBarStyle='light-content' androidStatusBarColor='#ffffff' style={styles.Name}>
            <Left/>
            <Body>
             
            <Text style={styles.NameText}>{ Users[this.state.currentIndex].firstname? Users[this.state.currentIndex].firstName + " " + Users[this.state.currentIndex].lastName : " "}</Text>
            </Body>
            <Right />
            </Header>
            <Animated.View style={{ opacity: 0, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
              <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>

            </Animated.View>

            <Animated.View style={{ opacity: 0, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 1000 }}>
              <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>

            </Animated.View>

             <Container style={styles.Image}>
            <Image
              style={{ flex: 1, height: null, width: width*0.85, resizeMode: 'cover', borderRadius: 20, backgroundColor: 'black' }}
              source={image} />
            </Container>

            <Container style= {styles.BIO}>
            <Text style={styles.BIOText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed mi ex. Proin luctus, purus non faucibus bibendum, ligula justo blandit quam, interdum elementum dui eros sed erat. Aliquam consectetur massa id augue viverra facilisis.  </Text>
            </Container>
            
          </Animated.View>
        )
      }
    }).reverse()
  }

  render() {
    return (
      <Container>
      
      <Header  iosBarStyle='light-content' androidStatusBarColor='#ffffff' style={styles.header}>
            <Left/>
            <Body>
            <Title style={styles.headerTitle}>Matching</Title>
            </Body>
            <Right />
            </Header>
      <View style={{ flex: 1 }}>
        <View style={{ height: 0 }}>
       
            
          
        </View>
        <View style={{ flex: 1 }}>
          {this.renderUsers()}
        </View>
        <View style={{ height: 0 }}>

        </View>
        <Button
            title = "Instant Match"
            color = "black"
            onPress = {()=>{ this.props.navigation.navigate('InstantMatches');}}
        />
      </View>
      
      </Container>

    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100
  },centerCards: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    flex: 1,
    width: width * 0.8
  },
  cardImg: {
    width: 85,
    height: 85
  },
  centerText: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center"
  },
  avatarImg: {
    width: 75,
    height: 75
  },
  avatarCard:{
    marginTop: 20,
    marginBottom : 24,
    flex: 1,
    width: 100
  },
  header:{
    backgroundColor: '#2c2638',
    height: height*0.1
  },
  headerTitle:{
    paddingTop:height*0.03,
    fontFamily: 'BebasNeue',
    fontSize : 25,
    textAlign: 'center',
    color: '#ffffff',
    justifyContent: "center",
    alignItems: "center",
  },
  Name:{
    backgroundColor: '#2c2638',
    height: height*0.07,
    
    marginBottom: height*0.03,
    marginTop: height*0.02,
    width: width*0.9,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius:10,
    opacity: 0.9
  },
  Image:{
    flex:1,
    backgroundColor: 'transparent',
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  Tags:{
    height: height*0.05,
    paddingTop: height*0.02,
    backgroundColor: 'transparent',
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: 'row',
  },
  Tag:{
    flex:0.3,
    backgroundColor: 'transparent',
    textAlign: 'center',
    height: 0.001*height,
  },
  NameText:{
    fontFamily: 'BebasNeue',
    fontSize : 23,
    textAlign: 'center',
    color: '#ffffff',
    justifyContent: "center",
    alignItems: "center",
  },
  BIO:{
    marginTop: height*0.04,
    flex: 0.4,
    height: height*0.4,
    flexDirection:'row',
    paddingTop:15,
    paddingLeft: 15,
    paddingRight: 5,
    backgroundColor: '#2c2638',
    marginBottom: height*0.03,
    
    width: width*0.9,
    alignSelf: 'center',
    borderRadius:10,
    opacity: 0.9,
  },
  BIOText:{
    flex: 1,
    flexDirection:'row',
    marginTop: 0,
    fontFamily: 'BebasNeue',
    fontSize : 19,
    color: '#ffffff',
    textAlign: "left",
    flexWrap: "wrap",
  },
  numberText:{
    fontSize:19,
    color:'#463143',
    marginRight: 5,
    fontFamily: 'Poppins-Bold'
  },
  titleText:{
    fontSize:19,
    color:'#414345',
    fontFamily: 'Poppins'
  },
  subTitleText:{
    fontSize:14,
    color: 'grey',
    fontFamily: 'Poppins'
  },
  rowContainer: {
    flex:0,
    justifyContent: 'center',
    alignItems:'center',
    flexDirection: 'row'
  },
  avatarText:{
    fontFamily: 'Poppins'
  }

});
