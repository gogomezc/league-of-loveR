import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { auth, db } from '../credenciales';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';



export default function Matches({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMatches = async () => {
    setLoading(true);
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const matchIds = userData.matches ? Object.keys(userData.matches) : [];

    // Obtén todos los matches de la colección 'matches'
    const matchesSnapshot = await getDocs(collection(db, 'matches'));
    const matchesDocs = matchesSnapshot.docs.map(doc => ({
      id: doc.id, // este es el matchId y chatId
      ...doc.data(),
    }));

    // Para cada usuario con el que hiciste match, busca el chatId correspondiente
    const usersData = [];
    for (let id of matchIds) {
      const matchUserRef = doc(db, 'users', id);
      const matchUserSnap = await getDoc(matchUserRef);
      if (matchUserSnap.exists()) {
        // Busca el match donde estén ambos usuarios
        const matchDoc = matchesDocs.find(
          m =>
            Array.isArray(m.usuarios) &&
            m.usuarios.includes(uid) &&
            m.usuarios.includes(id)
        );
        usersData.push({
          id,
          ...matchUserSnap.data(),
          chatId: matchDoc ? matchDoc.id : null, // Aquí agregas el chatId
        });
      }
    }
    setMatches(usersData);
    setLoading(false);
  };

  fetchMatches();
}, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Chat', {
        chatId: item.chatId,
        otherUser: { name: item.name, photoURL: item.photoURL }
      })}
    >
      <Image
        source={{ uri: item.photoURL }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.nickname || item.email}</Text>
      </View>
    </TouchableOpacity>
  );

return (
    <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10 }}>
            <TouchableOpacity
                style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 20,
                    padding: 8,
                    marginRight: 12,
                }}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={{ color: 'white', fontSize: 22 }}>🏠</Text>
            </TouchableOpacity>
            <Text style={styles.header}>Matches</Text>
        </View>
        <FlatList
            data={matches}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={() => {}}
        />
    </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { fontSize: 28, fontWeight: 'bold', margin: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#fafafa',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  name: { fontWeight: 'bold', fontSize: 18 },
  subtitle: { color: '#888' },
});