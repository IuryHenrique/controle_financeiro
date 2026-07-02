const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("banco.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
    } else {
        console.log("Banco de dados conectado com sucesso!");
    }
});

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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/movimentacoes", (req, res) => {
    db.all(
        "SELECT * FROM movimentacoes ORDER BY id DESC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ erro: err.message });
            }
            res.json(rows);
        }
    );
});

app.post("/api/movimentacoes", (req, res) => {
    const { descricao, categoria, tipo, valor, data, limite } = req.body;

    db.run(
        `INSERT INTO movimentacoes (descricao, categoria, tipo, valor, data, limite)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [descricao, categoria, tipo, valor, data, limite ?? 0],
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

app.delete("/api/movimentacoes/:id", (req, res) => {
    db.run(
        "DELETE FROM movimentacoes WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    sucesso: false,
                    mensagem: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Movimentação não encontrada."
                });
            }

            res.json({
                sucesso: true,
                mensagem: "Movimentação excluída com sucesso."
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
