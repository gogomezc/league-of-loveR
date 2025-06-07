import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../credenciales';
import { StatusBar, ActivityIndicator } from 'react-native';


export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); //para el botón de mostrar/ocultar contraseña
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const perfil = docSnap.data();
        navigation.replace('Home', { perfil });
      } else {
        Alert.alert('Error', 'No se encontró el perfil del usuario.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Credenciales no ingresadas');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ImageBackground
      source={require('../assets/fondo.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <Image source={require('../assets/logossf.png')} style={styles.logo} />
        <Text style={styles.title}>INICIA SESIÓN</Text>

        <TextInput
          placeholder="Correo electrónico"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#ccc"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Contraseña"
            style={[styles.input, { marginBottom: 0, flex: 1 }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showButton}
          >
            <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>
              {showPassword ? '⛔' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>INGRESAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 20, alignSelf: 'center' }}
          onPress={() => navigation.replace('Register')}
        >
          <Text style={{ color: 'white', textDecorationLine: 'underline' }}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    borderRadius: 30,
    marginBottom: 0,
    marginTop: -100,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFD700', // dorado
    marginBottom: 20,
    marginTop: -25,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 15,
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: 'white',
  },
  button: {
    backgroundColor: 'gold',
    padding: 15,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
    borderWidth: 2, // Agrega borde blanco
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  showButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
