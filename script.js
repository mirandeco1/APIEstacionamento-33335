// URL REAL DA API
const BASE_API_URL = 'http://cnms-parking-api.net.uztec.com.br/api/v1';

// --- Funções Utilitárias ---

/**
 * Exibe uma mensagem em um elemento HTML específico.
 * @param {string} elementId O ID do elemento HTML onde a mensagem será exibida.
 * @param {string} message O texto da mensagem.
 * @param {'success' | 'error' | 'info'} type O tipo da mensagem para estilização.
 * @param {number} duration Duração em milissegundos para a mensagem desaparecer (padrão: 5000ms).
 */
function showMessage(elementId, message, type = 'info', duration = 5000) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, duration);
    } else {
        console.error(`Elemento com ID '${elementId}' não encontrado para exibir a mensagem.`);
    }
}

/**
 * Formata a placa do veículo (remove espaços, garante maiúsculas).
 * @param {string} plate A placa do veículo.
 * @returns {string} A placa formatada.
 */
function formatPlate(plate) {
    return plate ? plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
}

/**
 * Valida o formato da placa (ex: 3 letras e 4 números ou 3 letras, 1 número, 1 letra, 2 números).
 * @param {string} plate A placa a ser validada.
 * @returns {boolean} True se a placa for válida, false caso contrário.
 */
function validatePlate(plate) {
    const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // Ex: ABC4E67
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/; // Ex: ABC1234
    return mercosulPattern.test(plate) || oldPattern.test(plate);
}

// --- Funções que FAZEM CHAMADAS À API REAL (com fetch) ---

/**
 * Faz uma requisição genérica à API.
 * @param {string} endpoint O caminho do endpoint (ex: '/entry').
 * @param {string} method O método HTTP (GET, POST, PUT, PATCH, DELETE).
 * @param {object} [body=null] O corpo da requisição para métodos POST/PUT/PATCH.
 * @returns {Promise<any>} A resposta da API.
 */
async function callApi(endpoint, method, body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // Adicione 'Authorization' aqui se a API exigir um token
            // 'Authorization': 'Bearer SEU_TOKEN_DE_AUTENTICACAO'
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        console.log(`Chamando API: ${BASE_API_URL}${endpoint} com método ${method}`, body ? `e corpo: ${JSON.stringify(body)}` : '');
        const response = await fetch(`${BASE_API_URL}${endpoint}`, options);

        // Se a resposta não for OK (status 200-299), lança um erro
        if (!response.ok) {
            let errorDetails = `Erro na API: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || JSON.stringify(errorData);
            } catch (jsonError) {
                // Se a resposta não for JSON ou estiver vazia
                const textError = await response.text();
                errorDetails = textError || errorDetails;
            }
            throw new Error(errorDetails);
        }

        // Tenta retornar JSON, se não for JSON, retorna texto ou null (para 204 No Content, por exemplo)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else if (response.status === 204) { // No Content
            return null;
        } else {
            return await response.text(); // Pode ser um texto simples ou vazio
        }

    } catch (error) {
        console.error('Erro ao chamar a API:', error);
        throw error; // Propaga o erro para ser tratado pela função chamadora
    }
}

// POST /entry - Registrar Entrada de Veículo
async function registerEntry(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate || !validatePlate(formattedPlate)) {
        showMessage('entryExitMessage', 'Por favor, digite uma placa válida (Ex: ABC1234 ou ABC1D23).', 'error');
        return;
    }

    try {
        // A API espera um objeto com a placa, como indicado na sua imagem de Swagger
        const response = await callApi('/entry', 'POST', { plate: formattedPlate });
        showMessage('entryExitMessage', `Entrada de ${formattedPlate} registrada com sucesso!`, 'success');
        updateParkingUI();
    } catch (error) {
        showMessage('entryExitMessage', `Erro ao registrar entrada: ${error.message}`, 'error');
    }
}

// PATCH /exit/{plate} - Registrar Saída de Veículo
async function registerExit(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate || !validatePlate(formattedPlate)) {
        showMessage('entryExitMessage', 'Por favor, digite uma placa válida para a saída.', 'error');
        return;
    }

    try {
        // O {plate} vai no path da URL
        const response = await callApi(`/exit/${formattedPlate}`, 'PATCH');
        showMessage('entryExitMessage', `Saída de ${formattedPlate} registrada com sucesso!`, 'success');
        updateParkingUI();
    } catch (error) {
        showMessage('entryExitMessage', `Erro ao registrar saída: ${error.message}`, 'error');
    }
}

// GET /check/{plate} - Verificar se o Veículo está no Estacionamento
async function checkVehicle(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate || !validatePlate(formattedPlate)) {
        showMessage('checkVehicleMessage', 'Por favor, digite uma placa válida para verificar.', 'error');
        return;
    }

    try {
        const response = await callApi(`/check/${formattedPlate}`, 'GET');
        // A resposta da API para /check/{plate} precisa ser analisada.
        // Assumindo que retorna um objeto com 'status' ou 'found' ou similar.
        // Adaptar esta lógica com base na resposta real da API.
        if (response && (response.status === 'parked' || response.found === true)) { // Adapte conforme a API
            showMessage('checkVehicleMessage', `O veículo ${formattedPlate} está no estacionamento.`, 'success');
        } else {
            showMessage('checkVehicleMessage', `O veículo ${formattedPlate} NÃO está no estacionamento.`, 'info');
        }
    } catch (error) {
        showMessage('checkVehicleMessage', `Erro ao verificar veículo: ${error.message}`, 'error');
    }
}

// GET /time/{plate} - Tempo de Permanência de um Veículo
async function getTimeSpent(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate || !validatePlate(formattedPlate)) {
        showMessage('timeSpentMessage', 'Por favor, digite uma placa válida para verificar o tempo.', 'error');
        return;
    }

    try {
        const response = await callApi(`/time/${formattedPlate}`, 'GET');
        // A resposta da API para /time/{plate} precisa ser analisada (ex: { duration: "X horas Y minutos" })
        // ou { entryTime: "YYYY-MM-DDTHH:MM:SSZ", exitTime: "..." } para calcular a duração no front-end
        if (response && response.duration) { // Se a API já retorna a duração formatada
            showMessage('timeSpentMessage', `O veículo ${formattedPlate} está estacionado há: ${response.duration}.`, 'success', 8000);
        } else if (response && response.entryTime) { // Se a API retorna a hora de entrada
            const entryDate = new Date(response.entryTime);
            const now = new Date();
            const diffMs = now.getTime() - entryDate.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(diffSeconds / 3600);
            const minutes = Math.floor((diffSeconds % 3600) / 60);
            const seconds = diffSeconds % 60;
            showMessage('timeSpentMessage', `O veículo ${formattedPlate} está estacionado há: ${hours}h ${minutes}m ${seconds}s.`, 'success', 8000);
        }
        else {
            showMessage('timeSpentMessage', `Não foi possível obter o tempo de permanência para ${formattedPlate}.`, 'info');
        }
    } catch (error) {
        showMessage('timeSpentMessage', `Erro ao verificar tempo de permanência: ${error.message}`, 'error');
    }
}

// GET /active - Atualiza a Lista de Veículos Ativos na UI
async function updateActiveVehiclesList() {
    const listElement = document.querySelector('#activeVehiclesList ul');
    const statusMessageElement = document.getElementById('activeVehiclesStatusMessage');
    listElement.innerHTML = ''; // Limpa a lista existente

    try {
        const vehicles = await callApi('/active', 'GET');
        if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
            statusMessageElement.textContent = ''; // Limpa a mensagem se houver veículos
            statusMessageElement.className = 'message'; // Remove classes de estilo

            vehicles.forEach(vehicle => {
                const listItem = document.createElement('li');
                // Assumindo que a API retorna um objeto vehicle com 'plate' e 'entryTime'
                const entryTime = vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleString('pt-BR') : 'N/A';
                let additionalData = '';
                if (vehicle.additionalData) { // Se a API retornar dados adicionais para o veículo
                    additionalData = ` - Dados: ${vehicle.additionalData}`;
                }
                listItem.innerHTML = `<span>${vehicle.plate}</span> (Entrada: ${entryTime})${additionalData}`;
                listElement.appendChild(listItem);
            });
        } else {
            statusMessageElement.textContent = 'Nenhum veículo ativo no momento.';
            statusMessageElement.className = 'message info';
        }
    } catch (error) {
        statusMessageElement.textContent = `Erro ao listar veículos ativos: ${error.message}`;
        statusMessageElement.className = 'message error';
    }
}

// GET /slots - Verificar Vagas Disponíveis
async function checkSlots() {
    try {
        const response = await callApi('/slots', 'GET');
        // Assumindo que a API retorna um objeto com 'availableSlots' e 'totalSlots'
        if (response && typeof response.availableSlots !== 'undefined' && typeof response.totalSlots !== 'undefined') {
            showMessage('slotsMessage', `Vagas disponíveis: ${response.availableSlots} de ${response.totalSlots}.`, 'success');
        } else if (typeof response === 'number') { // Se a API retorna apenas o número de vagas disponíveis
            showMessage('slotsMessage', `Vagas disponíveis: ${response}.`, 'success');
        } else {
            showMessage('slotsMessage', 'Não foi possível obter as informações de vagas.', 'info');
        }
    } catch (error) {
        showMessage('slotsMessage', `Erro ao verificar vagas: ${error.message}`, 'error');
    }
}

// DELETE /cancel/{plate} - Cancelar Registro de Veículo
async function cancelRegistration(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate || !validatePlate(formattedPlate)) {
        showMessage('cancelUpdateMessage', 'Por favor, digite uma placa válida para cancelar.', 'error');
        return;
    }

    try {
        const response = await callApi(`/cancel/${formattedPlate}`, 'DELETE');
        showMessage('cancelUpdateMessage', `Registro do veículo ${formattedPlate} cancelado com sucesso.`, 'success');
        updateParkingUI();
    } catch (error) {
        showMessage('cancelUpdateMessage', `Erro ao cancelar registro: ${error.message}`, 'error');
    }
}

// PUT /update/{plate} - Atualizar Dados de um Veículo
async function updateRegistration(plate, newData) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate || !validatePlate(formattedPlate)) {
        showMessage('cancelUpdateMessage', 'Por favor, digite uma placa válida para atualizar.', 'error');
        return;
    }
    // Verifique se newData é realmente necessário para a sua API PUT.
    // A documentação da imagem não especifica o corpo para PUT /update/{plate}.
    // Vou enviar um objeto com 'data' como exemplo. Adapte conforme a API espera.
    const bodyToSend = newData ? { data: newData } : {};

    try {
        const response = await callApi(`/update/${formattedPlate}`, 'PUT', bodyToSend);
        showMessage('cancelUpdateMessage', `Dados do veículo ${formattedPlate} atualizados com sucesso.`, 'success');
        updateParkingUI();
    } catch (error) {
        showMessage('cancelUpdateMessage', `Erro ao atualizar dados: ${error.message}`, 'error');
    }
}

// GET /report - Gerar Relatório Diário
async function generateReport() {
    const reportMessageElement = document.getElementById('reportMessage');
    const reportDetailsElement = document.getElementById('reportDetails');
    reportDetailsElement.textContent = ''; // Limpa o relatório anterior

    try {
        const report = await callApi('/report', 'GET');
        if (report) {
            reportMessageElement.textContent = 'Relatório diário gerado:';
            reportMessageElement.className = 'message success';
            reportDetailsElement.textContent = JSON.stringify(report, null, 2); // Formata o JSON
        } else {
            reportMessageElement.textContent = 'Não foi possível gerar o relatório. Nenhum dado ou erro.';
            reportMessageElement.className = 'message info';
        }
    } catch (error) {
        reportMessageElement.textContent = `Erro ao gerar relatório: ${error.message}`;
        reportMessageElement.className = 'message error';
    }
}

/**
 * Função para atualizar todos os componentes da UI que dependem do estado do estacionamento.
 * Chamada após cada operação que altera o estado do estacionamento.
 */
function updateParkingUI() {
    updateActiveVehiclesList();
    checkSlots(); // Atualiza as vagas disponíveis
    // Limpa os campos de input de placa para facilitar a usabilidade
    document.getElementById('plateInput').value = '';
    document.getElementById('checkPlateInput').value = '';
    document.getElementById('timePlateInput').value = '';
    document.getElementById('cancelUpdatePlateInput').value = '';
    document.getElementById('updateNewDataInput').value = '';
}

// --- Event Listeners para os botões ---
document.addEventListener('DOMContentLoaded', () => {
    // Seção de Entrada/Saída
    document.getElementById('registerEntryBtn').addEventListener('click', () => {
        const plate = document.getElementById('plateInput').value;
        registerEntry(plate);
    });

    document.getElementById('registerExitBtn').addEventListener('click', () => {
        const plate = document.getElementById('plateInput').value;
        registerExit(plate);
    });

    // Seção de Consultar Veículo
    document.getElementById('checkVehicleBtn').addEventListener('click', () => {
        const plate = document.getElementById('checkPlateInput').value;
        checkVehicle(plate);
    });

    // Seção de Tempo de Permanência
    document.getElementById('getTimeSpentBtn').addEventListener('click', () => {
        const plate = document.getElementById('timePlateInput').value;
        getTimeSpent(plate);
    });

    // Seção de Veículos Ativos
    document.getElementById('listActiveVehiclesBtn').addEventListener('click', () => {
        updateActiveVehiclesList();
    });

    // Seção de Vagas Disponíveis
    document.getElementById('checkSlotsBtn').addEventListener('click', () => {
        checkSlots();
    });

    // Seção de Cancelar/Atualizar
    document.getElementById('cancelRegistrationBtn').addEventListener('click', () => {
        const plate = document.getElementById('cancelUpdatePlateInput').value;
        cancelRegistration(plate);
    });

    document.getElementById('updateRegistrationBtn').addEventListener('click', () => {
        const plate = document.getElementById('cancelUpdatePlateInput').value;
        const newData = document.getElementById('updateNewDataInput').value;
        updateRegistration(plate, newData);
    });

    // Seção de Relatório
    document.getElementById('generateReportBtn').addEventListener('click', () => {
        generateReport();
    });

    // Inicializa a UI ao carregar a página
    updateParkingUI();
});