// pages/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('usuario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Buscar usuário na API
      const endpoint = userType === 'usuario' 
        ? 'http://localhost:8080/usuarios' 
        : 'http://localhost:8080/tecnicos';

      const response = await axios.get(endpoint);
      const users = response.data;
      
      // Encontrar usuário pelo email e senha
      const user = users.find(u => u.email === email && u.senha === password);
      
      if (user) {
        login({
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: userType.toUpperCase(),
          especialidade: user.especialidade
        });
        navigate('/');
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1 className="page-title">Login</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Tipo de conta:</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="usuario">Usuário</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <p className="register-link">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;