// Objeto para simular o banco de dados de veículos no estacionamento
// Em um sistema real, isso seria um banco de dados persistente no backend
const parkingDatabase = {
    vehicles: [], // Array de objetos { plate: 'ABC1234', entryTime: Date, additionalData: '...' }
    totalSlots: 50 // Capacidade total do estacionamento
};

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

// --- Funções que Simulam as Chamadas à API (Backend Fictício) ---

// POST /entry - Registrar Entrada de Veículo
function simulateEntry(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('entryExitMessage', 'Por favor, digite a placa do veículo.', 'error');
        return;
    }
    if (!validatePlate(formattedPlate)) {
        showMessage('entryExitMessage', 'Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
        return;
    }

    if (parkingDatabase.vehicles.length >= parkingDatabase.totalSlots) {
        showMessage('entryExitMessage', `Estacionamento lotado. (${parkingDatabase.totalSlots - parkingDatabase.vehicles.length} vagas disponíveis)`, 'error');
        return;
    }

    const exists = parkingDatabase.vehicles.find(v => v.plate === formattedPlate);
    if (exists) {
        showMessage('entryExitMessage', `Veículo com placa ${formattedPlate} já está no estacionamento.`, 'error');
        return;
    }

    parkingDatabase.vehicles.push({ plate: formattedPlate, entryTime: new Date() });
    showMessage('entryExitMessage', `Entrada de ${formattedPlate} registrada com sucesso!`, 'success');
    updateParkingUI(); // Atualiza a UI após a entrada
}

// PATCH /exit/{plate} - Registrar Saída de Veículo
function simulateExit(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('entryExitMessage', 'Por favor, digite a placa do veículo para a saída.', 'error');
        return;
    }
    if (!validatePlate(formattedPlate)) {
        showMessage('entryExitMessage', 'Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
        return;
    }

    const initialLength = parkingDatabase.vehicles.length;
    parkingDatabase.vehicles = parkingDatabase.vehicles.filter(v => v.plate !== formattedPlate);

    if (parkingDatabase.vehicles.length < initialLength) {
        showMessage('entryExitMessage', `Saída de ${formattedPlate} registrada com sucesso!`, 'success');
        updateParkingUI(); // Atualiza a UI após a saída
    } else {
        showMessage('entryExitMessage', `Veículo com placa ${formattedPlate} não encontrado no estacionamento.`, 'error');
    }
}

// GET /check/{plate} - Verificar se o Veículo está no Estacionamento
function simulateCheckVehicle(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('checkVehicleMessage', 'Por favor, digite a placa do veículo para verificar.', 'error');
        return;
    }
    if (!validatePlate(formattedPlate)) {
        showMessage('checkVehicleMessage', 'Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
        return;
    }

    const found = parkingDatabase.vehicles.find(v => v.plate === formattedPlate);
    if (found) {
        showMessage('checkVehicleMessage', `O veículo ${formattedPlate} está no estacionamento.`, 'success');
    } else {
        showMessage('checkVehicleMessage', `O veículo ${formattedPlate} NÃO está no estacionamento.`, 'info');
    }
}

// GET /time/{plate} - Tempo de Permanência de um Veículo
function simulateTimeSpent(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('timeSpentMessage', 'Por favor, digite a placa do veículo para verificar o tempo.', 'error');
        return;
    }
    if (!validatePlate(formattedPlate)) {
        showMessage('timeSpentMessage', 'Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
        return;
    }

    const found = parkingDatabase.vehicles.find(v => v.plate === formattedPlate);
    if (found) {
        const entryTime = found.entryTime;
        const now = new Date();
        const diffMs = now.getTime() - entryTime.getTime(); // Diferença em milissegundos

        const diffSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        showMessage('timeSpentMessage', `O veículo ${formattedPlate} está estacionado há: ${hours}h ${minutes}m ${seconds}s.`, 'success', 8000); // Exibe por mais tempo
    } else {
        showMessage('timeSpentMessage', `Veículo com placa ${formattedPlate} não encontrado no estacionamento.`, 'error');
    }
}

// GET /active - Atualiza a Lista de Veículos Ativos na UI
function updateActiveVehiclesList() {
    const listElement = document.querySelector('#activeVehiclesList ul');
    const statusMessageElement = document.getElementById('activeVehiclesStatusMessage');
    listElement.innerHTML = ''; // Limpa a lista existente

    if (parkingDatabase.vehicles.length === 0) {
        statusMessageElement.textContent = 'Nenhum veículo ativo no momento.';
        statusMessageElement.className = 'message info';
        return;
    }

    statusMessageElement.textContent = ''; // Limpa a mensagem se houver veículos
    statusMessageElement.className = 'message'; // Remove classes de estilo

    parkingDatabase.vehicles.forEach(vehicle => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${vehicle.plate}</span> (Entrada: ${vehicle.entryTime.toLocaleString()})`;
        if (vehicle.additionalData) {
            listItem.innerHTML += ` - Dados Adicionais: ${vehicle.additionalData}`;
        }
        listElement.appendChild(listItem);
    });
}

// GET /slots - Verificar Vagas Disponíveis
function simulateCheckSlots() {
    const available = parkingDatabase.totalSlots - parkingDatabase.vehicles.length;
    showMessage('slotsMessage', `Vagas disponíveis: ${available} de ${parkingDatabase.totalSlots}.`, 'success');
}

// DELETE /cancel/{plate} - Cancelar Registro de Veículo
function simulateCancelRegistration(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('cancelUpdateMessage', 'Por favor, digite a placa do veículo para cancelar.', 'error');
        return;
    }
    if (!validatePlate(formattedPlate)) {
        showMessage('cancelUpdateMessage', 'Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
        return;
    }

    const initialLength = parkingDatabase.vehicles.length;
    parkingDatabase.vehicles = parkingDatabase.vehicles.filter(v => v.plate !== formattedPlate);

    if (parkingDatabase.vehicles.length < initialLength) {
        showMessage('cancelUpdateMessage', `Registro do veículo ${formattedPlate} cancelado com sucesso.`, 'success');
        updateParkingUI();
    } else {
        showMessage('cancelUpdateMessage', `Veículo ${formattedPlate} não encontrado para cancelar o registro.`, 'error');
    }
}

// PUT /update/{plate} - Atualizar Dados de um Veículo
function simulateUpdateRegistration(plate, newData) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('cancelUpdateMessage', 'Por favor, digite a placa do veículo para atualizar.', 'error');
        return;
    }
    if (!validatePlate(formattedPlate)) {
        showMessage('cancelUpdateMessage', 'Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
        return;
    }

    const vehicleIndex = parkingDatabase.vehicles.findIndex(v => v.plate === formattedPlate);

    if (vehicleIndex !== -1) {
        parkingDatabase.vehicles[vehicleIndex].additionalData = newData || 'Nenhum dado novo especificado';
        showMessage('cancelUpdateMessage', `Dados do veículo ${formattedPlate} atualizados com sucesso.`, 'success');
        updateParkingUI(); // Atualiza a UI para refletir os novos dados
    } else {
        showMessage('cancelUpdateMessage', `Veículo ${formattedPlate} não encontrado para atualização.`, 'error');
    }
}

// GET /report - Gerar Relatório Diário
function simulateGenerateReport() {
    const reportMessageElement = document.getElementById('reportMessage');
    const reportDetailsElement = document.getElementById('reportDetails');

    if (parkingDatabase.vehicles.length === 0) {
        reportMessageElement.textContent = 'Não há dados para gerar um relatório no momento.';
        reportMessageElement.className = 'message info';
        reportDetailsElement.textContent = '';
        return;
    }

    const report = {
        totalVehiclesCurrentlyParked: parkingDatabase.vehicles.length,
        availableSlots: parkingDatabase.totalSlots - parkingDatabase.vehicles.length,
        parkedVehiclesDetails: parkingDatabase.vehicles.map(v => ({
            plate: v.plate,
            entryTime: v.entryTime.toLocaleString('pt-BR'),
            // Calculando a duração aqui para o relatório
            durationMs: new Date().getTime() - v.entryTime.getTime(),
            additionalData: v.additionalData || 'N/A'
        }))
    };

    reportMessageElement.textContent = 'Relatório diário gerado:';
    reportMessageElement.className = 'message success';
    reportDetailsElement.textContent = JSON.stringify(report, null, 2); // Formata o JSON para melhor leitura
}

/**
 * Função para atualizar todos os componentes da UI que dependem do estado do estacionamento.
 * Chamada após cada operação que altera o estado do estacionamento.
 */
function updateParkingUI() {
    updateActiveVehiclesList();
    simulateCheckSlots(); // Atualiza as vagas disponíveis
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
        simulateEntry(plate);
    });

    document.getElementById('registerExitBtn').addEventListener('click', () => {
        const plate = document.getElementById('plateInput').value;
        simulateExit(plate);
    });

    // Seção de Consultar Veículo
    document.getElementById('checkVehicleBtn').addEventListener('click', () => {
        const plate = document.getElementById('checkPlateInput').value;
        simulateCheckVehicle(plate);
    });

    // Seção de Tempo de Permanência
    document.getElementById('getTimeSpentBtn').addEventListener('click', () => {
        const plate = document.getElementById('timePlateInput').value;
        simulateTimeSpent(plate);
    });

    // Seção de Veículos Ativos
    document.getElementById('listActiveVehiclesBtn').addEventListener('click', () => {
        updateActiveVehiclesList();
    });

    // Seção de Vagas Disponíveis
    document.getElementById('checkSlotsBtn').addEventListener('click', () => {
        simulateCheckSlots();
    });

    // Seção de Cancelar/Atualizar
    document.getElementById('cancelRegistrationBtn').addEventListener('click', () => {
        const plate = document.getElementById('cancelUpdatePlateInput').value;
        simulateCancelRegistration(plate);
    });

    document.getElementById('updateRegistrationBtn').addEventListener('click', () => {
        const plate = document.getElementById('cancelUpdatePlateInput').value;
        const newData = document.getElementById('updateNewDataInput').value;
        simulateUpdateRegistration(plate, newData);
    });

    // Seção de Relatório
    document.getElementById('generateReportBtn').addEventListener('click', () => {
        simulateGenerateReport();
    });

    // Inicializa a UI ao carregar a página
    updateParkingUI();
});