document.addEventListener("DOMContentLoaded", function () {
    const poderInput = document.getElementById("poder");
    const habilidadeInput = document.getElementById("habilidade");
    const resistenciaInput = document.getElementById("resistencia");

    const acaoInput = document.getElementById("acao");
    const manaInput = document.getElementById("mana");
    const vidaInput = document.getElementById("vida");

    const pontosInput = document.getElementById("pontos");
    const nivelSpan = document.getElementById("nivel");

    const form = document.getElementById("fichaForm");

    // Função para calcular e atualizar os campos de Ação, Mana, Vida e Pontos
    function calcularCampos() {
        const poder = parseFloat(poderInput.value) || 0;
        const habilidade = parseFloat(habilidadeInput.value) || 0;
        const resistencia = parseFloat(resistenciaInput.value) || 0;

        const acao = poder;
        const mana = habilidade * 5;
        const vida = resistencia * 5;
        const pontos = poder + habilidade + resistencia;

        acaoInput.value = acao;
        manaInput.value = mana;
        vidaInput.value = vida;
        pontosInput.value = pontos;

        atualizarNivel();
    }

    // Função para atualizar o texto do nível com base nos pontos
    function atualizarNivel() {
        const pontos = parseFloat(pontosInput.value) || 0;

        if (pontos <= 19) {
            nivelSpan.textContent = "INICIANTE";
        } else if (pontos > 19 && pontos <= 34) {
            nivelSpan.textContent = "HERÓI";
        } else if (pontos > 34) {
            nivelSpan.textContent = "VETERANO";
        } else {
            nivelSpan.textContent = "";
        }
    }

    // Adiciona eventos de input para os campos de Poder, Habilidade e Resistência
    poderInput.addEventListener("input", calcularCampos);
    habilidadeInput.addEventListener("input", calcularCampos);
    resistenciaInput.addEventListener("input", calcularCampos);

    // Adiciona evento de input para o campo de Pontos
    pontosInput.addEventListener("input", atualizarNivel);

    // Adiciona um evento de submit ao formulário
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Captura os dados do formulário
        const nome = document.getElementById("nome").value;
        const arquétipo = document.getElementById("arquétipo").value;
        const escala = document.getElementById("tamanho").value;
        const pontos = document.getElementById("pontos").value;
        const experiencia = document.getElementById("experiencia").value;

        // Cria um objeto com os dados da ficha
        const ficha = {
            nome,
            arquétipo,
            escala,
            pontos,
            experiencia,
        };

        // Adiciona a ficha à tabela
        adicionarFicha(ficha);

        // Limpa o formulário após salvar
        limparFormulario();
    });

    // Registrar o Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").then((registration) => {
            console.log("Service Worker registrado com sucesso:", registration);
        }).catch((error) => {
            console.log("Falha ao registrar o Service Worker:", error);
        });
    }
});

// Função para limpar o formulário
function limparFormulario() {
    document.getElementById("fichaForm").reset();
    document.getElementById("pontos").value = "";
    document.getElementById("acao").value = "";
    document.getElementById("mana").value = "";
    document.getElementById("vida").value = "";
    document.getElementById("acaoAtual").value = "";
    document.getElementById("manaAtual").value = "";
    document.getElementById("vidaAtual").value = "";
    document.getElementById("nivel").textContent = "INICIANTE";
}

// Função para adicionar uma ficha à tabela
function adicionarFicha(ficha) {
    const tableBody = document.querySelector("#fichasTable tbody");
    const newRow = tableBody.insertRow();

    newRow.innerHTML = `
        <td>${ficha.nome}</td>
        <td>${ficha.arquétipo}</td>
        <td>${ficha.escala}</td>
        <td>${ficha.pontos}</td>
        <td>${ficha.experiencia}</td>
        <td>
            <button onclick="editarFicha(this)">Editar</button>
            <button onclick="excluirFicha(this)">Excluir</button>
        </td>
    `;
}

// Função para editar uma ficha
function editarFicha(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");

    document.getElementById("nome").value = cells[0].textContent;
    document.getElementById("arquétipo").value = cells[1].textContent;
    document.getElementById("escala").value = cells[2].textContent;
    document.getElementById("pontos").value = cells[3].textContent;
    document.getElementById("experiencia").value = cells[4].textContent;

    atualizarNivel();
    row.remove();
}

// Função para excluir uma ficha
function excluirFicha(button) {
    const row = button.closest("tr");
    row.remove();
}

// Função para salvar um backup dos dados em um arquivo JSON
function salvarBackup() {
    const fichas = [];
    const rows = document.querySelectorAll("#fichasTable tbody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const ficha = {
            nome: cells[0].textContent,
            arquétipo: cells[1].textContent,
            escala: cells[2].textContent,
            pontos: cells[3].textContent,
            experiencia: cells[4].textContent,
        };
        fichas.push(ficha);
    });

    const json = JSON.stringify(fichas, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_fichas.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Backup salvo com sucesso!");
}

// Função para carregar um backup a partir de um arquivo JSON
function carregarBackup() {
    const fileInput = document.getElementById("backupFile");
    fileInput.click();

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const fichas = JSON.parse(e.target.result);
                const tableBody = document.querySelector("#fichasTable tbody");
                tableBody.innerHTML = "";

                fichas.forEach(ficha => {
                    adicionarFicha(ficha);
                });

                alert("Backup carregado com sucesso!");
            } catch (error) {
                alert("Erro ao carregar o backup. Verifique se o arquivo é válido.");
                console.error(error);
            }
        };

        reader.readAsText(file);
    });
}