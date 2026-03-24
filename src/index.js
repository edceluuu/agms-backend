require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
app.use(helmet())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log(`AGMS backend running on port ${PORT}`))