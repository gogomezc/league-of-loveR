import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
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
        console.log('Perfil cargado:', docSnap.data());
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
      <View style={styles.container}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={perfil.name}
        onChangeText={(text) => setPerfil({ ...perfil, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Edad"
        value={perfil.age ? perfil.age.toString() : ''}
        onChangeText={(text) => setPerfil({ ...perfil, age: parseInt(text) || 0 })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Nickname"
        value={perfil.nickname}
        onChangeText={(text) => setPerfil({ ...perfil, nickname: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Link de imagen de perfil"
        value={perfil.photoURL}
        onChangeText={(text) => setPerfil({ ...perfil, photoURL: text })}
      />

      {perfil.photoURL ? (
        <Image source={{ uri: perfil.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text>Sin foto</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={guardarCambios}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={eliminarPerfil}>
        <Text style={styles.deleteButtonText}>Eliminar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
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
    marginBottom: 15,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#ccc',
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
