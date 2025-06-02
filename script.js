const API = 'http://cnms-parking-api.net.uztec.com.br/api/v1'

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
 * @param {string} plate*/