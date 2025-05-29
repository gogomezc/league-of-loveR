import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';       
import { RIOT_API_KEY } from '@env'; 
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../credenciales';

export default function Registrarse({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [nickname, setNickname] = useState('');
  const [rolFavorito, setRolFavorito] = useState(''); // jungla, soporte, top, adc o mid
  const [champFavorito, setChampFavorito] = useState(''); // Nombre del campeón favorito
           
  const [champions, setChampions] = useState([]);  //  para listar todos los campeones  
  const [version, setVersion] = useState(null); 

    //  estados para perfil de invocador enlazado

  //  al montar el componente, traemos la lista de campeones
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        // Obtenemos la lista de versiones para escoger la última
        const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const latestVersion = versionsRes.data[0];
        setVersion(latestVersion);  // <-- guardamos la versión más reciente para usarla después
        // Con la versión más reciente, pedimos todos los campeones
        const champsRes = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
        );
        // Transformamos el objeto en un array de { key, name }
        const champsArray = Object.values(champsRes.data.data).map(item => ({
          key: item.id,      // ej. "Aatrox"
          name: item.name,   // ej. "Aatrox" se ven igual desde que lo trae la API y cmo se guarda en texto 
        }));
        setChampions(champsArray);  // <-- guardamos en el estado
      } catch (error) {
        console.error('Error cargando lista de campeones:', error);
      }
    };
    fetchChampions();
  }, []); // <--  dependencia vacía para que corra solo 1 vez









  const handleRegister = async () => {
    if (!email || !password || !name || !age) {
      // Validación simple para asegurarse de que todos los campos estén completos
      Alert.alert('Campos incompletos!', 'Por favor completa todos los campos.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        age: parseInt(age),
        nickname,
        email,
        rolFavorito, // jungla, soporte, top, adc o mid
        champFavorito,
        photoURL: "https://i.pinimg.com/736x/55/d7/dc/55d7dc610a289612cd2b49654bf0e1ea.jpg", // URL de la foto de perfil por defecto
        swipes: { like: [], dislike: [] },
        matches: {},
        version,
        
      });

      Alert.alert('Registro exitoso');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al registrar', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/registrarseF.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 40,
              left: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              padding: 8,
            }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: 'white', fontSize: 24 }}>{'\u2190'}</Text>
          </TouchableOpacity>

          <Image source={require('../assets/logossf.png')} style={styles.logo} />
          <Text style={styles.title}>Registrate aquí</Text>

          <Text style={styles.subtitle}>👤 Datos personales</Text>
          <TextInput
            placeholder="Nombre"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#ccc"
          />
          <TextInput
            placeholder="Correo"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#ccc"
          />
          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#ccc"
          />
          <TextInput
            placeholder="Edad"
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#ccc"
          />
          <TextInput
            placeholder="Apodo (opcional)"
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholderTextColor="#ccc"
          />

          <Text style={styles.subtitle}>👾 Datos de jugador</Text>

          {/* Menú desplegable para rol favorito */}
          <View style={[styles.input, { padding: 0, justifyContent: 'center' }]}>
            <Picker
              selectedValue={rolFavorito}
              style={{ color: 'white', width: '100%' }}
              dropdownIconColor="white"
              onValueChange={(itemValue) => setRolFavorito(itemValue)}
            >
              <Picker.Item label="Selecciona tu rol favorito..." value="" color="#ccc" />
              <Picker.Item label="Superior (Toplaner)" value="top" />
              <Picker.Item label="Jungla (JG)" value="jungla" />
              <Picker.Item label="Central (Midlaner)" value="mid" />
              <Picker.Item label="Tirador (ADC - Botlaner)" value="adc" />
              <Picker.Item label="Soporte (Support)" value="soporte" />
            </Picker>
          </View>

          {/* Menú desplegable para campeón favorito */}
          <View
            style={[
              styles.input,
              {
                padding: 0,
                flexDirection: 'row',       
                alignItems: 'center',      
              }
            ]}
          >
            <Picker
              selectedValue={champFavorito}
              style={{ color: 'white', flex: 1 }}   //  ocupa todo el ancho restante
              dropdownIconColor="white"
              onValueChange={setChampFavorito}
            >
              <Picker.Item label="Selecciona tu campeón favorito..." value="" color="#ccc" />
              {champions.map(champ => (
                <Picker.Item key={champ.key} label={champ.name} value={champ.key} />
              ))}
            </Picker>

            {/* Imagen del campeón */}
            {champFavorito && version && (      //solo si hay selección y versión
              <Image
                source={{
                  uri: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champFavorito}.png`
                }}
                style={{
                  width: 40,       // tamaño del icono
                  height: 40,
                  marginLeft: 8,   // espacio entre picker e imagen
                }}
              />
            )}
          </View>           




          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20, alignSelf: 'center' }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: 'white' }}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', // Fondo más oscuro
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 35,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#FFD700', // dorado
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },  
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', // Fondo suave del input
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: 'white',
    fontWeight: '500',
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
