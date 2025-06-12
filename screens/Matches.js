import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { auth, db } from '../credenciales';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const rolImages = {
  top: require('../assets/top.png'),
  jungla: require('../assets/jungla.png'),
  mid: require('../assets/mid.png'),
  adc: require('../assets/adc.png'),
  soporte: require('../assets/soporte.png'),
};

const enBuscaImages = {
  amigosjuego: require('../assets/busca-amigos-para-jugar.png'),
  amigosvida: require('../assets/busca-amigos-para-vida.png'),
  amor: require('../assets/busca-amor.png'),
};

const generoIcons = {
  masculino: '♂️',
  femenino: '♀️',
  no_binario: '⚧️',
};

export default function Matches({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const data = await res.json();
        setVersion(data[0]);
      } catch (e) {
        setVersion('14.10.1');
      }
    };
    fetchVersion();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const uid = auth.currentUser.uid;
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const matchIds = userData.matches ? Object.keys(userData.matches) : [];

      const matchesSnapshot = await getDocs(collection(db, 'matches'));
      const matchesDocs = matchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usersData = [];
      for (let id of matchIds) {
        const matchUserRef = doc(db, 'users', id);
        const matchUserSnap = await getDoc(matchUserRef);
        if (matchUserSnap.exists()) {
          const matchDoc = matchesDocs.find(
            m =>
              Array.isArray(m.usuarios) &&
              m.usuarios.includes(uid) &&
              m.usuarios.includes(id)
          );
          usersData.push({
            id,
            ...matchUserSnap.data(),
            chatId: matchDoc ? matchDoc.id : null,
          });
        }
      }
      setMatches(usersData);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const renderItem = ({ item }) => {
    const champIconUrl =
      item.champFavorito && version
        ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${item.champFavorito}.png`
        : null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate('Chat', {
            chatId: item.chatId,
            otherUser: { name: item.name, photoURL: item.photoURL },
          })
        }
      >
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.nickname || item.email}</Text>
          <View style={styles.iconRow}>
            {/* Género */}
            {item.genero && (
              <View style={styles.iconCenter}>
                <Text style={styles.genderIcon}>{generoIcons[item.genero]}</Text>
              </View>
            )}
            {/* En busca de */}
            {item.enBusca && enBuscaImages[item.enBusca] && (
              <Image source={enBuscaImages[item.enBusca]} style={styles.buscaIcon} />
            )}
            {/* Rol favorito */}
            {item.rolFavorito && rolImages[item.rolFavorito] && (
              <Image source={rolImages[item.rolFavorito]} style={styles.rolIcon} />
            )}
            {/* Champ favorito */}
            {champIconUrl && (
              <Image source={{ uri: champIconUrl }} style={styles.champIcon} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/matches-ekkojinx.jpg')}
        style={styles.headerBg}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Text style={styles.header}>TUS CHATS</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <FontAwesome name="home" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={() => {}}
        contentContainerStyle={{ paddingTop: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  headerBg: { 
    width: '100%', 
    height: 150, 
    justifyContent: 'flex-end',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // <-- Esto alinea los elementos a los extremos
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  homeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 12,
  },
  header: { 
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700', // dorado
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#fafafa',
    minHeight: 64,
  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    marginRight: 16 
  },
  name: { 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  subtitle: { 
    color: '#888' 
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
    minHeight: 32,
  },
  iconCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
    marginRight: 4,
  },
  genderIcon: { 
    fontSize: 18, 
    textAlign: 'center' 
  },
  buscaIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#c89b3c',
    backgroundColor: '#222',
  },
  rolIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#c89b3c',
    backgroundColor: '#222',
  },
  champIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c89b3c',
    backgroundColor: '#222',
  },
});