import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080'; // URL do seu back-end

const Diagnosis = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsLoading(true);
    setSolution('');

    try {
      const response = await axios.post(`${API_URL}/tech-help/solucao-ia`, { message: problem });
      setSolution(response.data.message);
    } catch (error) {
      console.error("Erro ao buscar diagnóstico:", error);
      setSolution('Não foi possível obter uma solução. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Diagnóstico Inteligente</h1>
      <p className="page-subtitle">Descreva seu problema técnico em detalhes abaixo.</p>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Ex: Meu computador não liga e faz um barulho estranho..."
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Analisando...' : 'Obter Solução'}
          </button>
        </form>
      </div>

      {solution && (
        <div className="results-container">
          <h3>Sugestão da IA:</h3>
          <pre>{solution}</pre>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;