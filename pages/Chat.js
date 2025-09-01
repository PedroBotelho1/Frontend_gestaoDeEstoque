// Chat.js - VERSÃO CORRIGIDA SEM WARNINGS
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const messagesEndRef = useRef(null);

  // Carregar mensagens do localStorage ao iniciar
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadMessages = () => {
      try {
        const savedMessages = JSON.parse(localStorage.getItem(`chat_${roomId}`)) || [];
        console.log('Mensagens carregadas do localStorage:', savedMessages.length);
        setMessages(savedMessages);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    loadMessages();
  }, [user, navigate, roomId]);

  // Salvar mensagens no localStorage sempre que mudar
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
      console.log('Mensagens salvas no localStorage:', messages.length);
    }
  }, [messages, roomId]);

  // Configurar WebSocket
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/chat-socket'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Conectado ao WebSocket');
        setIsConnected(true);
        setStompClient(client);
        
        client.subscribe(`/topic/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log('Mensagem recebida via WebSocket:', receivedMessage);
          setMessages(prev => {
            const newMessages = [...prev, receivedMessage];
            localStorage.setItem(`chat_${roomId}`, JSON.stringify(newMessages));
            return newMessages;
          });
        });
      },
      onStompError: (error) => {
        console.error('Erro STOMP:', error);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log('Desconectado do WebSocket');
        setIsConnected(false);
      }
    });

    client.activate();
    
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [user, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && user) {
      const chatMessage = {
        message: newMessage,
        user: user.nome,
        userId: user.id,
        timestamp: new Date().toISOString()
      };

      console.log('Enviando mensagem:', chatMessage);

      // Adicionar à lista local imediatamente
      setMessages(prev => {
        const newMessages = [...prev, chatMessage];
        localStorage.setItem(`chat_${roomId}`, JSON.stringify(newMessages));
        return newMessages;
      });

      // Tentar enviar via WebSocket se conectado
      if (isConnected && stompClient) {
        try {
          stompClient.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify(chatMessage)
          });
          console.log('Mensagem enviada via WebSocket');
        } catch (error) {
          console.error('Erro ao enviar via WebSocket:', error);
        }
      }

      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return '';
    }
  };

  if (!user) {
    return (
      <div className="chat-container">
        <p>Por favor, faça login para acessar o chat.</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h1 className="page-title">Chat com Suporte Técnico</h1>
      <p className="page-subtitle">Sala: {roomId}</p>
      
      <div className="chat-status">
        Status: {isConnected ? 
          <span className="connected">✅ Conectado</span> : 
          <span className="disconnected">❌ Desconectado</span>
        }
        <span className="user-info"> | Logado como: {user.nome} ({user.role})</span>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.userId === user.id ? 'own-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="message-sender">{msg.user}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          rows={3}
        />
        <button onClick={sendMessage} disabled={!newMessage.trim()}>
          {isConnected ? 'Enviar' : 'Salvar (Offline)'}
        </button>
      </div>

      {/* Botão para debug - mostrar dados salvos */}
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        <button 
          onClick={() => {
            const saved = localStorage.getItem(`chat_${roomId}`);
            console.log('Dados salvos no localStorage:', JSON.parse(saved || '[]'));
            alert(`Dados salvos: ${saved ? JSON.parse(saved).length : 0} mensagens`);
          }}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
        >
          Debug: Ver Dados Salvos
        </button>
      </div>
    </div>
  );
};

export default Chat;