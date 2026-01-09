// Observação: O objeto window.ipcRenderer é injetado pelo Electron no seu ambiente de front-end. Se ele não estiver disponível, pode ser necessário configurar um arquivo de "preload" no seu projeto Electron, o que é uma prática comum e segura).

// window.ipcRenderer é a ponte de comunicação do Electron
// 'invoke' é usado para chamadas que esperam uma resposta

/**
 * Busca todos os funcionários do processo principal do Electron.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de funcionários.
 */
export const getAllEmployees = async ({ page, limit, searchTerm = "" }) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('get-all-employees', { page, limit, searchTerm });
};

export const findEligibleEmployees = async (params) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('find-eligible-employees', params);
};

export const createEmployee = async (payload) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('create-employee', payload);
};

export const updateEmployee = async (payload) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('update-employee', payload);
};

export const deleteEmployee = async (id) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('delete-employee', id);
}

export const sendSobreavisoNotifications = (params) => {
  return window.ipcRenderer.invoke('send-sobreaviso-notifications', params);
};
