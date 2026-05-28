const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
// require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
console.log(process.env.DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- API routes ---
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json(result.rows);
  } catch (err) {
    console.log(err)
    res.status(500).json({ err });
  }
});

app.get('/api/:table', async (req, res) => {
  try {
    const { table } = req.params
    const { sort = 'asc' } = req.query

    const allowed = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    const allowedNames = allowed.rows.map(r => r.table_name)

    if (!allowedNames.includes(table)) {
      return res.status(403).json({ error: 'Table not allowed' })
    }

    // -----------------------------
    // SAFE SORTING RULES PER TABLE
    // -----------------------------
    const sortRules = {
      secretarias: 'nome',
      usuarios: 'nome',
      contratos: 'vigencia_fim',
      empresas: 'razao_social',
    }

    const sortColumn = sortRules[table] || 'id'
    const direction = sort === 'desc' ? 'DESC' : 'ASC'

    const result = await pool.query(
      `SELECT * FROM "${table}" ORDER BY "${sortColumn}" ${direction}`
    )

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/update_contract/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body


    const keys = Object.keys(data)

    if (!keys.length) {
      return res
        .status(400)
        .json({
          error: 'No fields provided',
        })
    }

    const values = Object.values(data)

    const setClause = keys
      .map(
        (key, index) =>
          `"${key}" = $${index + 1}`
      )
      .join(', ')

    const query = `
      UPDATE "contratos"
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `

    const result = await pool.query(
      query,
      [...values, id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({
      error: err.message,
    })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const keys = Object.keys(data)

    if (!keys.length) {
      return res.status(400).json({
        error: 'No fields provided',
      })
    }

    const values = Object.values(data)

    const setClause = keys
      .map(
        (key, index) =>
          `"${key}" = $${index + 1}`
      )
      .join(', ')

    const query = `
      UPDATE "usuarios"
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `

    const result = await pool.query(
      query,
      [...values, id]
    )

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({
      error: err.message,
    })
  }
})

app.post('/api/user', async (req, res) => {
  try {
    const { nome, email, secretaria_id } = req.body

    const result = await pool.query(
      `
      INSERT INTO "usuarios" (nome, email, secretaria_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [nome, email, secretaria_id]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/update_secretarias/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const keys = Object.keys(data)

    if (!keys.length) {
      return res.status(400).json({
        error: 'No fields provided',
      })
    }

    const values = Object.values(data)

    const setClause = keys
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(', ')

    const result = await pool.query(
      `
      UPDATE "secretarias"
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
      `,
      [...values, id]
    )

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Secretaria not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/create_secretarias', async (req, res) => {
  try {
    const { nome } = req.body

    if (!nome) {
      return res.status(400).json({
        error: 'Nome is required',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO "secretarias" (nome)
      VALUES ($1)
      RETURNING *
      `,
      [nome]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/delete_secretarias/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      DELETE FROM "secretarias"
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Secretaria not found',
      })
    }

    res.json({ success: true, deleted: result.rows[0] })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/update_empresa/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const keys = Object.keys(data)

    if (!keys.length) {
      return res.status(400).json({
        error: 'No fields provided',
      })
    }

    const values = Object.values(data)

    const setClause = keys
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(', ')

    const result = await pool.query(
      `
      UPDATE "empresas"
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
      `,
      [...values, id]
    )

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Secretaria not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/create_empresa', async (req, res) => {
  try {
    const { razao_fiscal, cnpj } = req.body

    if (!razao_fiscal) {
      return res.status(400).json({
        error: 'Razão Fiscal is required',
      })
    }
    if (!cnpj) {
      return res.status(400).json({
        error: 'CNPJ is required',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO "empresas" (nome, cnpj)
      VALUES ($1)
      RETURNING *
      `,
      [razao_fiscal, cnpj]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/delete_empresa/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      DELETE FROM "empresas"
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Empresas not found',
      })
    }

    res.json({ success: true, deleted: result.rows[0] })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/create_contrato', async (req, res) => {
  try {
    const {
      numero_contrato,
      objeto,
      valor_inicial,
      vigencia_inicio,
      vigencia_fim,
      secretaria_id,
      empresa_id,
      gestor_id,
      legislacao,
      publicado_ama,
      publicado_pncp,
      criado_em,
    } = req.body

    // Required fields
    if (!numero_contrato) {
      return res.status(400).json({
        error: 'Número do contrato is required',
      })
    }

    if (!objeto) {
      return res.status(400).json({
        error: 'Objeto is required',
      })
    }

    if (!secretaria_id) {
      return res.status(400).json({
        error: 'Secretaria is required',
      })
    }

    // Date validation
    if (
      criado_em &&
      vigencia_inicio &&
      new Date(criado_em) >
        new Date(vigencia_inicio)
    ) {
      return res.status(400).json({
        error:
          'Assinado em must be before vigência início',
      })
    }

    if (
      vigencia_inicio &&
      vigencia_fim &&
      new Date(vigencia_inicio) >
        new Date(vigencia_fim)
    ) {
      return res.status(400).json({
        error:
          'Vigência início must be before vigência fim',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO "contratos" (
        numero_contrato,
        objeto,
        valor_inicial,
        criado_em,
        vigencia_inicio,
        vigencia_fim,
        secretaria_id,
        empresa_id,
        gestor_id,
        legislacao,
        publicado_ama,
        publicado_pncp
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12
      )
      RETURNING *
      `,
      [
        numero_contrato,
        objeto,
        valor_inicial || null,
        criado_em || new Date(),
        vigencia_inicio || null,
        vigencia_fim || null,
        secretaria_id || null,
        empresa_id || null,
        gestor_id || null,
        legislacao || null,
        publicado_ama ?? null,
        publicado_pncp ?? null,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.log(err)

    res.status(500).json({
      error: err.message,
    })
  }
})

// --- Serve React frontend ---
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: send index.html for any non-API route (for React Router)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));