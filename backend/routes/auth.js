const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

router.post('/register', (req, res) => {
    const { name, email, password, height, weight } = req.body
    const bmi = (weight / (height * height)).toFixed(2)
    const hashedPassword = bcrypt.hashSync(password, 10)
    
    const sql = `INSERT INTO users 
    (name, email, password, height, weight, bmi) 
    VALUES (?, ?, ?, ?, ?, ?)`
    
    db.query(sql, 
    [name, email, hashedPassword, height, weight, bmi],
    (err, result) => {
        if(err) {
            res.status(500).json({ error: err.message })
        } else {
            res.json({ message: 'Registered successfully!' })
        }
    })
})

router.post('/login', (req, res) => {
    const { email, password } = req.body
    const sql = 'SELECT * FROM users WHERE email = ?'
    
    db.query(sql, [email], (err, results) => {
        if(err) return res.status(500).json({ error: err.message })
        if(results.length === 0) {
            return res.status(401).json({ error: 'User not found!' })
        }
        
        const user = results[0]
        const validPassword = bcrypt.compareSync(
            password, user.password)
        
        if(!validPassword) {
            return res.status(401).json({ error: 'Wrong password!' })
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )
        
        res.json({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                bmi: user.bmi,
                height: user.height,
                weight: user.weight
            }
        })
    })
})

module.exports = router