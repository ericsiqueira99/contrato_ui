const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
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

app.get('/api/contratos', async (req, res) => {
  try {
    const { sort = 'asc' } = req.query
    const direction = sort === 'desc' ? 'DESC' : 'ASC'

    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(array_agg(cf.usuario_id) FILTER (WHERE cf.usuario_id IS NOT NULL), '{}') AS fiscais
      FROM contratos c
      LEFT JOIN contrato_fiscais cf ON cf.contrato_id = c.id
      GROUP BY c.id
      ORDER BY c.vigencia_fim ${direction}
    `)

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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
  const client = await pool.connect()
  try {
    const { id } = req.params
    const { fiscais, ...data } = req.body  // separate fiscais from contract fields

    const keys = Object.keys(data)
    if (!keys.length && !fiscais) {
      return res.status(400).json({ error: 'No fields provided' })
    }

    await client.query('BEGIN')

    // Update contrato fields (only if there are fields besides fiscais)
    let updatedContrato = null
    if (keys.length) {
      const values = Object.values(data)
      const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ')
      const query = `UPDATE "contratos" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`
      const result = await client.query(query, [...values, id])
      updatedContrato = result.rows[0]
    }

    // Sync fiscais if provided
    if (fiscais !== undefined) {
      // fiscais should be an array of usuario_id, e.g. [1, 2, 3]
      if (!Array.isArray(fiscais)) {
        throw new Error('fiscais must be an array of usuario_ids')
      }

      await client.query(
        `DELETE FROM contrato_fiscais WHERE contrato_id = $1`,
        [id]
      )

      if (fiscais.length > 0) {
        const fiscaisValues = fiscais
          .map((_, i) => `($1, $${i + 2})`)
          .join(', ')
        await client.query(
          `INSERT INTO contrato_fiscais (contrato_id, usuario_id) VALUES ${fiscaisValues}`,
          [id, ...fiscais]
        )
      }
    }

    await client.query('COMMIT')

    // Return contrato + updated fiscais list
    const fiscaisResult = await client.query(
      `SELECT usuario_id FROM contrato_fiscais WHERE contrato_id = $1`,
      [id]
    )

    res.json({
      ...updatedContrato,
      fiscais: fiscaisResult.rows.map(r => r.usuario_id),
    })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

app.post('/api/create_contrato', async (req, res) => {
  const client = await pool.connect()
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
      assinado_em,
      fiscais = [],  // array of usuario_ids, optional
    } = req.body
    if (!numero_contrato) return res.status(400).json({ error: 'Número do contrato is required' })
    if (!objeto) return res.status(400).json({ error: 'Objeto is required' })
    if (!secretaria_id) return res.status(400).json({ error: 'Secretaria is required' })
    if (vigencia_inicio && vigencia_fim && new Date(vigencia_inicio) > new Date(vigencia_fim)) {
      return res.status(400).json({ error: 'Vigência início must be before vigência fim' })
    }

    await client.query('BEGIN')

    const result = await client.query(
      `INSERT INTO "contratos" (
        numero_contrato, objeto, valor_inicial, criado_em, assinado_em,
        vigencia_inicio, vigencia_fim, secretaria_id,
        empresa_id, gestor_id, legislacao, publicado_ama, publicado_pncp
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        numero_contrato,
        objeto,
        valor_inicial || null,
        criado_em || new Date(),
        assinado_em || new Date(),
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

    const contrato = result.rows[0]

    // Insert fiscais if provided
    if (fiscais.length > 0) {
      const fiscaisValues = fiscais
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ')
      await client.query(
        `INSERT INTO contrato_fiscais (contrato_id, usuario_id) VALUES ${fiscaisValues}`,
        [contrato.id, ...fiscais]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      ...contrato,
      fiscais,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.log(err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
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
    const { nome, email, telefone, secretaria_id } = req.body

    const result = await pool.query(
      `
      INSERT INTO "usuarios" (nome, email, telefone, secretaria_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [nome, email, telefone, secretaria_id]
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
    const { razao_social, cnpj, email, telefone } = req.body

    if (!razao_social) {
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
      INSERT INTO "empresas" (razao_social, cnpj, email, telefone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [razao_social, cnpj, email, telefone ]
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

// --- Serve React frontend ---
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: send index.html for any non-API route (for React Router)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));