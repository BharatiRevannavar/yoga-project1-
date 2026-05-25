import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/login',
                { email, password }
            )
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', 
                JSON.stringify(res.data.user))
            navigate('/dashboard')
        } catch(err) {
            setError('Invalid email or password!')
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>🧘 Yoga Pose Detection</h2>
                <h3>Login</h3>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p>Don't have account? 
                    <span onClick={() => navigate('/register')}>
                        Register
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Login