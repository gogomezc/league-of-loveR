import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../credenciales'; // asegúrate que exportes `db` desde credenciales.js

export default function Registrarse({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [nickname, setNickname] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Detectar visibilidad del teclado
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !name || !age || !nickname) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Crear perfil en Firestore
      await setDoc(doc(db, 'users', uid), {
        name,
        age: parseInt(age),
        nickname,
        email,         // opcional pero útil
        photoURL: "",  // se puede actualizar después
        swipes: [],
        matches: []
      });

      Alert.alert('Registro exitoso');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al registrar', error.message);
    }
  };

  return (
    <View style={[styles.container, isKeyboardVisible && styles.containerConTeclado]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Registrarse</Text>

      <TextInput placeholder="Nombre" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Edad" style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInput placeholder="Nickname LoL" style={styles.input} value={nickname} onChangeText={setNickname} />
      <TextInput placeholder="Correo" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Contraseña" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 20, alignSelf: 'center' }} onPress={() => navigation.navigate('Login')}>
        <Text style={{ color: 'blue' }}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  containerConTeclado: {
    marginTop: -200,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'gold',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
