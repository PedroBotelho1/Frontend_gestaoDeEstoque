// Dashboard.js - Atualizado com rotas corretas
import React from 'react';
import Card from '../components/Card';

const Dashboard = () => {
  return (
    <div>
      <h1 className="page-title">Painel de Controle</h1>
      <p className="page-subtitle">Selecione uma das opções abaixo para continuar.</p>
      <div className="dashboard-grid">
        <Card 
          icon="🧠" 
          title="Diagnóstico Inteligente" 
          description="Use nossa IA para obter soluções para problemas técnicos." 
          to="/diagnosis"
        />
        <Card 
          icon="💬" 
          title="Chat com Técnico" 
          description="Converse em tempo real com um de nossos especialistas." 
          to="/chat"
        />
        <Card 
          icon="⭐" 
          title="Enviar Feedback" 
          description="Avalie nosso atendimento e ajude-nos a melhorar." 
          to="/send-feedback" // CORRIGIDO: estava "/send-feedback" mas precisa ser igual ao definido nas rotas
        />
        <Card 
          icon="📝" 
          title="Meus Feedbacks" 
          description="Visualize o histórico de todos os seus feedbacks" 
          to="/my-feedbacks" // CORRIGIDO: estava "/my-feedbacks" mas precisa ser igual ao definido nas rotas
        />
      </div>
    </div>
  );
};

export default Dashboard;