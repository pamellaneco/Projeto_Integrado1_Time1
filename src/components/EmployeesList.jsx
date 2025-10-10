import { useState, useEffect } from 'react'
import { mockEmployees } from '../mockdata'

function EmployeesList() {
    const [employees, setEmployees] = useState([])

    useEffect(() => {
        setEmployees(mockEmployees)
    }, [])

    return (
        <div>
            <h2>Lista de Funcionários</h2>
            <ul>
                <table>
                    <tr>
                        <th>Nome</th>
                        <th>Cargo/Função</th>
                        <th>Restrições</th>
                        <th>Disponibilidade</th>
                    </tr>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.function}</td>
                            <td>{employee.constraints.join(", ")}</td>
                            <td>{employee.disponibility.join(", ")}</td>
                        </tr>
                    ))}
                </table>
            </ul>
        </div>
    )
}

export default EmployeesList