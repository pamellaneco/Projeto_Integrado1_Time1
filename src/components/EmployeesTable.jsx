// src/components/EmployeesTable.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { getAllEmployees } from '../employeeService.js'; // Ajuste o caminho se necessário
import './EmployeesTable.css'; // Crie este arquivo para os estilos

// DADOS MOCKADOS
const mockFuncionarios = [
  { id: 1, name: 'Gideony', function: 'Operador da ETA', constraints: 'Final de Semana, Feriados', disponibility: 'Plantão da Tarde' },
  { id: 2, name: 'José Airton', function: 'Encanador', constraints: 'Plantão da ETA', disponibility: 'Plantão da Tarde, Feriados' },
  { id: 3, name: 'Gideony', function: 'Operador da ETA', constraints: 'Final de Semana, Feriados', disponibility: 'Plantão da Tarde' },
  { id: 4, name: 'José Airton', function: 'Encanador', constraints: 'Plantão da ETA', disponibility: 'Plantão da Tarde, Feriados' },
];

function EmployeesTable() {
  // --- ESTADOS ---
  const [allEmployees, setAllEmployees] = useState(mockFuncionarios);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Novos estados para a funcionalidade da UI
  const [searchTerm, setSearchTerm] = useState(''); 

  // --- BUSCA DE DADOS (useEffect do código original, levemente adaptado) ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllEmployees();
        console.log('Dados recebidos do back-end:', data);
        setAllEmployees(data);
      } catch (err) {
        console.error("Erro ao buscar dados dos funcionários:", err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    // fetchEmployees();
  }, []);

  // --- LÓGICA DE FILTRO (FRONT-END) ---
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(employee => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      // Verifica se o termo de busca aparece no nome OU na função do funcionário
      return (
        employee.name.toLowerCase().includes(lowerCaseSearch) ||
        employee.function.toLowerCase().includes(lowerCaseSearch)
      );
    });
  }, [allEmployees, searchTerm]);

  // --- FUNÇÃO PARA RENDERIZAR TAGS ---
  const renderTags = (tagsString, className = 'tag') => {
    if (!tagsString || tagsString.trim() === '') {
      return 'N/A'; // Ou null se preferir não mostrar nada
    }
    return tagsString.split(',').map(tag => tag.trim()).map(t => (
      <span key={t} className={className}>{t}</span>
    ));
  };

  // --- RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO E ERRO ---
  if (loading) {
    return <p>Carregando lista de funcionários...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}> Ocorreu um erro: {error}</p>;
  }

  // --- RENDERIZAÇÃO PRINCIPAL (JSX ESTRUTURADO COMO O FIGMA) ---
  return (
    <div className="funcionarios-container">
      // DENTRO DO SEU return() EM EmployeesTable.jsx

<header className="funcionarios-header">
  <h1>Funcionários</h1>
  
  <div className="filtros">
    <div className="filter-group">
      <label>Pesquisar</label>
      <input 
        type="text" 
        placeholder="Nome, cargo/função" 
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    {/* Os outros filtros virão aqui depois */}
  </div>
  
  <div className="acoes">
    <button className="btn btn-secondary">EDITAR</button>
    <button className="btn btn-primary">CADASTRAR FUNCIONÁRIO</button>
  </div>
</header>

      <main className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo/Função</th>
              <th>Restrições</th>
              <th>Disponibilidade</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.function}</td>
                  {/* ====================================================== */}
{/* ||            FAÇA ESTA MUDANÇA AGORA             || */}
{/* ====================================================== */}

<td>
  <div className="tag-group">
    {/* Adicionamos 'tag tag-restricao' aqui */}
    {renderTags(emp.constraints, 'tag tag-restricao')}
  </div>
</td>
<td>
  <div className="tag-group">
    {/* Esta já estava correta, mas confirme */}
    {renderTags(emp.disponibility, 'tag tag-disponibilidade')}
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">Nenhum funcionário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
      
      <footer className="funcionarios-footer">
        {/* Lógica de paginação virá aqui */}
        <span>Rows per page: 8</span>
        <span>1-8 of {filteredEmployees.length}</span>
        {/* Adicionar ícones de navegação aqui */}
      </footer>
    </div>
  );
}

export default EmployeesTable;