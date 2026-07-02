const formulario = document.getElementById("formFinanceiro");
const tabela = document.getElementById("tabelaRegistros");
const saldoAtual = document.getElementById("saldoAtual");
const receitas = document.getElementById("receitas");
const despesas = document.getElementById("despesas");
const orcamento = document.getElementById("orcamento");
const dataAtual = document.getElementById("dataAtual");
const alertas = document.getElementById("alertas");

const API_URL = "/api/movimentacoes";

let movimentacoes = [];

function mostrarData() {
    const hoje = new Date();
    dataAtual.textContent = hoje.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
    return "R$ " + Number(valor).toFixed(2);
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
    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (!resposta.ok) {
            throw new Error("Não foi possível excluir a movimentação.");
        }

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
        alertas.innerHTML = `
            <div class="alerta aviso">💡 Cadastre sua primeira movimentação.</div>
        `;
        return;
    }

    if (despesa > receita) {
        alertas.innerHTML = `
            <div class="alerta erro">🚨 Você está gastando mais do que recebe.</div>
        `;
    } else {
        alertas.innerHTML = `
            <div class="alerta sucesso">✅ Suas finanças estão equilibradas.</div>
        `;
    }
}

async function cadastrarMovimentacao(movimentacao) {
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movimentacao)
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível cadastrar a movimentação.");
        }

        await carregarMovimentacoes();
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

async function carregarMovimentacoes() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as movimentações.");
        }

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
