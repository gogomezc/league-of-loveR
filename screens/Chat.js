import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { db, auth } from '../credenciales'; 
import { doc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Chat({ route }) {
  const { chatId, otherUser } = route.params; // chatId y datos del otro usuario
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: input,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });
    setInput('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === auth.currentUser.uid;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && (
          <Image source={{ uri: otherUser.photoURL }} style={styles.avatar} />
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </View>
    );
  };

    return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <Image source={{ uri: otherUser.photoURL }} style={styles.headerAvatar} />
        <View>
            <Text style={styles.headerName}>{otherUser.name}</Text>
            {/* Puedes agregar aquí estado en línea, iconos, etc */}
        </View>
        </View>
        {/* Mensajes */}
        <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        {/* Input */}
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={styles.inputContainer}
        >
        <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#ccc"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Icon name="send" size={24} color="#bfa14a" />
        </TouchableOpacity>
        </KeyboardAvoidingView>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'linear-gradient(90deg, #1a1a1a, #bfa14a)' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#1a1a1a' },
  headerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  headerName: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 },
  myMessage: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
  otherMessage: { alignSelf: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 2 },
  myBubble: { backgroundColor: '#ffe082', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#fff3cd', alignSelf: 'flex-start' },
  text: { color: '#222', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1a1a1a',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 24,
  },
});