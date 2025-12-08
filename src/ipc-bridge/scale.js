/**
 * Busca a escala completa (com turnos) do backend.
 * @param {Object} params - { month: 'YYYY-MM', type: 'ETA' | 'PLANTAO_TARDE' }
 */
export const getScale = async (params) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('get-scale', params);
};

/**
 * Gera uma nova escala no processo principal do Electron.
 * @param {Object} payload - Dados para geração da escala.
 * @param {number} payload.month - Mês (1-12).
 * @param {number} payload.year - Ano.
 * @param {string} payload.type - Tipo de escala ('ETA' | 'PLANTAO_TARDE').
 * @returns {Promise<Object>} Uma promessa que resolve para o resultado da geração.
 */
export const generateScale = async (payload) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('generate-scale', payload);
};