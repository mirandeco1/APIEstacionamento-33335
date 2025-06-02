const API_URL = 'http://cnms-parking-api.net.uztec.com.br/';

document.addEventListener('DOMContentLoaded', () => {
    carregarPlacas();

    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', cadastrarPlaca);
    }
});

// Função para exibir mensagens na UI
function exibirMensagem(elementoId, mensagem, tipo) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensagem;
        elemento.className = tipo; // 'success' ou 'error'
        setTimeout(() => {
            elemento.textContent = '';
            elemento.className = '';
        }, 5000); // Limpa a mensagem após 5 segundos
    }
}

// Função para cadastrar uma nova placa
async function cadastrarPlaca(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const placaInput = document.getElementById('placa');
    const modeloInput = document.getElementById('modelo');
    const corInput = document.getElementById('cor');

    const novaPlaca = {
        placa: placaInput.value,
        modelo: modeloInput.value,
        cor: corInput.value
    };

    try {
        const response = await fetch(`${API_URL}veiculo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaPlaca)
        });

        if (response.ok) {
            const data = await response.json();
            exibirMensagem('mensagem-cadastro', 'Placa cadastrada com sucesso!', 'success');
            formCadastro.reset(); // Limpa o formulário
            carregarPlacas(); // Recarrega a lista de placas
        } else {
            const errorData = await response.json();
            exibirMensagem('mensagem-cadastro', `Erro ao cadastrar placa: ${errorData.message || response.statusText}`, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição de cadastro:', error);
        exibirMensagem('mensagem-cadastro', 'Erro de conexão ou servidor.', 'error');
    }
}

// Função para carregar e exibir as placas cadastradas
async function carregarPlacas() {
    const corpoTabelaPlacas = document.getElementById('corpo-tabela-placas');
    corpoTabelaPlacas.innerHTML = '<tr><td colspan="4">Carregando placas...</td></tr>';
    exibirMensagem('mensagem-lista', '', ''); // Limpa mensagens anteriores

    try {
        const response = await fetch(`${API_URL}veiculos`); // Assumindo que a API tem um endpoint para listar todos os veículos
        if (response.ok) {
            const placas = await response.json();
            corpoTabelaPlacas.innerHTML = ''; // Limpa o conteúdo antes de adicionar novos

            if (placas.length === 0) {
                corpoTabelaPlacas.innerHTML = '<tr><td colspan="4">Nenhuma placa cadastrada.</td></tr>';
            } else {
                placas.forEach(placa => {
                    const row = corpoTabelaPlacas.insertRow();
                    row.insertCell().textContent = placa.placa;
                    row.insertCell().textContent = placa.modelo;
                    row.insertCell().textContent = placa.cor;

                    const acoesCell = row.insertCell();
                    const btnExcluir = document.createElement('button');
                    btnExcluir.textContent = 'Excluir';
                    btnExcluir.classList.add('acao-button');
                    btnExcluir.addEventListener('click', () => excluirPlaca(placa.id)); // Assumindo que cada placa tem um 'id'
                    acoesCell.appendChild(btnExcluir);
                });
            }
        } else {
            const errorData = await response.json();
            exibirMensagem('mensagem-lista', `Erro ao carregar placas: ${errorData.message || response.statusText}`, 'error');
            corpoTabelaPlacas.innerHTML = '<tr><td colspan="4">Erro ao carregar placas.</td></tr>';
        }
    } catch (error) {
        console.error('Erro na requisição de listagem:', error);
        exibirMensagem('mensagem-lista', 'Erro de conexão ou servidor ao carregar placas.', 'error');
        corpoTabelaPlacas.innerHTML = '<tr><td colspan="4">Erro de conexão.</td></tr>';
    }
}

// Função para excluir uma placa
async function excluirPlaca(id) {
    if (!confirm('Tem certeza que deseja excluir esta placa?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}veiculo/${id}`, { // Assumindo que a API usa /veiculo/{id} para DELETE
            method: 'DELETE'
        });

        if (response.ok) {
            exibirMensagem('mensagem-lista', 'Placa excluída com sucesso!', 'success');
            carregarPlacas(); // Recarrega a lista
        } else {
            const errorData = await response.json();
            exibirMensagem('mensagem-lista', `Erro ao excluir placa: ${errorData.message || response.statusText}`, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição de exclusão:', error);
        exibirMensagem('mensagem-lista', 'Erro de conexão ou servidor ao excluir.', 'error');
    }
}