import React from 'react'
import { BrowserRouter as Router, 
Route, Routes, Navigate } 
from 'react-router-dom'

import Yoga from './pages/Yoga/Yoga'
import Tutorials from './pages/Tutorials/Tutorials'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import History from './pages/History/History'
import './App.css'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if(!token) {
    return <Navigate to="/login" />
  }
  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/start' element={
          <ProtectedRoute><Yoga /></ProtectedRoute>
        }/>
        <Route path='/tutorials' element={
          <ProtectedRoute><Tutorials /></ProtectedRoute>
        }/>
        <Route path='/dashboard' element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        }/>
        <Route path='/history' element={
          <ProtectedRoute><History /></ProtectedRoute>
        }/>
      </Routes>
    </Router>
  )
}