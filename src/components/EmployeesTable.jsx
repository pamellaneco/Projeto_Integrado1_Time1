// src/components/EmployeesTable.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllEmployees } from '../employeeService.js'; // Ajuste o caminho se necessário
import './EmployeesTable.css'; // Crie este arquivo para os estilos
import SearchIcon from './SearchIcon';
import { use } from 'react';

// DADOS MOCKADOS
const mockFuncionarios = [
  { id: 1, name: 'Gideony', function: 'Operador da ETA', cellphone: '(11) 98765-4321' },
  { id: 2, name: 'José Airton', function: 'Encanador', cellphone: '(21) 91234-5678' },
  { id: 3, name: 'Mariana', function: 'Técnica de Tratamento', cellphone: '(31) 99876-5432' },
  { id: 4, name: 'Carlos', function: 'Supervisor', cellphone: '(41) 91111-2222' },
];

const ITEMS_PER_PAGE = 10;

function EmployeesTable() {
  // --- ESTADOS ---
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Novos estados para a funcionalidade da UI
  const [searchTerm, setSearchTerm] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const firstRowIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastRowIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  // --- BUSCA DE DADOS (useEffect do código original, levemente adaptado) ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllEmployees({
          page: currentPage,
          limit: ITEMS_PER_PAGE
        });

        setAllEmployees(response.employees);
        setTotalCount(response.totalCount);
      } catch (err) {
        console.error("Erro ao buscar dados dos funcionários:", err);
        setError(err.message || "Erro desconhecido");
        setAllEmployees([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
  // DEBUG: verificar dados em runtime (remover quando ok)
  // Abra o DevTools para ver o conteúdo de `allEmployees`
  // console será visível ao rodar `npm run dev`.
  return (
    <div className="employees-page">
      <div className="funcionarios-container">

        <header className="page-header">
  <h1>Funcionários</h1>
  <button className="btn btn-primary">CADASTRAR FUNCIONÁRIO</button>
</header>

<div className="search-container">
  <div className="search-input-wrapper">
    <input 
      type="text" 
      placeholder="Nome, cargo/função" 
      className="search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <div className="search-icon">
      <SearchIcon />
    </div>
  </div>
</div>

      <main className="tabela-container">
        <table>
          <thead>
            <tr>
              <th><strong>Nome Completo</strong></th>
              <th><strong>Cargo/Função</strong></th>
              <th><strong>Celular</strong></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td data-label="Nome Completo">{emp.name}</td>
                  <td data-label="Cargo/Função">{emp.function}</td>
                  <td data-label="Celular">{emp.cellphone || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">
                    {loading ? "Buscando..." : "Nenhum funcionário encontrado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
      
      <footer className="funcionarios-footer">
        {/* Lógica de paginação virá aqui */}
        <span>Linhas por página: { ITEMS_PER_PAGE } </span>
        {totalCount > 0 && (
          <span>{firstRowIndex}-{lastRowIndex} de {totalCount}</span>
        )}
        
        {/* Adicionar ícones de navegação aqui */}
        <div className="pagination-controls">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            &lt; Anterior
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || totalPages === 0 || loading}
          >
            Próximo &gt;
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default EmployeesTable;