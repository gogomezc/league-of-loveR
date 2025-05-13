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

export default function Perfil({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
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
    try {
      await deleteDoc(doc(db, 'users', uid));
      Alert.alert('Perfil eliminado. Redirigiendo a Login.');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo eliminar el perfil.');
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
      source={require('../assets/perfilF.jpg')}
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
          <Text style={styles.title}>Mi Perfil</Text>

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

          {perfil.photoURL ? (
            <Image source={{ uri: perfil.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={{ color: 'white' }}>Sin foto</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={guardarCambios}>
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={eliminarPerfil}>
            <Text style={styles.deleteButtonText}>Eliminar Perfil</Text>
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
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
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
    marginTop: 10,
  },
  buttonText: {
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
