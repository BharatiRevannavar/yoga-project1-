const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth')
const poseRoutes = require('./routes/poses')
const historyRoutes = require('./routes/history')

app.use('/api/auth', authRoutes)
app.use('/api/poses', poseRoutes)
app.use('/api/history', historyRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ✅`)
})