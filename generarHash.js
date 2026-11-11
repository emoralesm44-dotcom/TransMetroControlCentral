import bcrypt from 'bcrypt';

async function generarHash() {
    const password = 'MiPassword123';

    const hash = await bcrypt.hash(password, 10);

    console.log('Contraseña:', password);
    console.log('Hash generado:', hash);
}

generarHash();


// MiPassword123