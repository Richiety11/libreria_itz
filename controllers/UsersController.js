//funcion para autenticar usuarios NO SQL
var User = require('../models/Users');

//Importamos jsonwebtoken
const jwt = require('jsonwebtoken');

exports.authenticate = async function(email, api_key) {
    if(typeof email !== 'string' || typeof api_key !== 'string') {
        console.log("Intento de nosql injection");
        return res.status(500).json({ message: "Intento de nosql injection" });
    }
    let user = await User.findOne({ email, api_key });
    if(!user) {
        return res.status(404).json({ message: "Api Key no valida" });
    }
    if(user.saldo <= 0) {
        return res.status(404).json({ message: "Saldo insuficiente" });
    }

    //Si la autenticacion es exitosa, generamos un token
    const token = jwt.sign({ email, api_key }, 'tu-palabra-secreta', { expiresIn: '1h' });

    //
    return {token, message: "El token sera valido por 1 hora"};
}

exports.create = async function(req, res) {
    //Para que el api funcione y reciba el request desde el body o la query
    if(Object.keys(req.query).length > 0) {
        request = req.query;
    }else if(Object.keys(req.body).length > 0) {
        request = req.body;
    }
    //Validamos los campos obligatorios
    if(!request.email || !request.password) {
        return res.status(400).json({ message: "Los campos email y password son obligatorios" });
    }
    try {
        //Verificamos si el email ya existe en la bd
        const existinguser = await User.findOne({ email: request.email });
        if(existinguser) {
            return res.status(400).json({ message: "El email ya esta registrado" });
        }
        //Creamos y guardamos el nuevo usuario
        const user = new User(request);
        await user.save();
        return res.json({user, message: "Usuario creado con exito"});
    } catch (error) {
        return res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
}

exports.updateUser = async function(req, res) {
    const token = req.headers = ('Authorization');
    console.log('token' + token);
    const decodedToken = jwt.verify(token, 'tu-palabra-secreta');
    console.log(decodedToken);

    //Obtener el usuario
    const user = await User.findOne({ api_key: decodedToken.api_key });
    //Verificar si el usuario existe
    if(!user) {
        return res.status(404).json({ message: "El usuario no encontrado" });
    }
    //Actualizar el saldo si encuentra el usuario
    user.saldo = user.saldo - 1;
    await user.save();

    return res.json({user, message: "Peticion exitosa, saldo actualizado"});
}