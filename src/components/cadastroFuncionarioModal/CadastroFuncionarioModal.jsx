// src/components/CadastroFuncionarioModal/CadastroFuncionarioModal.jsx
import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import './CadastroFuncionarioModal.css';

function CadastroFuncionarioModal({ isOpen, onClose }) {
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
    const [telefone, setTelefone] = useState('');
    const [restricoes, setRestricoes] = useState('');
    const [disponibilidade, setDisponibilidade] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const novoFuncionario = { nome, cargo, telefone, restricoes, disponibilidade };
        console.log('Enviando novo funcionário:', novoFuncionario);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Funcionário">
            <form onSubmit={handleSubmit} className="form-funcionario">
                <div className="form-group">
                    <label htmlFor="nome">Nome Completo *</label>
                    <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>

                {/* ===== MUDANÇA PRINCIPAL AQUI: Linha com duas colunas ===== */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="cargo">Cargo/Função *</label>
                        <select id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} required>
                            <option value="" disabled>Selecione um cargo</option>
                            <option value="Operador da ETA">Operador da ETA</option>
                            <option value="Encanador">Encanador</option>
                            <option value="Técnica de Tratamento">Técnica de Tratamento</option>
                            <option value="Supervisor">Supervisor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefone">Telefone/Celular *</label>
                        <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                    </div>
                </div>
                {/* ========================================================== */}

                <div className="form-group">
                    <label htmlFor="restricoes">Restrições *</label>
                    {/* Por enquanto, manteremos como textarea. A versão com "tags" é mais complexa. */}
                    <textarea id="restricoes" rows="3" value={restricoes} onChange={(e) => setRestricoes(e.target.value)} required></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="disponibilidade">Disponibilidade *</label>
                    <textarea id="disponibilidade" rows="3" value={disponibilidade} onChange={(e) => setDisponibilidade(e.target.value)} required></textarea>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    {/* O botão do protótipo é "EDITAR", mas como este é o modal de cadastro, "Cadastrar" está correto. */}
                    <button type="submit" className="btn-confirm">Cadastrar</button>
                </div>
            </form>
        </Modal>
    );
}

export default CadastroFuncionarioModal;