import React, { useState } from 'react';
import { authService } from '../servicios/authServicio';
import { esRolValido } from '../config/rolesConfig';
import './Login.css';

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
      const data = await authService.login(formData);

      if (!esRolValido(data?.usuario?.rol)) {
        await authService.logout();
        setError('Acceso denegado: tu rol no tiene permisos en esta aplicación.');
        return;
      }

      onLoginSuccess(data.usuario);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-overlay">
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