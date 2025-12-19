import { useState, useEffect, useRef } from 'react';
import { getAllEmployees, deleteEmployee, createEmployee, updateEmployee } from '../ipc-bridge/employee.js';
import SearchIcon from './SearchIcon';
import FuncionarioModal from './funcionarioModal/FuncionarioModal.jsx';
import './EmployeesTable.css';

// DADOS MOCKADOS (bloco antigo removido)
const ITEMS_PER_PAGE = 10;

function EmployeesTable() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para a funcionalidade da pesquisa
  const [searchTerm, setSearchTerm] = useState('');
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);

  // --- Estados do Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const firstRowIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastRowIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  }

  const fetchEmployees = async () => {
    try {
      if (loading) return;
      setLoading(true);
      setError(null);

      const response = await getAllEmployees({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchTerm: searchTerm
      });

      setAllEmployees(response.employees);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error("Erro ao simular dados dos funcionários:", err);
      setError(err.message || "Erro desconhecido");
      setAllEmployees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, refreshKey]);


  // Estes useEffects vieram da 'main' e são necessários para a busca funcionar
  useEffect(() => {
    if (searchText === searchTerm) return;
    const delaySearch = setTimeout(() => {
      setSearchTerm(searchText);
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchText, searchTerm]);

  useEffect(() => {
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

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

  // --- INÍCIO DAS MUDANÇAS: Funções do Modal ---
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const openViewModal = (employee) => {
    setModalMode('view');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (error) {
    return <p style={{ color: 'red' }}> Ocorreu um erro: {error}</p>;
  }

  const handleCreate = async (payload) => {
    try {
      await createEmployee(payload);
      fetchEmployees();
    } catch (error) {
      setError(error.message || "Erro desconhecido");
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await updateEmployee(payload);
      fetchEmployees();
    } catch (error) {
      setError(error.message || "Erro desconhecido");
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);

      setRefreshKey((prevKey) => prevKey + 1);
      if (allEmployees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      setError(error.message || "Erro desconhecido");
    }
  };

  return (
    <div className="employees-page">
      <div className="funcionarios-container">

        <header className="page-header">
          <h1>Funcionários</h1>
          <button
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            CADASTRAR FUNCIONÁRIO
          </button>
        </header>

        {/* --- RESOLUÇÃO DO CONFLITO 4 --- */}
        {/* Usamos a barra de busca da 'main', pois ela usa 'searchText' e 'handleSearchChange' */}
        <div className="search-container">
          {/* 1. A label estática "Pesquisar" (que estava faltando) */}
          <label htmlFor="searchInput" className="search-label">Pesquisar</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              ref={searchInputRef}
              id="searchInput"
              placeholder="Nome, cargo/função"
              className="search-input"
              value={searchText}
              onChange={handleSearchChange}
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
                <th><strong>Email</strong></th>
                {/* Coluna "Ações" removida para bater com o Figma */}
              </tr>
            </thead>
            <tbody>
              {allEmployees.length > 0 ? (
                allEmployees.map((emp) => (
                  <tr key={emp.id} className="clickable-row" onClick={() => openViewModal(emp)}>
                    <td data-label="Nome Completo">{emp.name}</td>
                    <td data-label="Cargo/Função">{emp.function}</td>
                    <td data-label="Email">{emp.email || '—'}</td>
                    {/* Coluna "Ações" removida */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-results">
                    {loading ? "Buscando..." : "Nenhum funcionário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>

        <footer className="funcionarios-footer">
          {/* Lógica de paginação virá aqui */}
          <span>Linhas por página: {ITEMS_PER_PAGE} </span>
          {totalCount > 0 && (
            <span>{firstRowIndex}-{lastRowIndex} de {totalCount}</span>
          )}

          {/* Adicionar ícones de navegação aqui */}
          <div className="pagination-controls">
            <button
              className='btn btn-primary'
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <button
              className='btn btn-primary'
              onClick={goToNextPage}
              disabled={currentPage >= totalPages || totalPages === 0 || loading}
            >
              Próximo
            </button>
          </div>
        </footer>
      </div>

      <FuncionarioModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialMode={modalMode}
        employee={selectedEmployee}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default EmployeesTable;