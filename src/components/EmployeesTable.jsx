// src/components/EmployeesTable.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { getAllEmployees } from '../employeeService.js'; // Ajuste o caminho se necessário
import './EmployeesTable.css'; // Crie este arquivo para os estilos
import SearchIcon from './SearchIcon';

// DADOS MOCKADOS
const mockFuncionarios = [
  { id: 1, name: 'Gideony', function: 'Operador da ETA', cellphone: '(11) 98765-4321' },
  { id: 2, name: 'José Airton', function: 'Encanador', cellphone: '(21) 91234-5678' },
  { id: 3, name: 'Mariana', function: 'Técnica de Tratamento', cellphone: '(31) 99876-5432' },
  { id: 4, name: 'Carlos', function: 'Supervisor', cellphone: '(41) 91111-2222' },
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
        // Mescla dados do backend com os mocks para garantir que `cellphone` exista.
        // Procura um mock correspondente por `id` ou `name` e usa o `cellphone` mock quando faltar.
        // Se o backend não retornar dados, usa os mocks completos.
        // eslint-disable-next-line no-console
        console.log('Dados recebidos do back-end:', data);
        let merged = mockFuncionarios;
        if (Array.isArray(data) && data.length > 0) {
          merged = data.map((d) => {
            const mock = mockFuncionarios.find(m => m.id === d.id || m.name === d.name);
            return {
              ...d,
              cellphone: d.cellphone || (mock && mock.cellphone) || '—',
            };
          });
        }
        setAllEmployees(merged);
      } catch (err) {
        console.error("Erro ao buscar dados dos funcionários:", err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
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
                  <td>{emp.name}</td>
                  <td>{emp.function}</td>
                  <td>{emp.cellphone || '—'}</td>
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
    </div>
  );
}

export default EmployeesTable;