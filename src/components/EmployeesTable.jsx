import React, { useState, useEffect } from 'react'

function EmployeesTable() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await window.ipcRenderer.invoke('get-all-employees');
                setEmployees(response);
            } catch (err) {
                console.error("Erro ao buscar dados dos funcionários:", err);
                setError(err.message || "Erro desconhecido");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);
    
    if (loading) {
        return <p>Carregando lista de funcionários...</p>
    }

    if (error) {
        return <p style={{ color: 'red' }}> Ocorreu um erro: {error}</p>
    }

    if (employees.length === 0) {
        return <p>Nenhum funcionário cadastrado.</p>;
    }
    
    return (
        <div>
            <h2>Tabela de Funcionários</h2>
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
                    {employees.map((emp) => {
                        return (
                            <tr key={emp.id}>
                                <td>{emp.name}</td>
                                <td>{emp.function}</td>
                                <td>{emp.constraints || 'Sem restrições'}</td>
                                <td>{emp.disponibility || 'Indisponível'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

        </div>
    )
}

export default EmployeesTable;