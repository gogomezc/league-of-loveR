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
} from 'firebase/firestore';
import CardSwipe from '../components/CardSwipe';
import Navbar from '../components/navbar';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // O el ícono que prefieras

export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [index, setIndex] = useState(0);
  const [cargando, setCargando] = useState(true);
  const uidActual = auth.currentUser?.uid;
  const [version, setVersion] = useState('');
  const navigation = useNavigation();
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
        if (id !== uidActual && !swippeados.includes(id)) {
          lista.push({ id, ...docu.data() });
        }
      });

      setUsuarios(lista);
      setIndex(0);
      setCargando(false);
    });

    return () => unsubscribe();


  }, [uidActual]);

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
        Alert.alert('💘 ¡Es un match!');

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
    <ImageBackground
      source={require('../assets/homeF.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />
      <Navbar />
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
      >
        <Icon name="chat" size={28} color="gold" />
      </TouchableOpacity>
      {/* ...resto del código... */}
      {cargando ? (
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
      )}
    </ImageBackground>
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
    paddingBottom: 60, // Deja espacio visual inferior
  },
  swipeArea: {
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
