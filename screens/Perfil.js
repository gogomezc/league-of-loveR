import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth, db } from '../credenciales';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import axios from 'axios'; // Asegúrate de tener axios instalado
import { Picker } from '@react-native-picker/picker'; // Asegúrate de tener @react-native-picker/picker instalado



export default function Perfil({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;
  const [champions, setChampions] = useState([]);
  const [version, setVersion] = useState(null);

  useEffect(() => {

    const fetchChampions = async () => {
      try {
        const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const latestVersion = versionsRes.data[0];
        setVersion(latestVersion);
        const champsRes = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
        );
        const champsArray = Object.values(champsRes.data.data).map(item => ({
          key: item.id,
          name: item.name,
        }));
        setChampions(champsArray);
      } catch (error) {
        console.error('Error cargando lista de campeones:', error);
      }
    };
    fetchChampions();
  

    if (!uid) {
      Alert.alert('Sesión expirada', 'Debes iniciar sesión nuevamente.');
      navigation.navigate('Login');
      return;
    }
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPerfil(docSnap.data());
      } else {
        Alert.alert('Error', 'No se encontró el perfil.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error al cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, perfil);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const eliminarPerfil = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer.',
      [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
        try {
          await deleteDoc(doc(db, 'users', uid));
          Alert.alert('Perfil eliminado. Redirigiendo a Login.');
          navigation.navigate('Login');
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'No se pudo eliminar el perfil.');
        }
        },
      },
      ]
    );
  };

  const cerrarSesion = async () => {
    try {
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  if (loading || !perfil) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/editarperfil.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={{ color: 'white', fontSize: 22 }}>🏠</Text>
          </TouchableOpacity>          
          <Text style={styles.title}>Mis datos personales</Text>

          {perfil.photoURL ? (
            <Image source={{ uri: perfil.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={{ color: 'white' }}>Sin foto</Text>
            </View>
          )}

          <Text style={styles.subtitle}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={perfil.name}
            onChangeText={(text) => setPerfil({ ...perfil, name: text })}
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            value={perfil.age ? perfil.age.toString() : ''}
            onChangeText={(text) => setPerfil({ ...perfil, age: parseInt(text) || 0 })}
            keyboardType="numeric"
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            value={perfil.nickname}
            onChangeText={(text) => setPerfil({ ...perfil, nickname: text })}
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Link de imagen de perfil"
            value={perfil.photoURL}
            onChangeText={(text) => setPerfil({ ...perfil, photoURL: text })}
            placeholderTextColor="#ccc"
          />

          <View style={[styles.input, { padding: 0, justifyContent: 'center' }]}>
            
            <Picker
              selectedValue={perfil.genero}
              style={{ color: 'white', width: '100%' }}
              dropdownIconColor="white"
              onValueChange={(itemValue) => setPerfil({ ...perfil, genero: itemValue })}
            >
              <Picker.Item label="Selecciona tu género..." value="" color="#ccc" />
              <Picker.Item label="Masculino ♂️" value="masculino" />
              <Picker.Item label="Femenino ♀️" value="femenino" />
              <Picker.Item label="No binario ⚧️" value="no binario" />
            </Picker>
          </View>


          <Text style={styles.title}>Mis preferencias</Text>

          <View style={[styles.input, { padding: 0, justifyContent: 'center' }]}>
            <Picker
              selectedValue={perfil.rolFavorito}
              style={{ color: 'white', width: '100%' }}
              dropdownIconColor="white"
              onValueChange={(itemValue) => setPerfil({ ...perfil, rolFavorito: itemValue })}
            >
              <Picker.Item label="Selecciona tu rol favorito..." value="" color="#ccc" />
              <Picker.Item label="Superior (Toplaner)" value="top" />
              <Picker.Item label="Jungla (JG)" value="jungla" />
              <Picker.Item label="Central (Midlaner)" value="mid" />
              <Picker.Item label="Tirador (ADC - Botlaner)" value="adc" />
              <Picker.Item label="Soporte (Support)" value="soporte" />
            </Picker>
          </View>
                    
          <View style={[styles.input, { padding: 0, flexDirection: 'row', alignItems: 'center' }]}>
            <Picker
              selectedValue={perfil.champFavorito}
              style={{ color: 'white', flex: 1 }}
              dropdownIconColor="white"
              onValueChange={(itemValue) => setPerfil({ ...perfil, champFavorito: itemValue })}
            >
              <Picker.Item label="Selecciona tu campeón favorito..." value="" color="#ccc" />
              {champions.map(champ => (
                <Picker.Item key={champ.key} label={champ.name} value={champ.key} />
              ))}
            </Picker>
            {perfil.champFavorito && version && (
              <Image
                source={{
                  uri: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${perfil.champFavorito}.png`
                }}
                style={{
                  width: 40,
                  height: 40,
                  marginLeft: -500,
                }}
              />
            )}
          </View>          



          <TouchableOpacity style={styles.button} onPress={guardarCambios}>
            <Text style={styles.buttonText}>Guardar Cambios 💾</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={eliminarPerfil}>
            <Text style={styles.deleteButtonText}>Eliminar Perfil 🚯</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button2} onPress={cerrarSesion}>
            <Text style={styles.buttonText2}>Cerrar Sesión</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    marginTop: 80,
  },
  subtitle: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 10,
    marginRight: 280,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: 'white',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c89b3c',
  },
  avatarPlaceholder: {
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button2: {
    backgroundColor: 'rgb(175, 33, 95)', // dorado
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText2: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 30,
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
