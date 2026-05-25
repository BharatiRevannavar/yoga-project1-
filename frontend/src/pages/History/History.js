import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './History.css'

function History() {
    const [history_data, setHistoryData] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        if(user) {
            axios.get(
                `http://localhost:5000/api/history/${user.id}`
            ).then(res => {
                setHistoryData(res.data)
                setLoading(false)
            }).catch(err => {
                console.log(err)
                setLoading(false)
            })
        }
    }, [])

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>📋 Pose History</h2>
                <button onClick={() => navigate('/dashboard')}
                    className="back-btn">
                    ← Back
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : history_data.length === 0 ? (
                <p className="no-data">
                    No history yet! Start doing yoga poses.
                </p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Pose</th>
                            <th>Hold Time</th>
                            <th>Best Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history_data.map((item, i) => (
                            <tr key={i}>
            
                                <td>{new Date(item.date)
.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})}</td>
                                <td>{item.time}</td>
                                <td>{item.pose_name}</td>
                                <td>{item.hold_time >= 60 
    ? `${Math.floor(item.hold_time/60)}m ${item.hold_time%60}s` 
    : `${item.hold_time}s`}
</td>
<td>{item.best_score >= 60 
    ? `${Math.floor(item.best_score/60)}m ${item.best_score%60}s` 
    : `${item.best_score}s`}
</td>
                
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default History