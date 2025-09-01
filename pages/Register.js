// pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'usuario',
    especialidade: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validações
  if (formData.senha !== formData.confirmarSenha) {
    setError('As senhas não coincidem');
    setLoading(false);
    return;
  }

  if (formData.tipo === 'tecnico' && !formData.especialidade) {
    setError('Especialidade é obrigatória para técnicos');
    setLoading(false);
    return;
  }

  try {
    const endpoint = formData.tipo === 'usuario' 
      ? 'http://localhost:8080/usuarios' 
      : 'http://localhost:8080/tecnicos';

    // Remover campos desnecessários antes de enviar
    const { confirmarSenha, tipo, ...dataToSend } = formData;
    
    // Se for técnico, manter especialidade; se for usuário, remover
    if (formData.tipo === 'usuario') {
      delete dataToSend.especialidade;
    }

    console.log('Enviando dados:', dataToSend); // Para debug

    const response = await axios.post(endpoint, dataToSend, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 201) {
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    }
  } catch (error) {
    console.error('Erro completo no cadastro:', error);
    
    // Mensagem de erro mais amigável
    if (error.response?.status === 500) {
      setError('Erro no servidor. Verifique se o banco de dados está configurado corretamente.');
    } else if (error.response?.data?.message) {
      setError(error.response.data.message);
    } else {
      setError('Erro ao realizar cadastro. Tente novamente.');
    }
    
    // Fallback: salvar localmente se o backend falhar
    salvarCadastroOffline(formData);
  } finally {
    setLoading(false);
  }
};

// Função para salvar cadastro offline
const salvarCadastroOffline = (dados) => {
  try {
    const cadastros = JSON.parse(localStorage.getItem('cadastros_offline')) || [];
    cadastros.push({
      ...dados,
      id: 'offline-' + Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('cadastros_offline', JSON.stringify(cadastros));
    
    setError('Cadastro salvo localmente. Será sincronizado quando o servidor estiver disponível.');
    alert('Cadastro salvo localmente! Você pode fazer login quando o servidor estiver online.');
    navigate('/login');
  } catch (err) {
    setError('Erro ao salvar localmente. Tente novamente.');
  }
};

  return (
    <div className="form-container">
      <h1 className="page-title">Cadastro</h1>
      
      <form onSubmit={handleSubmit} className="register-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Nome completo:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>CPF:</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            placeholder="000.000.000-00"
          />
        </div>
        
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label>Confirmar senha:</label>
          <input
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tipo de conta:</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="usuario">Usuário</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>
        
        {formData.tipo === 'tecnico' && (
          <div className="form-group">
            <label>Especialidade:</label>
            <select name="especialidade" value={formData.especialidade} onChange={handleChange} required>
              <option value="">Selecione uma especialidade</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Redes">Redes</option>
              <option value="Outra">Outra</option>
            </select>
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        
        <p className="login-link">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;