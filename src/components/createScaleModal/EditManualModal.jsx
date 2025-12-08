import React, { useState, useEffect } from 'react';
// Importamos a busca de todos os funcionários e dados do dia
import { findEligibleEmployees } from '../../ipc-bridge/employee';
import { getDayModalData, updateManualShifts } from '../../ipc-bridge/scale'; 
import './CreateScaleModal.css'; 

function EditManualModal({ isOpen, onClose, onComplete, date, scaleIds }) {
    const [employees, setEmployees] = useState([]); 
    
    // Estado unificado para guardar as seleções de AMBAS as escalas
    const [allocations, setAllocations] = useState({ ETA: [], PLANTAO_TARDE: [] });
    
    const [scaleType, setScaleType] = useState('PLANTAO_TARDE');
    const [loading, setLoading] = useState(true);
    const [pendingViolations, setPendingViolations] = useState(null);
    
    const year = date ? date.split('-')[0] : '';
    const monthIndex = date ? parseInt(date.split('-')[1], 10) : 1;
    const day = date ? parseInt(date.split('-')[2], 10) : 1;
    
    const getMonthName = () => {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho','Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return monthNames[monthIndex - 1];
    };
    
    // Carrega TUDO (Funcionários e Alocações das duas escalas) ao abrir o modal
    useEffect(() => {
        if (!isOpen || !date) return;

        const loadAllData = async () => {
            setLoading(true);
            try {
                // 1. Busca TODOS os funcionários elegíveis (sem filtro inicial)
                const allEmployees = await findEligibleEmployees({}); 
                setEmployees(allEmployees || []);

                // 2. Busca alocações atuais para ETA e PLANTAO_TARDE em paralelo
                const newAllocations = { ETA: [], PLANTAO_TARDE: [] };
                const promises = [];

                // Se a escala ETA existe, busca quem está nela hoje
                if (scaleIds?.ETA) {
                    promises.push(
                        getDayModalData({ date, scaleId: scaleIds.ETA, scaleType: 'ETA' })
                            .then(res => {
                                if (res.allocatedEmployeeIds) newAllocations.ETA = res.allocatedEmployeeIds;
                            })
                    );
                }

                // Se a escala TARDE existe, busca quem está nela hoje
                if (scaleIds?.PLANTAO_TARDE) {
                    promises.push(
                        getDayModalData({ date, scaleId: scaleIds.PLANTAO_TARDE, scaleType: 'PLANTAO_TARDE' })
                            .then(res => {
                                if (res.allocatedEmployeeIds) newAllocations.PLANTAO_TARDE = res.allocatedEmployeeIds;
                            })
                    );
                }

                await Promise.all(promises);
                
                // Atualiza o estado com as alocações encontradas
                setAllocations(newAllocations);

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                alert(`Erro ao carregar dados: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [isOpen, date, scaleIds]); 

    // Função de Toggle inteligente: altera apenas a lista da aba atual (scaleType)
    const toggleEmployee = (employeeId) => {
        setAllocations(prev => {
            const currentList = prev[scaleType]; // Pega a lista atual (ETA ou TARDE)
            
            const newList = currentList.includes(employeeId)
                ? currentList.filter(id => id !== employeeId) // Remove se já existe
                : [...currentList, employeeId]; // Adiciona se não existe
            
            // Retorna o objeto completo com a chave atualizada
            return { ...prev, [scaleType]: newList };
        });
    };

    const handleConcluir = async (force = false) => {
        setLoading(true);
        try {
            const promises = [];
            const scaleRequests = [];

            // Salva alterações da ETA (se escala existir)
            if (scaleIds?.ETA) {
                const request = {
                    scaleId: scaleIds.ETA,
                    date,
                    finalEmployeeIds: allocations.ETA,
                    force
                };
                scaleRequests.push({ type: 'ETA', request });
                promises.push(updateManualShifts(request));
            }

            // Salva alterações do PLANTAO_TARDE (se escala existir)
            if (scaleIds?.PLANTAO_TARDE) {
                const request = {
                    scaleId: scaleIds.PLANTAO_TARDE,
                    date,
                    finalEmployeeIds: allocations.PLANTAO_TARDE,
                    force
                };
                scaleRequests.push({ type: 'PLANTAO_TARDE', request });
                promises.push(updateManualShifts(request));
            }

            const results = await Promise.all(promises);
            
            // Verifica se algum resultado requer confirmação (violations)
            const needsConfirmation = results.find(r => r.requireConfirmation);
            
            if (needsConfirmation && !force) {
                // Coleta todas as violações de todos os resultados
                const allViolations = results
                    .filter(r => r.violations)
                    .flatMap(r => r.violations);
                
                setPendingViolations(allViolations);
                setLoading(false);
                return; // Não fecha o modal, espera confirmação do usuário
            }

            // Verifica se houve erro em alguma das requisições
            const error = results.find(r => r.error);
            if (error) throw new Error(error.error);

            onComplete(); // Recarrega o calendário
            onClose();

        } catch (error) {
            alert(`Falha ao salvar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmViolations = () => {
        setPendingViolations(null);
        handleConcluir(true); // Chama novamente com force=true
    };

    const handleCancelViolations = () => {
        setPendingViolations(null);
    };

    // Filtra funcionários para exibir na lista (baseado na aba selecionada)
    // Se quiser mostrar TODOS independente da aba, remova o .filter
    const eligibleEmployeesForCurrentTab = employees.filter(emp => {
        if (!emp.availabilities) return false;
        return emp.availabilities.includes(scaleType);
    });

    // Pega os IDs selecionados para a aba atual para controlar os checkboxes
    const currentSelectedIds = allocations[scaleType] || [];
    // ID da escala atual para validação do botão
    const currentScaleId = scaleIds ? scaleIds[scaleType] : null;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-icon" onClick={onClose}>✕</button>

                <h2 className="modal-title">
                    Editar Dia - <span>{day} de {getMonthName()} de {year}</span>
                </h2>
                
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${scaleType === 'PLANTAO_TARDE' ? 'active' : 'inactive'}`}
                        onClick={() => setScaleType('PLANTAO_TARDE')}
                    >
                        Plantão da Tarde
                    </button>
                    <button
                        className={`tab-btn ${scaleType === 'ETA' ? 'active' : 'inactive'}`}
                        onClick={() => setScaleType('ETA')}
                    >
                        Plantão da ETA
                    </button>
                </div>

                {loading ? (
                    <div className="employee-list" style={{textAlign: 'center', padding: '20px'}}>
                        Carregando dados...
                    </div>
                ) : (
                    <>
                        <div className="list-header">
                            Funcionário
                            <span className="selection-count">
                                {currentSelectedIds.length} alocado(s)
                            </span>
                        </div>

                        <div className="employee-list">
                            {/* Mostra a lista mesmo que não tenha escala criada, para permitir visualização */}
                            {eligibleEmployeesForCurrentTab.length === 0 ? (
                                <div className="empty-state">Nenhum funcionário elegível encontrado.</div>
                            ) : (
                                eligibleEmployeesForCurrentTab.map(employee => (
                                    <div key={employee.id} className="employee-row">
                                        <span className="employee-name">{employee.name}</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                // Verifica se o ID está na lista da escala ATUAL
                                                checked={currentSelectedIds.includes(employee.id)}
                                                onChange={() => toggleEmployee(employee.id)}
                                                // Desabilita se não houver escala criada para salvar
                                                disabled={!currentScaleId}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                ))
                            )}
                            
                            {!currentScaleId && (
                                <div style={{textAlign: 'center', color: 'orange', fontSize: '12px', marginTop: '10px'}}>
                                    (Crie a escala de {scaleType} para poder editar)
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="modal-footer">
                    <button className="btn-nav btn-prev-step1" onClick={onClose} disabled={loading}>
                        CANCELAR
                    </button>
                    <button 
                        className="btn-nav btn-finish" 
                        onClick={() => handleConcluir(false)}
                        // Botão desabilitado apenas se estiver carregando. 
                        // Se uma escala existir e a outra não, permite salvar a que existe.
                        disabled={loading || (!scaleIds?.ETA && !scaleIds?.PLANTAO_TARDE)}
                    >
                        {loading ? 'SALVANDO...' : 'CONCLUIR'}
                    </button>
                </div>

                {/* Modal de Confirmação de Violações */}
                {pendingViolations && (
                    <div className="modal-overlay" onClick={handleCancelViolations}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
                            <button className="close-icon" onClick={handleCancelViolations}>✕</button>
                            
                            <h2 className="modal-title">⚠️ Restrições Detectadas</h2>
                            
                            <div style={{padding: '20px', maxHeight: '300px', overflowY: 'auto'}}>
                                <p style={{marginBottom: '15px', color: '#666'}}>
                                    As seguintes restrições foram encontradas:
                                </p>
                                <ul style={{listStyle: 'none', padding: 0}}>
                                    {pendingViolations.map((violation, index) => (
                                        <li key={index} style={{
                                            padding: '10px',
                                            marginBottom: '8px',
                                            background: '#fff3cd',
                                            borderLeft: '4px solid #ffc107',
                                            borderRadius: '4px'
                                        }}>
                                            {violation}
                                        </li>
                                    ))}
                                </ul>
                                <p style={{marginTop: '20px', fontWeight: 'bold', color: '#333'}}>
                                    Deseja continuar mesmo assim?
                                </p>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn-nav btn-prev-step1" 
                                    onClick={handleCancelViolations}
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    className="btn-nav btn-finish" 
                                    onClick={handleConfirmViolations}
                                    style={{background: '#ffc107'}}
                                >
                                    CONFIRMAR E SALVAR
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditManualModal;