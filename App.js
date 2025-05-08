import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Home from './screens/Home';
import Registrarse from './screens/registrarse';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerTitleAlign: 'center',
            headerTintColor: 'gold',
            headerTitleStyle: { fontSize: 24 },
            headerStyle: { backgroundColor: 'white' },
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            gestureEnabled: false,
            headerTitleAlign: 'center',
            headerTintColor: 'gold',
            headerTitleStyle: { fontSize: 24 },
            headerStyle: { backgroundColor: 'white' },
          }}
        />
        <Stack.Screen
          name="Register"
          component={Registrarse}
          options={{
            gestureEnabled: false,
            headerTitleAlign: 'center',
            headerTintColor: 'gold',
            headerTitleStyle: { fontSize: 24 },
            headerStyle: { backgroundColor: 'white' },
          }}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}