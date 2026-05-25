const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/:user_id', (req, res) => {
    const { user_id } = req.params
    
    const sql = `SELECT * FROM pose_history 
    WHERE user_id = ? 
    ORDER BY date DESC, time DESC`
    
    db.query(sql, [user_id], (err, results) => {
        if(err) {
            res.status(500).json({ error: err.message })
        } else {
            res.json(results)
        }
    })
})

module.exports = router