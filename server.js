// ============================================
// CONTROLE FINANCEIRO INTELIGENTE
// server.js
// ============================================

// Importa as bibliotecas
const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
// Cria o servidor
const app = express();

// Porta onde o servidor será executado
const PORT = 3000;

// ============================================
// CONFIGURAÇÕES
// ============================================

// Permite comunicação entre Front-end e Back-end
app.use(cors());

// Permite receber dados em JSON
app.use(express.json());

// Define a pasta "public" como pública
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// BANCO DE DADOS
// ============================================

const db = new sqlite3.Database("banco.db", (err) => {

    if (err) {

        console.error("Erro ao conectar ao banco:", err.message);

    } else {

        console.log("Banco de dados conectado com sucesso!");

    }

});

// ============================================
// CRIAR TABELA
// ============================================

db.serialize(() => {

    db.run(`

        CREATE TABLE IF NOT EXISTS movimentacoes (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            descricao TEXT NOT NULL,

            categoria TEXT NOT NULL,

            tipo TEXT NOT NULL,

            valor REAL NOT NULL,

            data TEXT NOT NULL,

            limite REAL NOT NULL

        )

    `);

});

// ============================================
// ROTA PRINCIPAL
// ============================================

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "public", "index.html"));

});

// ============================================
// LISTAR MOVIMENTAÇÕES
// ============================================

app.get("/api/movimentacoes", (req, res) => {

    db.all(

        "SELECT * FROM movimentacoes ORDER BY id DESC",

        [],

        (err, rows) => {

            if (err) {

                return res.status(500).json({

                    erro: err.message

                });

            }

            res.json(rows);

        }

    );

});

// ============================================
// CADASTRAR MOVIMENTAÇÃO
// ============================================

app.post("/api/movimentacoes", (req, res) => {

    const {

        descricao,
        categoria,
        tipo,
        valor,
        data,
        limite

    } = req.body;

    const sql = `

        INSERT INTO movimentacoes (

            descricao,

            categoria,

            tipo,

            valor,

            data,

            limite

        )

        VALUES (?, ?, ?, ?, ?, ?)

    `;

    db.run(

        sql,

        [

            descricao,

            categoria,

            tipo,

            valor,

            data,

            limite

        ],

        function (err) {

            if (err) {

                return res.status(500).json({

                    sucesso: false,

                    mensagem: err.message

                });

            }

            res.status(201).json({

                sucesso: true,

                mensagem: "Movimentação cadastrada com sucesso.",

                id: this.lastID

            });

        }

    );

});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {

    console.log(`Servidor rodando em http://localhost:${PORT}`);

});