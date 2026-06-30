/*==================================================
    CONTROLE FINANCEIRO INTELIGENTE
    script.js
==================================================*/


// ============================================
// ELEMENTOS
// ============================================

const formulario = document.getElementById("formFinanceiro");

const tabela = document.getElementById("tabelaRegistros");

const saldoAtual = document.getElementById("saldoAtual");

const receitas = document.getElementById("receitas");

const despesas = document.getElementById("despesas");

const orcamento = document.getElementById("orcamento");

const dataAtual = document.getElementById("dataAtual");

const alertas = document.getElementById("alertas");

const API_URL = "http://localhost:3000/api/movimentacoes";
// ============================================
// BANCO LOCAL
// ============================================

let movimentacoes = [];

// ============================================
// DATA
// ============================================

function mostrarData() {

    const hoje = new Date();

    dataAtual.innerHTML =
        hoje.toLocaleDateString("pt-BR");

}




// ============================================
// CADASTRAR
// ============================================

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const descricao =
        document.getElementById("descricao").value;

    const categoria =
        document.getElementById("categoria").value;

    const tipo =
        document.getElementById("tipo").value;

    const valor =
        Number(document.getElementById("valor").value);

    const data =
        document.getElementById("data").value;

    const limite =
        Number(document.getElementById("limite").value);

    const movimentacao = {

        id: Date.now(),

        descricao,

        categoria,

        tipo,

        valor,

        data,

        limite

    };

    await cadastrarMovimentacao(movimentacao);

    formulario.reset();

});


// ============================================
// TABELA
// ============================================

function carregarTabela() {

    tabela.innerHTML = "";

    movimentacoes.forEach(item => {

        tabela.innerHTML += `

        <tr>

            <td>${item.data}</td>

            <td>${item.descricao}</td>

            <td>${item.categoria}</td>

            <td>${item.tipo}</td>

            <td>R$ ${item.valor.toFixed(2)}</td>

            <td>

                <button

                    class="excluir"

                    onclick="excluir(${item.id})">

                    Excluir

                </button>

            </td>

        </tr>

        `;

    });

}


// ============================================
// EXCLUIR
// ============================================

function excluir(id){

    movimentacoes =

        movimentacoes.filter(

            item => item.id !== id

        );

    salvarLocal();

    atualizarSistema();

}


// ============================================
// CARDS
// ============================================

function atualizarCards(){

    let totalReceitas = 0;

    let totalDespesas = 0;

    let limiteTotal = 0;

    movimentacoes.forEach(item=>{

        if(item.tipo==="Receita"){

            totalReceitas += item.valor;

        }

        else{

            totalDespesas += item.valor;

        }

        limiteTotal += item.limite;

    });

    receitas.innerHTML =
        "R$ " + totalReceitas.toFixed(2);

    despesas.innerHTML =
        "R$ " + totalDespesas.toFixed(2);

    saldoAtual.innerHTML =
        "R$ " + (totalReceitas-totalDespesas).toFixed(2);

    orcamento.innerHTML =
        "R$ " + limiteTotal.toFixed(2);

}


// ============================================
// ALERTAS
// ============================================

function atualizarAlertas(){

    alertas.innerHTML = "";

    let receita = 0;

    let despesa = 0;

    movimentacoes.forEach(item=>{

        if(item.tipo==="Receita")

            receita += item.valor;

        else

            despesa += item.valor;

    });

    if(receita===0 && despesa===0){

        alertas.innerHTML += `

        <div class="alerta aviso">

            💡 Cadastre sua primeira movimentação.

        </div>

        `;

        return;

    }

    if(despesa>receita){

        alertas.innerHTML += `

        <div class="alerta erro">

            🚨 Você está gastando mais do que recebe.

        </div>

        `;

    }

    else{

        alertas.innerHTML += `

        <div class="alerta sucesso">

            ✅ Suas finanças estão equilibradas.

        </div>

        `;

    }

}

// ============================================
// CADASTRAR NO BANCO
// ============================================

async function cadastrarMovimentacao(movimentacao) {

    try {

        const resposta = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(movimentacao)

        });

        const dados = await resposta.json();

        console.log(dados);

        carregarMovimentacoes();

    }

    catch (erro) {

        console.error("Erro:", erro);

    }

}

// ============================================
// BUSCAR MOVIMENTAÇÕES
// ============================================

async function carregarMovimentacoes() {

    try {

        const resposta = await fetch(API_URL);

        movimentacoes = await resposta.json();

        atualizarSistema();

    }

    catch (erro) {

        console.error(erro);

    }

}

// ============================================
// SISTEMA
// ============================================

function atualizarSistema(){

    carregarTabela();

    atualizarCards();

    atualizarAlertas();

    if(typeof atualizarGraficos==="function"){

        atualizarGraficos(movimentacoes);

    }

}


// ============================================
// INICIAR
// ============================================

mostrarData();

carregarMovimentacoes();