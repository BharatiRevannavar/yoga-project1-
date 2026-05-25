const express = require('express')
const router = express.Router()
const db = require('../db')

router.post('/save', (req, res) => {
    const { user_id, pose_name, hold_time, best_score } = req.body
    
    const today = new Date()
    const date = today.toISOString().split('T')[0]
    const time = today.toTimeString().split(' ')[0]
    
    const sql = `INSERT INTO pose_history 
    (user_id, pose_name, hold_time, best_score, date, time)
    VALUES (?, ?, ?, ?, ?, ?)`
    
    db.query(sql,
    [user_id, pose_name, hold_time, best_score, date, time],
    (err, result) => {
        if(err) {
            res.status(500).json({ error: err.message })
        } else {
            res.json({ message: 'Pose saved! ✅' })
        }
    })
})

module.exports = router