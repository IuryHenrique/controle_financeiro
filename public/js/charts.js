let graficoCategoria = null;
let graficoReceitaDespesa = null;

function atualizarGraficos(movimentacoes) {
    atualizarGraficoCategoria(movimentacoes);
    atualizarGraficoReceitaDespesa(movimentacoes);
}

function atualizarGraficoCategoria(movimentacoes) {
    const categorias = {};

    movimentacoes.forEach((item) => {
        if (item.tipo === "Despesa") {
            if (!categorias[item.categoria]) {
                categorias[item.categoria] = 0;
            }
            categorias[item.categoria] += item.valor;
        }
    });

    const labels = Object.keys(categorias);
    const valores = Object.values(categorias);

    if (graficoCategoria) {
        graficoCategoria.destroy();
    }

    const ctx = document.getElementById("graficoCategoria").getContext("2d");

    graficoCategoria = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    "#6D28D9",
                    "#22C55E",
                    "#3B82F6",
                    "#F59E0B",
                    "#EF4444",
                    "#EC4899",
                    "#14B8A6"
                ],
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "right",
                    align: "center",
                    labels: {
                        boxWidth: 18,
                        boxHeight: 18,
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: {
                            size: 14,
                            family: "Inter",
                            weight: "500"
                        }
                    }
                }
            }
        }
    });
}

function atualizarGraficoReceitaDespesa(movimentacoes) {
    let receita = 0;
    let despesa = 0;

    movimentacoes.forEach((item) => {
        if (item.tipo === "Receita") {
            receita += item.valor;
        } else {
            despesa += item.valor;
        }
    });

    if (graficoReceitaDespesa) {
        graficoReceitaDespesa.destroy();
    }

    const ctx = document.getElementById("graficoReceitaDespesa").getContext("2d");

    graficoReceitaDespesa = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Receitas", "Despesas"],
            datasets: [{
                label: "Valor (R$)",
                data: [receita, despesa],
                backgroundColor: ["#22C55E", "#EF4444"],
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
