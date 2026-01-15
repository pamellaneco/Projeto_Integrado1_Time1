/**
 * Fornece uma interface unificada e simplificada para comunicação IPC
 * entre o processo de renderização e o processo principal.
 */

class ElectronAPI {
  static instance = null;

  constructor() {
    if (!window.ipcRenderer) {
      throw new Error('IpcRenderer not available. Make sure preload script is configured.');
    }

    this.employees = {
      /**
       * Busca todos os funcionários paginados
       * @param {Object} params - { page, limit, searchTerm? }
       */
      getAll: async ({ page, limit, searchTerm = "" }) => {
        return await window.ipcRenderer.invoke('get-all-employees', { page, limit, searchTerm });
      },

      /**
       * Busca funcionários elegíveis para escala
       * @param {Object} params - Parâmetros de busca
       */
      findEligible: async (params) => {
        return await window.ipcRenderer.invoke('find-eligible-employees', params);
      },

      /**
       * Cria um novo funcionário
       * @param {Object} payload - Dados do funcionário
       */
      create: async (payload) => {
        return await window.ipcRenderer.invoke('create-employee', payload);
      },

      /**
       * Atualiza um funcionário existente
       * @param {Object} payload - Dados atualizados
       */
      update: async (payload) => {
        return await window.ipcRenderer.invoke('update-employee', payload);
      },

      /**
       * Deleta um funcionário
       * @param {string|number} id - ID do funcionário
       */
      delete: async (id) => {
        return await window.ipcRenderer.invoke('delete-employee', id);
      },

      /**
       * Envia notificações de sobreaviso
       * @param {Object} params - Parâmetros de notificação
       */
      sendSobreavisoNotifications: async (params) => {
        return await window.ipcRenderer.invoke('send-sobreaviso-notifications', params);
      }
    };

    this.scales = {
      /**
       * Busca uma escala por mês e tipo
       * @param {Object} params - { month: 'YYYY-MM', type: 'ETA' | 'PLANTAO_TARDE' }
       */
      get: async (params) => {
        return await window.ipcRenderer.invoke('get-scale', params);
      },

      /**
       * Cria uma nova escala
       * @param {Object} params - { month, year, employeeIds: { ETA: [], PLANTAO_TARDE: [] }, holidays: [] }
       */
      create: async (params) => {
        return await window.ipcRenderer.invoke('create-scale', params);
      },

      /**
       * Busca dados para o modal de edição de turno
       * @param {Object} params - Parâmetros do modal
       */
      getDayModalData: async (params) => {
        return await window.ipcRenderer.invoke('get-day-modal-data', params);
      },

      /**
       * Atualiza turnos manualmente
       * @param {Object} params - Lista de turnos a atualizar
       */
      updateManualShifts: async (params) => {
        return await window.ipcRenderer.invoke('update-manual-shifts', params);
      },

      /**
       * Move um turno via drag-and-drop
       * @param {Object} params - { scaleId, scaleType, employeeId, oldDate, newDate, force? }
       */
      moveShift: async (params) => {
        return await window.ipcRenderer.invoke('move-shift-drag-drop', params);
      },

      /**
       * Publica a escala e envia por e-mail
       * @param {Object} params - { scaleDate, shifts, monthName, year }
       */
      publish: async (params) => {
        return await window.ipcRenderer.invoke('publish-scale', params);
      }
    };

    this.sobreavisos = {
      /**
       * Cria sobreavisos para um mês
       * @param {Object} params - { month, year, employeeIds: { ETA: [], PLANTAO_TARDE: [] } }
       */
      create: async (params) => {
        return await window.ipcRenderer.invoke('create-sobreaviso', params);
      },

      /**
       * Busca sobreavisos por data
       * @param {string} date - Data no formato YYYY-MM-DD
       */
      getByDate: async (date) => {
        return await window.ipcRenderer.invoke('get-sobreavisos-by-date', date);
      }
    };
  }

  static getInstance() {
    if (!ElectronAPI.instance) {
      const created = new ElectronAPI();
      ElectronAPI.instance = created;
      return created;
    } else {
      return ElectronAPI.instance;
    }
  }
}

export default ElectronAPI.getInstance();
