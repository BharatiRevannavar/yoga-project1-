import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate} from 'react-router-dom'
import './Register.css'

function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        height: '', weight: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            await axios.post(
                'http://localhost:5000/api/auth/register',
                form
            )
            setSuccess('Registered successfully!')
            setTimeout(() => navigate('/login'), 2000)
        } catch(err) {
            setError('Registration failed!')
        }
    }

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>🧘 Yoga Pose Detection</h2>
                <h3>Register</h3>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <form onSubmit={handleRegister}>
                    <input
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="height"
                        type="number"
                        step="0.01"
                        placeholder="Height (m) e.g. 1.6"
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="weight"
                        type="number"
                        placeholder="Weight (kg) e.g. 70"
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Register</button>
                </form>
                <p>Already have account?
                    <span onClick={() => navigate('/login')}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Register