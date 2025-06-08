import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../credenciales';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const navigation = useNavigation();
  const uid = auth.currentUser?.uid;
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => {
    if (!uid) return;

    const fetchPhoto = async () => {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPhotoURL(data.photoURL || null);
        }
      } catch (error) {
        console.error('Error al obtener foto de perfil:', error);
      }
    };

    fetchPhoto();
  }, [uid]);

  return (
    <View style={styles.navbar}>
    {/* Logo izquierda con imagen */}
        <Image source={require('../assets/titulologo.png')} style={styles.logoImage} />

        {/* Avatar derecha */}
      <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c89b3c',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c89b3c',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#555',
    borderWidth: 1,
    borderColor: '#c89b3c',
  },
  logoImage: {
    width: 150,
    height: 95,
    resizeMode: 'contain',
    marginLeft: 10,
  },
});
