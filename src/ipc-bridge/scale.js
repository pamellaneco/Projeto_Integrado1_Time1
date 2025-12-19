/**
 * Busca a escala completa (com turnos) do backend.
 * @param {Object} params - { month: 'YYYY-MM', type: 'ETA' | 'PLANTAO_TARDE' }
 */
export const getScale = async (params) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('get-scale', params);
};

/**
 * Cria uma nova escala com os funcionários e feriados selecionados.
 * @param {Object} params - { month, year, employeeIds: { ETA: [], PLANTAO_TARDE: [] }, holidays: [] }
 */
export const createScale = async (params) => {
  return await window.ipcRenderer.invoke('create-scale', params);
};

/**
 * Busca dados para o modal de edição de turno: elegíveis e alocados para o dia.
 */
export const getDayModalData = async (params) => {
  return await window.ipcRenderer.invoke('get-day-modal-data', params);
};

/**
 * Atualiza os turnos manualmente com base na lista final de IDs.
 */
export const updateManualShifts = async (params) => {
  return await window.ipcRenderer.invoke('update-manual-shifts', params);
};

/**
 * Move um turno de uma data para outra via drag-and-drop.
 * @param {Object} params - { scaleId, scaleType, employeeId, oldDate, newDate, force }
 */
export const moveShiftDragDrop = async (params) => {
  return await window.ipcRenderer.invoke('move-shift-drag-drop', params);
};

