import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { db, auth } from '../credenciales';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  Dimensions,
} from 'firebase/firestore';
import CardSwipe from '../components/CardSwipe';
import Navbar from '../components/navbar';
import axios from 'axios';
import { TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // O el ícono que prefieras
import Modal from 'react-native-modal';



export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [index, setIndex] = useState(0);
  const [cargando, setCargando] = useState(true);
  const uidActual = auth.currentUser?.uid;
  const [version, setVersion] = useState('');
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroRol, setFiltroRol] = useState('');     
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        setVersion(res.data[0]);
      } catch (error) {
        console.error('Error obteniendo versión de LoL:', error);
      }
    };
    fetchVersion();
    if (!uidActual) return;
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, async snapshot => {
      setCargando(true);
      const lista = [];
      const miSnap = await getDoc(doc(db, 'users', uidActual));
      const sw = miSnap.data()?.swipes || { like: [], dislike: [] };
      const swippeados = [...(sw.like || []), ...(sw.dislike || [])];

      snapshot.forEach(docu => {
        const id = docu.id;
        const data = docu.data();
        if (
          id !== uidActual &&
          !swippeados.includes(id) &&
          (filtroRol === '' || data.rolFavorito === filtroRol) &&
          (filtroGenero === '' || data.genero === filtroGenero) &&
          (filtroBusca === '' || data.enBusca === filtroBusca)
        ) {
          lista.push({ id, ...data });
        }
      });
      setUsuarios(lista);
      setIndex(0);
      setCargando(false);
    });
    return () => unsubscribe();
  }, [uidActual, filtroRol, filtroGenero, filtroBusca]);

  const handleSwipe = async tipo => {
    if (index >= usuarios.length) return;

    const usuarioSwipeado = usuarios[index];
    const miRef = doc(db, 'users', uidActual);
    const snap = await getDoc(miRef);
    const data = snap.data() || {};

    const swipesExistentes =
      typeof data.swipes === 'object' && !Array.isArray(data.swipes)
        ? data.swipes
        : {};

    const sw = {
      like: swipesExistentes.like || [],
      dislike: swipesExistentes.dislike || [],
    };

    if (!sw[tipo].includes(usuarioSwipeado.id)) {
      sw[tipo].push(usuarioSwipeado.id);
      await updateDoc(miRef, { swipes: sw });
    }

    if (tipo === 'like') {
      const otroSnap = await getDoc(doc(db, 'users', usuarioSwipeado.id));
      const otrosw = Array.isArray(otroSnap.data()?.swipes?.like)
        ? otroSnap.data().swipes.like
        : [];

      if (otrosw.includes(uidActual)) {
        Alert.alert('💘 ¡Es un match! 💘', '\nYa pueden chatear 👀');

        // 1. Crea el match y obtén el ID del documento
        const matchRef = await addDoc(collection(db, 'matches'), {
          usuarios: [uidActual, usuarioSwipeado.id],
          timestamp: serverTimestamp(),
          chatId: null, // temporalmente null
        });

        // 2. Usa el ID del match como chatId
        const chatId = matchRef.id;

        // 3. Actualiza el match con el chatId
        await setDoc(doc(db, 'matches', chatId), { chatId }, { merge: true });

        // 4. Crea el documento del chat (vacío, solo para inicializar)
        await setDoc(doc(db, 'chats', chatId), {});

        await updateDoc(miRef, {
          [`matches.${usuarioSwipeado.id}`]: true,
        });
        await updateDoc(doc(db, 'users', usuarioSwipeado.id), {
          [`matches.${uidActual}`]: true,
        });
      }
    }

    setIndex(prev => prev + 1);
  };

  return (
    <>
  
    <ImageBackground
      source={require('../assets/homeF.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />
      <Navbar />


      {/* Botón que me lleva a los matches */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          width: 60,
          height: 60,
          bottom: 40,
          right: 20,
          zIndex: 10,
          backgroundColor: 'rgba(99, 78, 21, 0.7)',
          borderRadius: 30,
          padding: 10,
        }}
        onPress={() => navigation.navigate('Matches')}
        disabled={modalVisible}
      >
        <Icon name="chat" size={28} color="gold" />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          width: 60,
          height: 60,
          bottom: 40,
          left: 20,
          zIndex: 10,
          backgroundColor: 'rgba(99, 78, 21, 0.7)',
          borderRadius: 30,
          padding: 10,
        }}
        onPress={() => setModalVisible(true)}
        disabled={modalVisible}
      >
        <Icon name="filter-list" size={28} color="gold" />
      </TouchableOpacity>
      


      {/* SOLO muestra el contenido principal si el modal NO está visible */}
      {!modalVisible && (
        cargando ? (
          <ActivityIndicator size="large" color="gold" style={{ flex: 1 }} />
        ) : index >= usuarios.length ? (
          <View style={styles.center}>
            <Text
              style={{
                color: 'gold',
                fontSize: 25,
                fontStyle: 'italic',
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 16,
                borderRadius: 12,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              No hay más usuarios disponibles... 🥲
            </Text>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.swipeArea}>
              <CardSwipe
                usuario={usuarios[index]}
                onSwipeLeft={() => handleSwipe('dislike')}
                onSwipeRight={() => handleSwipe('like')}
                version={version}
              />
            </View>
          </View>
        )
      )}
    </ImageBackground>
    {modalVisible && (
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'black',
        zIndex: 100,
        elevation: 100,
      }} />
    )}
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      onBackButtonPress={() => setModalVisible(false)}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={{
        backgroundColor: '#222',
        padding: 24,
        borderRadius: 25,
        width: '100%',
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: 'gold', fontSize: 20, marginBottom: 12 }}>Filtrar usuarios</Text>

        <Text style={{ color: 'white' }}>Género:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {[
            { label: 'Todos', value: '' },
            { label: '♂️', value: 'masculino' },
            { label: '♀️', value: 'femenino' },
            { label: '⚧️', value: 'no_binario' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={{
                backgroundColor: filtroGenero === opt.value ? 'gold' : '#444',
                padding: 8,
                borderRadius: 6,
                margin: 4,
              }}
              onPress={() => setFiltroGenero(opt.value)}
            >
              <Text style={{ color: filtroGenero === opt.value ? '#222' : 'white' }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: 'white' }}>Rol favorito:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {[
            { label: 'Todos', value: '' },
            { label: (
              <Image
                source={require('../assets/top.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'top' },
            { label: (
              <Image
                source={require('../assets/jungla.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'jungla' },
            { label: (
              <Image
                source={require('../assets/mid.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'mid' },
            { label: (
              <Image
                source={require('../assets/adc.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'adc' },
            { label: (
              <Image
                source={require('../assets/soporte.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'soporte' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={{
                backgroundColor: filtroRol === opt.value ? 'gold' : '#444',
                padding: 8,
                borderRadius: 6,
                margin: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setFiltroRol(opt.value)}
            >
              <Text style={{ color: filtroRol === opt.value ? '#222' : 'white' }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: 'white' }}>En busca de:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {[
            { label: 'Todos', value: '' },
            { label: (
              <Image
                source={require('../assets/busca-amigos-para-jugar.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'amigosjuego' },
            { label: (
              <Image
                source={require('../assets/busca-amigos-para-vida.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />
            ), value: 'amigosvida' },
            { label: (
              <Image
                source={require('../assets/busca-amor.png')}
                style={{ width: 20, height: 20, marginRight: 4 }}
                resizeMode="contain"
              />  
            ), value: 'amor' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={{
                backgroundColor: filtroBusca === opt.value ? 'gold' : '#444',
                padding: 8,
                borderRadius: 6,
                margin: 4,
              }}
              onPress={() => setFiltroBusca(opt.value)}
            >
              <Text style={{ color: filtroBusca === opt.value ? '#222' : 'white' }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </Modal>
  </>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end', // Empuja contenido hacia la parte baja del fondo
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Oscurece el fondo
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Centrado vertical
    alignItems: 'center',
    paddingBottom: -100, // Deja espacio visual inferior
  },
  swipeArea: {
    marginTop:  -150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
