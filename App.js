import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Home from './screens/Home';
import Registrarse from './screens/registrarse';
import Perfil from './screens/Perfil';
import Matches from './screens/Matches';
import Chat from './screens/Chat';



const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
          headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
         options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Registrarse}
          options={{
          headerShown: false,
          }}
        />
          <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{
              headerShown: false,
          }}
        />
        <Stack.Screen
          name="Matches"
          component={Matches}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
