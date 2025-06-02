// Objeto para simular o banco de dados de veículos no estacionamento
// Em um sistema real, isso seria um banco de dados persistente
const parkingDatabase = {
    vehicles: [], // Array de objetos { plate: 'ABC1234', entryTime: Date }
    slotsAvailable: 50
};

// Funções utilitárias para exibir mensagens
function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    // Limpa a mensagem após alguns segundos
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 5000);
}

// Função para formatar a placa (ex: remover espaços, garantir maiúsculas)
function formatPlate(plate) {
    return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

// --- Funções que simulam as chamadas à API ---

// POST /entry - Registrar Entrada
function simulateEntry(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('entryExitMessage', 'Por favor, digite a placa do veículo.', 'error');
        return;
    }

    if (parkingDatabase.vehicles.length >= parkingDatabase.slotsAvailable) {
        showMessage('entryExitMessage', `Estacionamento lotado. (${parkingDatabase.slotsAvailable} vagas)`, 'error');
        return;
    }

    const exists = parkingDatabase.vehicles.find(v => v.plate === formattedPlate);
    if (exists) {
        showMessage('entryExitMessage', `Veículo com placa ${formattedPlate} já está no estacionamento.`, 'error');
        return;
    }

    parkingDatabase.vehicles.push({ plate: formattedPlate, entryTime: new Date() });
    parkingDatabase.slotsAvailable--;
    showMessage('entryExitMessage', `Entrada de ${formattedPlate} registrada com sucesso!`, 'success');
    updateActiveVehiclesList(); // Atualiza a lista após a entrada
}

// PATCH /exit/{plate} - Registrar Saída
function simulateExit(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('entryExitMessage', 'Por favor, digite a placa do veículo para a saída.', 'error');
        return;
    }

    const initialLength = parkingDatabase.vehicles.length;
    parkingDatabase.vehicles = parkingDatabase.vehicles.filter(v => v.plate !== formattedPlate);

    if (parkingDatabase.vehicles.length < initialLength) {
        parkingDatabase.slotsAvailable++;
        showMessage('entryExitMessage', `Saída de ${formattedPlate} registrada com sucesso!`, 'success');
        updateActiveVehiclesList(); // Atualiza a lista após a saída
    } else {
        showMessage('entryExitMessage', `Veículo com placa ${formattedPlate} não encontrado no estacionamento.`, 'error');
    }
}

// GET /check/{plate} - Verificar Veículo
function simulateCheckVehicle(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('checkVehicleMessage', 'Por favor, digite a placa do veículo para verificar.', 'error');
        return;
    }

    const found = parkingDatabase.vehicles.find(v => v.plate === formattedPlate);
    if (found) {
        showMessage('checkVehicleMessage', `O veículo ${formattedPlate} está no estacionamento.`, 'success');
    } else {
        showMessage('checkVehicleMessage', `O veículo ${formattedPlate} NÃO está no estacionamento.`, 'info');
    }
}

// GET /time/{plate} - Tempo de Permanência
function simulateTimeSpent(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('timeSpentMessage', 'Por favor, digite a placa do veículo para verificar o tempo.', 'error');
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

        showMessage('timeSpentMessage', `O veículo ${formattedPlate} está estacionado há: ${hours}h ${minutes}m ${seconds}s.`, 'success');
    } else {
        showMessage('timeSpentMessage', `Veículo com placa ${formattedPlate} não encontrado no estacionamento.`, 'error');
    }
}

// GET /active - Listar Veículos Ativos
function updateActiveVehiclesList() {
    const listElement = document.querySelector('#activeVehiclesList ul');
    listElement.innerHTML = ''; // Limpa a lista existente

    if (parkingDatabase.vehicles.length === 0) {
        document.getElementById('activeVehiclesMessage').textContent = 'Nenhum veículo ativo no momento.';
        document.getElementById('activeVehiclesMessage').className = 'message info';
        return;
    }

    document.getElementById('activeVehiclesMessage').textContent = ''; // Limpa a mensagem se houver veículos
    document.getElementById('activeVehiclesMessage').className = 'message';

    parkingDatabase.vehicles.forEach(vehicle => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${vehicle.plate}</span> (Entrada: ${vehicle.entryTime.toLocaleString()})`;
        listElement.appendChild(listItem);
    });
}

// GET /slots - Verificar Vagas Disponíveis
function simulateCheckSlots() {
    showMessage('slotsMessage', `Vagas disponíveis: ${parkingDatabase.slotsAvailable}`, 'success');
}

// DELETE /cancel/{plate} - Cancelar Registro
function simulateCancelRegistration(plate) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('cancelUpdateMessage', 'Por favor, digite a placa do veículo para cancelar.', 'error');
        return;
    }

    const initialLength = parkingDatabase.vehicles.length;
    parkingDatabase.vehicles = parkingDatabase.vehicles.filter(v => v.plate !== formattedPlate);

    if (parkingDatabase.vehicles.length < initialLength) {
        parkingDatabase.slotsAvailable++;
        showMessage('cancelUpdateMessage', `Registro do veículo ${formattedPlate} cancelado com sucesso.`, 'success');
        updateActiveVehiclesList();
    } else {
        showMessage('cancelUpdateMessage', `Veículo ${formattedPlate} não encontrado para cancelar o registro.`, 'error');
    }
}

// PUT /update/{plate} - Atualizar Dados
function simulateUpdateRegistration(plate, newData) {
    const formattedPlate = formatPlate(plate);
    if (!formattedPlate) {
        showMessage('cancelUpdateMessage', 'Por favor, digite a placa do veículo para atualizar.', 'error');
        return;
    }

    const vehicleIndex = parkingDatabase.vehicles.findIndex(v => v.plate === formattedPlate);

    if (vehicleIndex !== -1) {
        // Simplesmente adiciona um novo campo 'data' ou atualiza
        parkingDatabase.vehicles[vehicleIndex].newData = newData || 'Nenhum dado novo especificado';
        showMessage('cancelUpdateMessage', `Dados do veículo ${formattedPlate} atualizados com sucesso.`, 'success');
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
        availableSlots: parkingDatabase.slotsAvailable,
        parkedVehiclesDetails: parkingDatabase.vehicles.map(v => ({
            plate: v.plate,
            entryTime: v.entryTime.toLocaleString(),
            duration: new Date().getTime() - v.entryTime.getTime() // Milissegundos
        }))
    };

    reportMessageElement.textContent = 'Relatório diário gerado:';
    reportMessageElement.className = 'message success';
    reportDetailsElement.textContent = JSON.stringify(report, null, 2); // Formata o JSON para melhor leitura
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

    // Inicializa a lista de veículos ativos ao carregar a página
    updateActiveVehiclesList();
    simulateCheckSlots();
});