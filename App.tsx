import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, HomeScreen, RegistrationScreen, VideoScreen } from './src/screens';
import {decode, encode} from 'base-64';
import { firebase } from './src/firebase/config';
import { LogBox, View, Text, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons,FontAwesome5 } from '@expo/vector-icons';

LogBox.ignoreLogs(['Setting a timer']);

if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();

const HomeStack = createStackNavigator();
function HomeStackScreen({ user }: any) {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" options={{ title: 'Feed' }}>
        {props => <HomeScreen {...props} extraData={user} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="Details" component={DetailsScreen} />
    </HomeStack.Navigator>
  );
}

function SettingsScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Tela de configurações</Text>
      {/* <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      /> */}
    </View>
  );
}

function DetailsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center',  alignItems: 'center' }}>
      <Text>Details!</Text>
    </View>
  );
}

const SettingsStack = createStackNavigator();
function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      <SettingsStack.Screen name="Details" component={DetailsScreen} />
    </SettingsStack.Navigator>
  );
}


const VideoStack = createStackNavigator();
function VideoStackScreen() {
  return (
    <VideoStack.Navigator>
      <VideoStack.Screen name="Video" options={{ title: 'Vídeo' }} component={VideoScreen} />
    </VideoStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null)

  useEffect(() => {
    const usersRef = firebase.firestore().collection('users');
    console.log(usersRef);
    firebase.auth().onAuthStateChanged((user: { uid: any; }) => {
      console.log(user);
      if (user) {
        usersRef
          .doc(user.uid)
          .get()
          .then((document: { data: () => any; }) => {
            const userData = document.data()
            console.log(userData);
            setUser(userData)

            setLoading(false)
          })
          .catch((error: any) => {
            setLoading(false)
          });
      } else {
        setLoading(false)
      }
    });
  }, []);

  return (
    <>
      {loading ? <></> : (
        <NavigationContainer>
            { user ? (
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Home') {
                      return <Ionicons name="ios-home" size={size} color={color} />
                    } else if (route.name === 'Settings') {
                      const iconName = focused
                      ? 'ios-list-box'
                      : 'ios-list';
                      return <Ionicons name={iconName} size={size} color={color} />
                    } else if (route.name === 'Video') {
                      return <FontAwesome5 name="video" size={size} color={color} />
                    }

                    return <Ionicons name="ios-home" size={size} color={color} />
                  },
                })}
                tabBarOptions={{
                  activeTintColor: 'tomato',
                  inactiveTintColor: 'gray',
                  showLabel: false,
                }}
              >
                <Tab.Screen name="Home" children={()=><HomeStackScreen user={user}/>} />
                <Tab.Screen name="Video" component={VideoStackScreen} />
                <Tab.Screen name="Settings" component={SettingsStackScreen} />
              </Tab.Navigator>
            ) : (
              <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
                <Stack.Screen name="Registration" component={RegistrationScreen} options={{ title: 'Cadastro' }} />
              </Stack.Navigator>
            )}
        </NavigationContainer>
      )}
    </>
  );
}