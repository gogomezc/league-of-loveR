import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';
import { uploadImageToCloudinary } from '../credenciales';
import {RIOT_API_KEY} from '@env'; // Asegúrate de tener configurado dotenv para importar variables de entorno
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export default function Perfil({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;
  const [champions, setChampions] = useState([]);
  const [version, setVersion] = useState(null);
  const [riotGameName, setRiotGameName] = useState('');
  const [riotTagLine, setRiotTagLine] = useState('');
  const [riotRegion, setRiotRegion] = useState('americas');
  const [masteryChampion, setMasteryChampion] = useState(null);
  const [rankInfo, setRankInfo] = useState(null);
  const [championsLoading, setChampionsLoading] = useState(true);

  

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
  const [loadingGuardar, setLoadingGuardar] = useState(false);


  useEffect(() => {

    const fetchChampions = async () => {
      try {
        setChampionsLoading(true);
        const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const latestVersion = versionsRes.data[0];
        setVersion(latestVersion);
        const champsRes = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
        );
        const champsArray = Object.values(champsRes.data.data).map(item => (
          {
          key: item.id,
          name: item.name,
          title: item.title,
          image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${item.id}.png`
          }
      ));
        setChampions(champsArray);
      } catch (error) {
        console.error('Error cargando lista de campeones:', error);
      } finally {
        setChampionsLoading(false);
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
    setLoadingGuardar(true); // comienza la carga
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, perfil);
      Alert.alert('Cambios guardados 💾', 'Perfil actualizado correctamente. ✅');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setLoadingGuardar(false); // termina la carga
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

  const cambiarFotoPerfil = async () => {
    // Pedir permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto de perfil.');
      return;
    }

    // Abrir picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) {
      Alert.alert('Cancelado', 'No seleccionaste ninguna imagen.');
      return;
    }

    if (!result.assets || result.assets.length === 0) {
      Alert.alert('Error', 'No se pudo obtener la imagen seleccionada.');
      return;
    }

    setLoading(true);
    try {
      const uri = result.assets[0].uri;
      if (!uri) throw new Error('No se obtuvo la URI de la imagen');
      const url = await uploadImageToCloudinary(uri);
      if (!url) throw new Error('No se obtuvo URL de Cloudinary');
      setPerfil({ ...perfil, photoURL: url });
      await updateDoc(doc(db, 'users', uid), { photoURL: url });
      Alert.alert('Foto actualizada ✅', 'Foto de perfil actualizada con éxito.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo subir la foto');
    }
    setLoading(false);
  };
  
  const cerrarSesion = async () => {
    try {
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const obtenerDatosJugador = async () => {
    try {
      if (!riotGameName || !riotTagLine || !riotRegion) {
        Alert.alert("Faltan datos", "Debes ingresar nombre, tagline y región");
        return;
      }
      const riotToken = RIOT_API_KEY; // esta variable esté definida en el env y se importa
      if (!riotToken) {
        Alert.alert("Error", "No se encontró el token de Riot Games");
        return;
      }



      // aqui con el nombre de invocador y tagline obtenemos el PUUID que es el identificador único del jugador que deja traer todos los demas datos
      const accountRes = await axios.get(
        `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riotGameName}/${riotTagLine}?api_key=${riotToken}`
      );
      const puuid = accountRes.data.puuid;
      console.log("PUUID:", puuid);

      const platformRouting = {
        americas: 'la2',
        europe: 'euw1',
        asia: 'kr'
      };

      // gracias al PUUID podemos obtener el ID del invocador, nivel de la cuenta e icono de invocador
      const summonerRes = await axios.get(
        `https://${platformRouting[riotRegion]}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${riotToken}`
      );
      const summonerId = summonerRes.data.id;
      const summonerLevel = summonerRes.data.summonerLevel;
      const summonerIcon = summonerRes.data.profileIconId;
      console.log("Summoner ID:", summonerId);
      console.log("Nivel de invocador:", summonerLevel);
      console.log("ID Icono de invocador:", summonerIcon);

      // gracias al summonerID podemos obtener la división (liga)
      const rankedRes = await axios.get(
        `https://${platformRouting[riotRegion]}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotToken}`
      );
      try{
        const queue = rankedRes.data[0].queueType;
        const division = rankedRes.data[0].tier;
        const rank = rankedRes.data[0].rank;
        const leaguePoints = rankedRes.data[0].leaguePoints;
        console.log("Tipo de cola:", queue, "División:", division, "Rank:", rank, "LP:", leaguePoints);
      } catch (error) {
        console.error("Error al obtener información de rango:", error);
        const queue = "N/A";
        const division = "N/A";
        const rank = "N/A";
        const leaguePoints = "N/A";
      }
      setRankInfo({
        queueType: queue,
        tier: division,
        rank: rank,
        leaguePoints: leaguePoints
      });

      
      // Champion con más maestría
      const masteryRes = await axios.get(
        `https://${platformRouting[riotRegion]}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${riotToken}`
      );
      const championId = masteryRes.data[0].championId;
      const championLevel = masteryRes.data[0].championLevel;
      const championPoints = masteryRes.data[0].championPoints;
      console.log("Campeón más jugado:", championId, "Nivel:", championLevel, "Puntos:", championPoints);

      // AQUÍ VA LA LÓGICA PARA RECORRER LOS CAMPEONES QUE YA TENGO GUARDADOS EN const [champions, setChampions] = useState([]) que las trae de la api de ddragon; CON EL ID DE championId
      // Buscar en la lista de campeones el que coincide con el ID
    
      const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
      const latestVersion = versionsRes.data[0];
      setVersion(latestVersion);
      const champsRes = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/es_ES/champion.json`
      );

      let champData = null;
      for (const champKey in champsRes.data.data) {
        if (champsRes.data.data[champKey].key === championId.toString()) {
          console.log("Campeón encontrado:", champKey);
          /*
          const champ = champsRes.data.data[champKey];
          champData = {
            championId,
            championLevel,
            championPoints,
            name: champ.name,
            title: champ.title,
            image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.id}.png`
          };
          break;
          */
        }
      }
 

      /*
      const champData = champions.find(champ => champ.key == championId);
      if (!champData) {
        console.log(`No se encontró el campeón con ID: ${championId}`);
      } else {
        console.log("Campeón más jugado:", champData.name, "Leyenda:", champData.title, "Imagen:", champData.image);
      }
      
     
      if (champData) {
        setMasteryChampion({
          championId,
          championLevel,
          championPoints,
          name: champData.name,
          title: champData.title,
          image: champData.image
        });
      }

        */

    } catch (err) {
      console.error(err);
      console.log("Error al obtener datos de Riot:", err.response?.data || err.message);
      Alert.alert("No se pudo obtener información del jugador", "Verifica que el nombre de invocador, tagline y región sean correctos, si el error persiste, intenta más tarde.");
    }
  };


  if (loading || !perfil) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white', fontSize: 28, fontStyle: 'italic' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/fondoperfil2.jpg')}
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
            style={styles.homeButtonFixed}
            onPress={() => navigation.navigate('Home')}
          >
            <FontAwesome name="home" size={26} color="#fff" />
          </TouchableOpacity>         
          <Text style={styles.title}>DATOS PERSONALES</Text>

          <TouchableOpacity onPress={cambiarFotoPerfil}>
            {perfil.photoURL 
              ? <Image source={{ uri: perfil.photoURL }} style={styles.avatar}/>
              : <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={{color:'#fff'}}>Sin foto</Text>
                </View>
            }
          </TouchableOpacity>

          <Text style={styles.subtitle}>Nombre:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={perfil.name}
            onChangeText={(text) => setPerfil({ ...perfil, name: text })}
            placeholderTextColor="#ccc"
          />
          <Text style={styles.subtitle}>Edad</Text>
          <TextInput
            style={styles.input}
            placeholder="Edad"
            value={perfil.age ? perfil.age.toString() : ''}
            onChangeText={(text) => setPerfil({ ...perfil, age: parseInt(text) || 0 })}
            keyboardType="numeric"
            placeholderTextColor="#ccc"
          />
          <Text style={styles.subtitle}>Apodo</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Cómo te gusta que te digan?"
            value={perfil.nickname}
            onChangeText={(text) => setPerfil({ ...perfil, nickname: text })}
            placeholderTextColor="#ccc"
          />
          <Text style={styles.subtitle}>Género</Text>
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
              <Picker.Item label="No binario ⚧️" value="no_binario" />
            </Picker>
          </View>


          <Text style={styles.title2}>PREFERENCIAS</Text>

          <Text style={styles.subtitle}>Rol favorito</Text>
          <View style={[styles.input, { padding: 0, flexDirection: 'row', alignItems: 'center' }]}>
            <Picker
              selectedValue={perfil.rolFavorito}
              style={{ color: 'white', flex: 1 }}
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
            {perfil.rolFavorito && rolImages[perfil.rolFavorito] && (
              <Image
                source={rolImages[perfil.rolFavorito]}
                style={{ width: 40, height: 40 }}
              />
            )}
          </View>

          <Text style={styles.subtitle}>Campeón favorito</Text>    
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
                }}
              />
            )}
          </View>        

          <Text style={styles.subtitle}>En busca de</Text>
          <View style={[styles.input, { padding: 0, flexDirection: 'row', alignItems: 'center' }]}>
            <Picker
              selectedValue={perfil.enBusca}
              style={{ color: 'white', flex: 1 }}
              dropdownIconColor="white"
              onValueChange={(itemValue) => setPerfil({ ...perfil, enBusca: itemValue })}
            >
              <Picker.Item label="¿Qué buscas en la app?..." value="" color="#ccc"/>
              <Picker.Item label="Aliados para jugar" value="amigosjuego" />
              <Picker.Item label="Amigos para la vida" value="amigosvida" />
              <Picker.Item label="Una relación amorosa" value="amor" />
            </Picker>
            {perfil.enBusca && enBuscaImages[perfil.enBusca] && (
              <Image
                source={enBuscaImages[perfil.enBusca]}
                style={{ width: 40, height: 40}}
              />
            )}
          </View>  



          <Text style={styles.title2}>PERFIL DE LOL</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de invocador"
            value={riotGameName}
            onChangeText={setRiotGameName}
            placeholderTextColor="#ccc"
          />

          <TextInput
            style={styles.input}
            placeholder="Tagline (ej: LAS, 1234)"
            value={riotTagLine}
            onChangeText={setRiotTagLine}
            placeholderTextColor="#ccc"
          />

          <View style={[styles.input, { padding: 0 }]}>
            <Picker
              selectedValue={riotRegion}
              style={{ color: 'white', width: '100%' }}
              dropdownIconColor="white" 
              onValueChange={setRiotRegion}
            >
              <Picker.Item label="Región..." value="" color="#ccc" />
              <Picker.Item label="Américas" value="americas" />
              <Picker.Item label="Europa" value="europe" />
              <Picker.Item label="Asia" value="asia" />
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.buttonCuenta, championsLoading && { backgroundColor: '#999' }]}
            onPress={obtenerDatosJugador}
            disabled={championsLoading}
          >
            {championsLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Vincular cuenta LoL 🔗</Text>
            )}
          </TouchableOpacity>

          {rankInfo && (
            <Text style={{ color: 'white', marginTop: 5 }}>
              💻 INVOCADOR: {riotGameName} #{riotTagLine} {'\n'}
              🏅 División: {rankInfo.queueType}: {rankInfo.tier} {rankInfo.rank} ({rankInfo.leaguePoints} LP)
            </Text>
          )}

          {masteryChampion && (
            <Text style={{ color: 'white', marginTop: 10 }}>
              🏆 Campeón más jugado (maestría): ID {masteryChampion.championId} con {masteryChampion.championPoints} puntos
            </Text>
          )}




          <TouchableOpacity style={styles.button} onPress={guardarCambios}>
            <Text style={styles.buttonText}>Guardar Cambios 💾</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={eliminarPerfil}>
            <Text style={styles.buttonText}>Eliminar Perfil 🚯</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button2} onPress={cerrarSesion}>
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
      {loadingGuardar && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      )}

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  },
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
    color: '#FFD700', // dorado
    marginBottom: 30,
    marginTop: 80,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 15,
  },
  title2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700', // dorado
    marginBottom: 30,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 10,
    alignSelf: 'flex-start',
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
  inputInmovible: {
    width: '100%',
    height: 50,
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

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
    width: 200,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button2: {
    backgroundColor: 'rgb(175, 33, 95)', // dorado
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
    width: 200,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    marginTop: 30,
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 200,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonCuenta: {
    backgroundColor: 'rgba(255, 215, 0, 0.8)', // dorado con opacidad
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
    width: 300,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeButtonFixed: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 30,
    zIndex: 1000, // Asegura que el botón esté por encima de otros elementos
    elevation: 5, // Para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,

  },
});
