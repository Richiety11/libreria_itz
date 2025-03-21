const jwt = require('jsonwebtoken');

var Users = require('./models/Users');

const authJWT = async (req, res, next) => {
    const token = req.header('Authorization');
    console.log('token' + token);
    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
        //return res.json({ message: 'Hola desde el middleware de users' });
    }try {
        const user = await jwt.verify(token, 'tu-palabra-secreta');
        console.log(user.api_key);
        const usuario = await Users.findOne({ api_key: user.api_key });
        if (!usuario) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        if (usuario.saldo <= 0) {
            return res.status(401).json({ message: 'Saldo insuficiente' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({ error: error.message});
    }
}

module.exports = authJWT;