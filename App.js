// App.js - VERSÃO CORRIGIDA
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';
import Login from './pages/Login';
import Register from './pages/Register';
import MyFeedbacks from './pages/MyFeedbacks'; // ADICIONE ESTE IMPORT
import SendFeedback from './pages/SendFeedback'; // ADICIONE ESTE IMPORT
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:roomId" element={<Chat />} />
              {/* ADICIONE ESTAS NOVAS ROTAS */}
              <Route path="/my-feedbacks" element={<MyFeedbacks />} />
              <Route path="/send-feedback" element={<SendFeedback />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;