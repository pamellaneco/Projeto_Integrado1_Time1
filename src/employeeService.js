// Primeira coisa que mexi

/**
 * Busca todos os funcionários do processo principal do Electron.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de funcionários.
 */
export const getAllEmployees = async () => {
  try {
    // window.ipcRenderer é a ponte de comunicação do Electron
    // 'invoke' é usado para chamadas que esperam uma resposta
    const employees = await window.ipcRenderer.invoke('get-all-employees');
    return employees;
  } catch (error) {
    console.error('Erro ao buscar funcionários via IPC:', error);
    // Retorna um array vazio em caso de erro para não quebrar a UI
    return [];
  }
};

// Observação: O objeto window.ipcRenderer é injetado pelo Electron no seu ambiente de front-end. Se ele não estiver disponível, pode ser necessário configurar um arquivo de "preload" no seu projeto Electron, o que é uma prática comum e segura).