// src/components/CadastroFuncionarioModal/CadastroFuncionarioModal.jsx
import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import './CadastroFuncionarioModal.css'; // CSS específico para o formulário

function CadastroFuncionarioModal({ isOpen, onClose }) {
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
    const [telefone, setTelefone] = useState('');
    const [restricoes, setRestricoes] = useState('');
    const [disponibilidade, setDisponibilidade] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aqui vai a lógica para enviar os dados para o back-end
        const novoFuncionario = { nome, cargo, telefone, restricoes, disponibilidade };
        console.log('Dados para cadastrar:', novoFuncionario);

        // Após o sucesso, você pode limpar os campos e fechar o modal
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Funcionário">
            <form onSubmit={handleSubmit} className="form-funcionario">
                <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                        type="text"
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cargo">Cargo/Função</label>
                    <input
                        type="text"
                        id="cargo"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="telefone">Telefone</label>
                    <input
                        type="tel"
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="restricoes">Restrições</label>
                    <textarea
                        id="restricoes"
                        rows="3"
                        value={restricoes}
                        onChange={(e) => setRestricoes(e.target.value)}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="disponibilidade">Disponibilidade</label>
                    <textarea
                        id="disponibilidade"
                        rows="3"
                        value={disponibilidade}
                        onChange={(e) => setDisponibilidade(e.target.value)}
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-confirm">
                        Cadastrar
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default CadastroFuncionarioModal;