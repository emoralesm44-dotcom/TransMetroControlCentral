import React, { useState } from "react";
import "./Login.css";
import bgImage from "../public/Fondo.png";

export const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ nombre_usuario: '', contrasenia: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error de acceso.');
      }

      onLoginSuccess(data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="login-overlay" 
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${bgImage})`
      }}
    >
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Transmetro</h1>
          <p className="login-subtitle">Centro de Control Operativo</p>
        </div>

        {error && <div className="login-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Usuario de Sistema</label>
            <input
              type="text"
              name="nombre_usuario"
              placeholder="Ej. admin"
              value={formData.nombre_usuario}
              onChange={handleChange}
              required
              autoComplete="off"
              className="login-input"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Contraseña</label>
            <input
              type="password"
              name="contrasenia"
              placeholder="••••••••"
              value={formData.contrasenia}
              onChange={handleChange}
              required
              className="login-input"
            />
          </div>

          <button type="submit" disabled={cargando} className="login-button">
            {cargando ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="login-footer">
          <span>Sistema de Gestión de Transporte Público</span>
        </div>
      </div>
    </div>
  );
};