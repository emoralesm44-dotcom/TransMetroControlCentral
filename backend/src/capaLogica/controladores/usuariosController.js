const usuarioLogica = require('../servicios/usuariosServicio');

const listar = async (req, res) => {
  try {
    const lista = await usuarioLogica.obtenerTodos();
    res.json({ usuarios: lista });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al obtener los usuarios.' });
  }
};

const crear = async (req, res) => {
  try {
    const nuevo = await usuarioLogica.registrar(req.body);
    res.status(201).json({ mensaje: 'Usuario creado correctamente.', usuario: nuevo });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al crear el usuario.' });
  }
};

const actualizar = async (req, res) => {
  try {
    const actualizado = await usuarioLogica.editar(req.params.id, req.body);
    res.json({ mensaje: 'Usuario actualizado.', usuario: actualizado });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al actualizar el usuario.' });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const idActual = req.usuario?.id_usuario;
    const actualizado = await usuarioLogica.cambiarEstado(req.params.id, req.body.activo, idActual);
    res.json({ mensaje: 'Estado actualizado.', usuario: actualizado });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al cambiar estado.' });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  actualizarEstado,
};