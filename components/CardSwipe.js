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
const SWIPE_THRESHOLD = width * 0.3;

export default function CardSwipe({ usuario, onSwipeLeft, onSwipeRight }) {
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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: usuario.photoURL }} style={styles.foto} />
        <View style={styles.info}>
          <Text style={styles.nombre}>{usuario.matches?.name || usuario.nickname}</Text>
          <Text style={styles.edad}>{usuario.age} años</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.85,
    height: width * 1.05,
    backgroundColor: '#0a0a0a', // fondo negro profundo
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
    position: 'absolute',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  foto: {
    width: '100%',
    height: '75%',
    borderRadius: 14,
    borderWidth: 1,
    resizeMode: 'cover',
  },
  info: {
    marginTop: 15,
    alignItems: 'center',
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c89b3c', // dorado
    marginBottom: 6,
  },
  edad: {
    fontSize: 16,
    color: '#ddd',
  },
});
