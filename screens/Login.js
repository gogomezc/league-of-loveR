import { Text, StyleSheet, View, Image, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../credenciales'; // Importa la instancia de autenticación
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa el método de inicio de sesión

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // Manejar el estado del teclado
    React.useEffect(() => {
      const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        setIsKeyboardVisible(true);
      });
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setIsKeyboardVisible(false);
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);
    
    //logica de inicio de sesión
  const handleLogin = async () => {
    try {
      // Lógica de inicio de sesión con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Usuario logueado:', userCredential.user);
      navigation.replace('Home'); // Navega a la pantalla "Home" después de iniciar sesión
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Correo o contraseña incorrectos.');
    }
  };

  return (
    <View style={[styles.padre, isKeyboardVisible && styles.padreConTeclado]}>
      <View>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'black' }}>League of Love</Text>
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.cajaTexto}>
          <TextInput
            placeholder="Correo"
            value={email}
            onChangeText={setEmail}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
        </View>
        <View>
          <TouchableOpacity
            style={{ backgroundColor: 'gold', padding: 10, borderRadius: 10 }}
            onPress={handleLogin} // Llama a la función handleLogin al presionar
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={{ marginTop: 20, alignSelf: 'center' }}
            onPress={() => navigation.navigate('Register')} // Navega a la pantalla de registro
          >
            <Text style={{ color: 'blue' }}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={{ marginTop: 20, alignSelf: 'center' }}
            onPress={() => navigation.navigate('ForgotPassword')} // Navega a la pantalla de recuperación de contraseña
          >
            <Text style={{ color: 'blue' }}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padre: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  padreConTeclado: {
    marginTop: -100, // Mueve la vista hacia arriba cuando el teclado está visible
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  tarjeta: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});