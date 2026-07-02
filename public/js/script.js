const formulario = document.getElementById("formFinanceiro");
const tabela = document.getElementById("tabelaRegistros");
const saldoAtual = document.getElementById("saldoAtual");
const receitas = document.getElementById("receitas");
const despesas = document.getElementById("despesas");
const orcamento = document.getElementById("orcamento");
const dataAtual = document.getElementById("dataAtual");
const alertas = document.getElementById("alertas");

const API_URL = "/api/movimentacoes";
const STORAGE_KEY = "controle_financeiro_movimentacoes";

const usarLocalStorage = !["localhost", "127.0.0.1"].includes(window.location.hostname);

let movimentacoes = [];

function mostrarData() {
    dataAtual.textContent = new Date().toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
    return "R$ " + Number(valor).toFixed(2);
}

function salvarLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movimentacoes));
}

function carregarLocal() {
    const dados = localStorage.getItem(STORAGE_KEY);
    movimentacoes = dados ? JSON.parse(dados) : [];
}

formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const movimentacao = {
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        tipo: document.getElementById("tipo").value,
        valor: Number(document.getElementById("valor").value),
        data: document.getElementById("data").value,
        limite: Number(document.getElementById("limite").value) || 0
    };

    await cadastrarMovimentacao(movimentacao);
    formulario.reset();
});

function carregarTabela() {
    tabela.innerHTML = "";

    movimentacoes.forEach((item) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${item.data}</td>
            <td>${item.descricao}</td>
            <td>${item.categoria}</td>
            <td>${item.tipo}</td>
            <td>${formatarMoeda(item.valor)}</td>
            <td>
                <button class="excluir" data-id="${item.id}">Excluir</button>
            </td>
        `;

        linha.querySelector(".excluir").addEventListener("click", () => {
            excluir(item.id);
        });

        tabela.appendChild(linha);
    });
}

async function excluir(id) {
    if (usarLocalStorage) {
        movimentacoes = movimentacoes.filter((item) => item.id !== id);
        salvarLocal();
        atualizarSistema();
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!resposta.ok) throw new Error("Erro ao excluir.");
        await carregarMovimentacoes();
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

function atualizarCards() {
    let totalReceitas = 0;
    let totalDespesas = 0;
    let limiteTotal = 0;

    movimentacoes.forEach((item) => {
        if (item.tipo === "Receita") {
            totalReceitas += item.valor;
        } else {
            totalDespesas += item.valor;
        }
        limiteTotal += item.limite || 0;
    });

    receitas.textContent = formatarMoeda(totalReceitas);
    despesas.textContent = formatarMoeda(totalDespesas);
    saldoAtual.textContent = formatarMoeda(totalReceitas - totalDespesas);
    orcamento.textContent = formatarMoeda(limiteTotal);
}

function atualizarAlertas() {
    alertas.innerHTML = "";

    let receita = 0;
    let despesa = 0;

    movimentacoes.forEach((item) => {
        if (item.tipo === "Receita") {
            receita += item.valor;
        } else {
            despesa += item.valor;
        }
    });

    if (receita === 0 && despesa === 0) {
        alertas.innerHTML = `<div class="alerta aviso">💡 Cadastre sua primeira movimentação.</div>`;
        return;
    }

    if (despesa > receita) {
        alertas.innerHTML = `<div class="alerta erro">🚨 Você está gastando mais do que recebe.</div>`;
    } else {
        alertas.innerHTML = `<div class="alerta sucesso">✅ Suas finanças estão equilibradas.</div>`;
    }
}

async function cadastrarMovimentacao(movimentacao) {
    if (usarLocalStorage) {
        movimentacoes.unshift({
            ...movimentacao,
            id: Date.now()
        });
        salvarLocal();
        atualizarSistema();
        return;
    }

    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movimentacao)
        });

        if (!resposta.ok) throw new Error("Erro ao cadastrar.");
        await carregarMovimentacoes();
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

async function carregarMovimentacoes() {
    if (usarLocalStorage) {
        carregarLocal();
        atualizarSistema();
        return;
    }

    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error("Erro ao carregar.");
        movimentacoes = await resposta.json();
        atualizarSistema();
    } catch (erro) {
        console.error(erro);
    }
}

function atualizarSistema() {
    carregarTabela();
    atualizarCards();
    atualizarAlertas();

    if (typeof atualizarGraficos === "function") {
        atualizarGraficos(movimentacoes);
    }
}

mostrarData();
carregarMovimentacoes();
