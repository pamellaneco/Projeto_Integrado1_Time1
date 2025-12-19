import { useState, useEffect } from 'react';
import './FuncionarioModal.css';
import ConfirmationModal from '../modal/ConfirmationModal';
import { maskPhone } from '../../utils/masks';

const availabilityOptions = [
    { value: 'ETA', label: "ETA" },
    { value: 'PLANTAO_TARDE', label: "Plantão da Tarde" },
];

const restrictionOptions = [
    { value: 'WEEKENDS', label: "Final de Semana" },
    { value: 'HOLYDAYS', label: "Feriados" },
];

function FuncionarioModal({ isOpen, onClose, initialMode, employee, handleCreate, handleUpdate, handleDelete }) {
    const [currentMode, setCurrentMode] = useState(initialMode);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // --- Estados para os campos do formulário ---
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [restricoes, setRestricoes] = useState([]);
    const [disponibilidade, setDisponibilidade] = useState([]);

    // --- Estados para controlar os dropdowns ---
    const [isRestricoesOpen, setRestricoesOpen] = useState(false);
    const [isDisponibilidadeOpen, setDisponibilidadeOpen] = useState(false);

    // --- PASSO 2.2: O useEffect que você perguntou ---
    // Ele "reseta" o modo interno toda vez que o modal é aberto
    // O local dele é aqui, depois dos 'useState' e antes do outro 'useEffect'.
    useEffect(() => {
        if (isOpen) {
            setCurrentMode(initialMode);
        }
    }, [isOpen, initialMode]);


    // --- PASSO 2.3: Atualizado o useEffect para usar 'currentMode' ---
    useEffect(() => {
        // Agora ele usa 'currentMode' (o estado) em vez de 'mode' (o prop)
        if (isOpen && employee && (currentMode === 'edit' || currentMode === 'view')) { // <-- MUDANÇA AQUI
            // Se for 'edit' ou 'view', preenche os estados com os dados
            setNome(employee.name || '');
            setCargo(employee.function || '');
            setEmail(employee.email || '');

            const currentRestrictionsOptions = employee.restrictions?.split(',') ?? [];
            setRestricoes(
                restrictionOptions.filter(o => currentRestrictionsOptions.some(current => current === o.value))
            );

            const currentAvailabilityOptions = employee.availabilities?.split(',') ?? [];
            setDisponibilidade(
                availabilityOptions.filter(o => currentAvailabilityOptions.some(current => current === o.value))
            );
        } else {
            // Se for 'create' (ou se fechar), limpa tudo
            setNome('');
            setCargo('');
            setEmail('');
            setEmailError('');
            setCargo('Operador da ETA')
            setRestricoes([]);
            setDisponibilidade([]);
        }
    }, [isOpen, employee, currentMode]);

    const isDisabled = currentMode === 'view';

    // --- Funções de clique ---
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    // --- PASSO 2.4: Atualizado para usar 'currentMode' ---
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validar email antes de submeter
        if (emailError || !email) {
            return alert("Por favor, insira um email válido.");
        }
        
        const payload = {
            name: nome,
            function: cargo,
            email: email,
            availabilities: disponibilidade.map(item => item.value),
            restrictions: restricoes.map(item => item.value)
        };

        if (!payload.availabilities.length) {
            return alert("Funcionário precisa ter uma disponibilidade.");
        }

        if (currentMode === 'create') {
            handleCreate(payload);
        } else if (currentMode === 'edit') {
            handleUpdate({
                ...payload,
                id: employee.id
            });
        }
        onClose(); // Fecha o modal após o submit
    };

    const addRestricao = (tag) => {
        if (isDisabled) return;
        setRestricoes([...restricoes, tag]);
    };

    const addDisponibilidade = (tag) => {
        if (isDisabled) return;
        setDisponibilidade([...disponibilidade, tag]);
    };

    const removeRestricao = (tagToRemove) => {
        if (isDisabled) return;
        setRestricoes(restricoes.filter(tag => tag.value !== tagToRemove.value));
    };

    const removeDisponibilidade = (tagToRemove) => {
        if (isDisabled) return;
        setDisponibilidade(disponibilidade.filter(tag => tag.value !== tagToRemove.value));
    };

    const toggleRestricoesDropdown = () => {
        if (isDisabled) return;
        setRestricoesOpen(!isRestricoesOpen);
        setDisponibilidadeOpen(false);
    };

    const toggleDisponibilidadeDropdown = () => {
        if (isDisabled) return;
        setDisponibilidadeOpen(!isDisponibilidadeOpen);
        setRestricoesOpen(false);
    };

    const onDelete = () => {
        setShowConfirmationModal(true);
    }

    const handleConfirmDelete = () => {
        handleDelete(employee.id);
        onClose();
    }

    // --- Listas filtradas (só mostram opções disponíveis) ---
    const availableRestricoes = restrictionOptions.filter(
        tag => !restricoes.map(t => t.value).includes(tag.value)
    );
    const availableDisponibilidade = availabilityOptions.filter(
        tag => !disponibilidade.map(t => t.value).includes(tag.value)
    );

    let modalTitle = 'Cadastrar Funcionário';
    if (currentMode === 'edit') modalTitle = 'Editar Funcionário';
    if (currentMode === 'view') modalTitle = 'Visualizar Funcionário';

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={handleModalContentClick}>

                    <div className="modal-header">
                        <h2>{modalTitle}</h2>
                        <button className="modal-close-btn" onClick={onClose}>
                            &times;
                        </button>
                    </div>

                    <form className="modal-form" onSubmit={handleSubmit}>

                        <div className="form-group full-width">
                            <input
                                type="text"
                                id="nome"
                                placeholder="Insira o nome do funcionário"
                                required={!isDisabled}
                                disabled={isDisabled}
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                            <label htmlFor="nome">Nome Completo</label>
                        </div>

                        <div className="form-group">
                            <select
                                id="cargo"
                                required={!isDisabled}
                                disabled={isDisabled}
                                placeholder="Selecione um cargo"
                                value={cargo}
                                onChange={(e) => setCargo(e.target.value)}
                            >
                                <option value="Operador da ETA">Operador da ETA</option>
                                <option value="Encanador">Encanador</option>
                            </select>
                            <label htmlFor="cargo">Cargo/Função</label>
                            <span className="select-arrow"></span>
                        </div>

                        <div className="form-group">
                            <input
                                type="tel"
                                id="email"
                                placeholder="Insira um email"
                                required={!isDisabled}
                                disabled={isDisabled}
                                value={email}
                                className={emailError ? 'input-error' : ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEmail(value);
                                    
                                    // Validação de email
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (value && !emailRegex.test(value)) {
                                        setEmailError('Email inválido');
                                    } else {
                                        setEmailError('');
                                    }
                                }}
                            />
                            <label htmlFor="email">Email</label>
                            {emailError && <span className="error-message">{emailError}</span>}
                        </div>

                        {/* --- Campo de Restrições --- */}
                        <div className="form-group full-width">
                            <div
                                className={`tag-input-container ${isDisabled ? 'disabled' : ''}`}
                                onClick={toggleRestricoesDropdown}
                            >
                                {restricoes.map(tag => (
                                    <span key={tag.value} className={`tag-func tag-restricao ${isDisabled ? 'disabled' : ''}`}>
                                        <span>{tag.label}</span>
                                        {!isDisabled && (
                                            <button
                                                type="button"
                                                className="tag-close"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeRestricao(tag);
                                                }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {!restricoes.length && (
                                    <div style={{ opacity: "70%" }}>
                                        Selecione uma opção
                                    </div>
                                )}
                            </div>
                            <label htmlFor="restricoes">Restrições</label>
                            <span
                                className={`select-arrow ${isRestricoesOpen ? 'open' : ''}`}
                                onClick={toggleRestricoesDropdown}
                            ></span>

                            {isRestricoesOpen && !isDisabled && (
                                <div className="custom-dropdown-menu">
                                    {availableRestricoes.length > 0 ? (
                                        availableRestricoes.map(tag => (
                                            <div
                                                key={tag.value}
                                                className="dropdown-item tag-restricao"
                                                onClick={() => addRestricao(tag)}
                                            >
                                                {tag.label}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-empty-message">
                                            Nenhuma opção restante.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- Campo de Disponibilidade --- */}
                        <div className="form-group full-width">
                            <div
                                className={`tag-input-container ${isDisabled ? 'disabled' : ''}`}
                                onClick={toggleDisponibilidadeDropdown}
                            >
                                {disponibilidade.map(tag => (
                                    <div key={tag.value} className={`tag-func tag-disponibilidade ${isDisabled ? 'disabled' : ''}`}>
                                        <span>{tag.label}</span>
                                        {!isDisabled && (
                                            <button
                                                type="button"
                                                className="tag-close"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeDisponibilidade(tag);
                                                }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!disponibilidade.length && (
                                    <div style={{ opacity: "70%" }}>
                                        Selecione uma opção
                                    </div>
                                )}
                            </div>
                            <label htmlFor="disponibilidade">Disponibilidade</label>
                            <span
                                className={`select-arrow ${isDisponibilidadeOpen ? 'open' : ''}`}
                                onClick={toggleDisponibilidadeDropdown}
                            ></span>

                            {isDisponibilidadeOpen && !isDisabled && (
                                <div className="custom-dropdown-menu">
                                    {availableDisponibilidade.length > 0 ? (
                                        availableDisponibilidade.map(tag => (
                                            <div
                                                key={tag.value}
                                                className="dropdown-item tag-disponibilidade"
                                                onClick={() => addDisponibilidade(tag)}
                                            >
                                                {tag.label}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-empty-message">
                                            Nenhuma opção restante.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- PASSO 2.4 & 2.5: Botões do Rodapé Dinâmicos --- */}
                        <div className="modal-footer full-width">
                            {currentMode === 'create' && ( // <-- MUDANÇA AQUI
                                <button type="submit" className="modal-submit-btn">
                                    CADASTRAR
                                </button>
                            )}
                            {currentMode === 'edit' && ( // <-- MUDANÇA AQUI
                                <button type="submit" className="modal-submit-btn">
                                    SALVAR ALTERAÇÕES
                                </button>
                            )}
                            {currentMode === 'view' && ( // <-- MUDANÇA AQUI
                                <>
                                    <button
                                        type="button"
                                        className="modal-edit-btn"
                                        onClick={() => setCurrentMode('edit')} // <-- MUDANÇA AQUI
                                    >
                                        EDITAR
                                    </button>
                                    <button type="button" className="modal-delete-btn"
                                        onClick={onDelete}
                                    >
                                        EXCLUIR
                                    </button>
                                </>
                            )}
                        </div>

                    </form>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o funcionário "${employee?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="EXCLUIR"
                cancelText="CANCELAR"
            />
        </>
    );
}

export default FuncionarioModal;