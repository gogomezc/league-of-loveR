import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

export default function CardSwipe({ usuario, onSwipeLeft, onSwipeRight, version }) {


  const rolImages = {
    top: require('../assets/top.png'),
    jungla: require('../assets/jungla.png'),
    mid: require('../assets/mid.png'),
    adc: require('../assets/adc.png'),
    soporte: require('../assets/soporte.png'),
  };

  const rolLabels = {
    top: 'Superior (Toplaner)',
    jungla: 'Jungla (JG)',
    mid: 'Central (Midlaner)',
    adc: 'Tirador (ADC - Botlaner)',
    soporte: 'Soporte (Support)',
  };

  const enBuscaImages = {
    amigosjuego: require('../assets/busca-amigos-para-jugar.png'),
    amigosvida: require('../assets/busca-amigos-para-vida.png'),
    amor: require('../assets/busca-amor.png'),
  };

  const enBuscaLabels = {
    amigosjuego: 'Aliados para jugar',
    amigosvida: 'Amigos para la vida',
    amor: 'Una relación amorosa',
  };

  const generoIcons = {
    masculino: '♂️',
    femenino: '♀️',
    no_binario: '⚧️',
  };

  const translateX = useSharedValue(0);

  const rotate = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      rotate.value = e.translationX / 20;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width, {}, () => runOnJS(onSwipeRight)());
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width, {}, () => runOnJS(onSwipeLeft)());
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const champIconUrl = usuario.champFavorito && version
    ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${usuario.champFavorito}.png`
    : null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: usuario.photoURL }} style={styles.foto} />
        <View style={styles.info}>
          <Text style={styles.nombre}>
            {usuario.name}
            {usuario.nickname ? `(${usuario.nickname})` : ''}, {usuario.age}     {usuario.estado_linkeado ? '✅' : ''}
          </Text>
          <Text style={styles.campo}>Género: <Text style={styles.valor}>{generoIcons[usuario.genero]}</Text></Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={styles.campo}>Rol favorito: </Text>
            <Text style={styles.valor}>
              {rolLabels[usuario.rolFavorito] || usuario.rolFavorito}
            </Text>
            {usuario.rolFavorito && rolImages[usuario.rolFavorito] && (
              <Image
                source={rolImages[usuario.rolFavorito]}
                style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: 6,
                  marginLeft: 8,
                  borderWidth: 1,
                  borderColor: '#c89b3c',
                  backgroundColor: '#222', 
                }}
              />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={styles.campo}>Campeón favorito: </Text>
            <Text style={styles.valor}>{usuario.champFavorito}</Text>
            {champIconUrl && (
              <Image
                source={{ uri: champIconUrl }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  marginLeft: 8,
                  borderWidth: 1,
                  borderColor: '#c89b3c',
                  backgroundColor: '#222',
                }}
              />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={styles.campo}>En busca de: </Text>
            <Text style={styles.valor}>
              {enBuscaLabels[usuario.enBusca] || usuario.enBusca}
            </Text>
            {usuario.enBusca && enBuscaImages[usuario.enBusca] && (
              <Image
                source={enBuscaImages[usuario.enBusca]}
                style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: 6,
                  marginLeft: 8,
                  borderWidth: 1,
                  borderColor: '#c89b3c',
                  backgroundColor: '#222',
                }}
              />
            )}
          </View>
          
          {usuario.estado_linkeado && (
            <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 6 }}>
              {/* Info de cuenta LoL */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                {usuario.summonerIcon && (
                  <Image
                    source={{
                      uri: `http://ddragon.leagueoflegends.com/cdn/13.20.1/img/profileicon/${usuario.summonerIcon}.png`,
                    }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: '#FFD700',
                      backgroundColor: '#000',
                    }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {usuario.riotGameName}#{usuario.riotTagLine}
                  </Text>
                  <Text style={{ color: '#ccc', marginTop: 2, fontSize: 14 }}>
                    Nivel: {usuario.summonerLevel}
                  </Text>
                  <Text style={{ color: '#ccc', fontSize: 14 }}>
                    División: {usuario.tier} {usuario.rank} ({usuario.leaguePoints} LP)
                  </Text>
                </View>
              </View>

              {/* Mejor campeón */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {usuario.i_mejor_champ && (
                  <Image
                    source={{ uri: usuario.i_mejor_champ }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: '#FFD700',
                      backgroundColor: '#000',
                    }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>🏆 Mejor campeón:</Text>
                  <Text style={{ color: '#ccc', fontSize: 14, marginTop: 2 }}>
                    {usuario.n_mejor_champ} - {usuario.t_mejor_champ}
                  </Text>
                  <Text style={{ color: '#ccc', fontSize: 14, marginTop: 2 }}>
                    Maestría: {usuario.l_mejor_champ} | Puntos: {usuario.ptos_mejor_champ}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    // Elimina la altura fija para que el card crezca según el contenido
    height: height * 0.82,
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    position: 'absolute',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    borderBlockColor: '#c89b3c',
    borderWidth: 4,
    borderHeight: 4,
    borderColor: '#c89b3c',

  },
  foto: {
    width: '100%',
    // Ajusta la altura de la imagen para que no sea fija, por ejemplo:
    aspectRatio: 1, // cuadrada, o puedes usar otro valor según prefieras
    borderRadius: 14,
    borderWidth: 1,
    resizeMode: 'cover',
  },
  info: {
    marginTop: 15,
    alignItems: 'flex-start',
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c89b3c',
    marginBottom: 6,
  },
  edad: {
    fontSize: 16,
    color: '#ddd',
  },
  rolFavorito: {
    fontSize: 21,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'yellow',
  },
  champFavorito: {
    fontSize: 21,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'yellow',
  },
  campo: {
    fontSize: 16,
    color: '#c89b3c',
    fontWeight: 'bold',
    marginTop: 4,
  },
  valor: {
    color: '#fff',
    fontWeight: 'normal',
  },
});
