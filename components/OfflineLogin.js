// components/OfflineLogin.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const OfflineLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLoginOffline = () => {
    try {
      const cadastros = JSON.parse(localStorage.getItem('cadastros_offline')) || [];
      const usuario = cadastros.find(u => u.email === email && u.senha === password);
      
      if (usuario) {
        login({
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          role: usuario.tipo?.toUpperCase() || 'USER',
          especialidade: usuario.especialidade,
          offline: true
        });
      } else {
        setError('Usuário não encontrado ou senha incorreta');
      }
    } catch (error) {
      setError('Erro ao fazer login offline');
    }
  };

  return (
    <div className="form-container">
      <h2>Modo Offline</h2>
      <p>O servidor está indisponível. Fazendo login com dados locais.</p>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <button onClick={handleLoginOffline}>Entrar Offline</button>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default OfflineLogin;