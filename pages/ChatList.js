// ChatList.js - VERSÃO COM PERSISTÊNCIA
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

const ChatList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determinar o tipo de usuário
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Verificar o tipo de usuário
    const userRole = user.role || '';
    
    if (userRole.toUpperCase().includes('TECNICO') || user.especialidade) {
      setUserType('TECNICO');
    } else {
      setUserType('USER');
    }
  }, [user, navigate]);

  // Carregar dados com base no tipo de usuário
  useEffect(() => {
    if (!user || !userType) return;

    const loadData = async () => {
      try {
        if (userType === 'USER') {
          // Carregar técnicos para usuários
          try {
            const response = await axios.get(`${API_URL}/tecnicos/disponiveis`);
            setData(response.data);
          } catch (apiError) {
            console.log('Falha na API, usando dados mockados', apiError);
            // Dados mockados
            const mockTecnicos = [
              { 
                id: '1', 
                nome: 'Carlos Silva', 
                especialidade: 'Hardware', 
                email: 'carlos.tec@email.com'
              },
              { 
                id: '2', 
                nome: 'Ana Souza', 
                especialidade: 'Software', 
                email: 'ana.tec@email.com'
              },
              { 
                id: '3', 
                nome: 'Pedro Costa', 
                especialidade: 'Redes', 
                email: 'pedro.tec@email.com'
              }
            ];
            setData(mockTecnicos);
          }
        } else {
          // PARA TÉCNICOS: Carregar conversas de MÚLTIPLAS fontes
          let todasConversas = [];
          
          // 1. Buscar da API
          try {
            const response = await axios.get(`${API_URL}/chat/usuarios/${user.id}`);
            todasConversas = [...todasConversas, ...response.data];
          } catch (apiError) {
            console.log('Falha na API de conversas', apiError);
          }
          
          // 2. Buscar do localStorage (conversas offline)
          const conversasOffline = JSON.parse(localStorage.getItem(`conversas_${user.id}`)) || [];
          todasConversas = [...todasConversas, ...conversasOffline];
          
          // 3. Buscar conversas de TODOS os técnicos (fallback)
          if (todasConversas.length === 0) {
            const allKeys = Object.keys(localStorage);
            const conversationKeys = allKeys.filter(key => key.startsWith('conversas_'));
            
            conversationKeys.forEach(key => {
              const conversations = JSON.parse(localStorage.getItem(key)) || [];
              todasConversas = [...todasConversas, ...conversations];
            });
          }
          
          // Remover duplicatas
          const conversasUnicas = todasConversas.filter((conv, index, self) =>
            index === self.findIndex(c => c.roomId === conv.roomId)
          );
          
          setData(conversasUnicas);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, userType]);

  const iniciarConversa = async (tecnico) => {
    const roomId = `chat-${user.id}-${tecnico.id}`;
    
    // Registrar a conversa para o técnico (IMPORTANTE: isso resolve o problema do técnico não ver chamados)
    try {
      await axios.post(`${API_URL}/chat/registrar-conversa`, {
        tecnicoId: tecnico.id,
        usuarioId: user.id,
        usuarioNome: user.nome,
        roomId: roomId
      });
    } catch (error) {
      // Se falhar, salvar offline
      const conversasOffline = JSON.parse(localStorage.getItem(`conversas_${tecnico.id}`)) || [];
      const novaConversa = {
        usuarioId: user.id,
        usuarioNome: user.nome,
        roomId: roomId,
        lastMessage: "Nova conversa iniciada",
        timestamp: new Date().toISOString(),
        offline: true
      };
      conversasOffline.push(novaConversa);
      localStorage.setItem(`conversas_${tecnico.id}`, JSON.stringify(conversasOffline));
    }
    
    navigate(`/chat/${roomId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="chat-list-container">
        <h1 className="page-title">
          {userType === 'USER' ? 'Técnicos Disponíveis' : 'Meus Chamados'}
        </h1>
        <p className="page-subtitle">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <h1 className="page-title">
        {userType === 'USER' ? 'Técnicos Disponíveis' : 'Meus Chamados'}
      </h1>
      <p className="page-subtitle">
        {userType === 'USER' 
          ? 'Selecione um técnico para iniciar uma conversa' 
          : 'Usuários que solicitaram seu suporte'}
      </p>

      {userType === 'USER' ? (
        // VISÃO DO USUÁRIO - Técnicos
        <div className="tecnicos-grid">
          {data.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum técnico disponível no momento.</p>
              <p>Entre em contato com o administrador do sistema.</p>
            </div>
          ) : (
            data.map(tecnico => (
              <div key={tecnico.id} className="tecnico-card">
                <div className="tecnico-info">
                  <h3>{tecnico.nome}</h3>
                  <span className="especialidade-badge">{tecnico.especialidade}</span>
                  <p className="tecnico-email">{tecnico.email}</p>
                </div>
                <button 
                  className="iniciar-chat-btn"
                  onClick={() => iniciarConversa(tecnico)}
                >
                  💬 Iniciar Conversa
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        // VISÃO DO TÉCNICO - Chamados
        <div className="chamados-list">
          {data.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum chamado recebido ainda.</p>
              <p>Os usuários aparecerão aqui quando solicitarem seu suporte.</p>
            </div>
          ) : (
            data.map((chamado, index) => (
              <Link 
                to={`/chat/${chamado.roomId}`} 
                key={chamado.roomId || index} 
                className="chamado-item"
              >
                <div className="chamado-info">
                  <h3>{chamado.usuarioNome || 'Usuário'}</h3>
                  <p className="last-message">{chamado.lastMessage || 'Nova conversa'}</p>
                </div>
                <div className="chamado-meta">
                  <span className="time">{formatTime(chamado.timestamp)}</span>
                  {chamado.offline && <span className="offline-badge">Offline</span>}
                  {!chamado.offline && <span className="status-badge">Novo</span>}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;