import React, { useState } from 'react';
import { authService } from '../servicios/authServicio';
import { esRolValido } from '../config/rolesConfig';
import fondoImg from '../public/Fondo.png';
import './Login.css';

export const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ nombre_usuario: '', contrasenia: '' });
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
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
    <div
      className="login-overlay"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${fondoImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
            <div className="login-password-wrapper">
              <input
                type={mostrarContrasenia ? 'text' : 'password'}
                name="contrasenia"
                placeholder="••••••••"
                value={formData.contrasenia}
                onChange={handleChange}
                required
                className="login-input login-input-password"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                className="login-toggle-password"
                aria-label="Mostrar u ocultar contraseña"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  {mostrarContrasenia && <line x1="2" y1="2" x2="22" y2="22" />}
                </svg>
              </button>
            </div>
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