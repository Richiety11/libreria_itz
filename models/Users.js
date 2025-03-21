var mongoose = require('mongoose');

const generateApiKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apikey = '';
    for (let i = 0; i < 15; i++) {
        apikey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return apikey;
}

//Definimos el esquema de la entidad usuarios
const UserSchema = new mongoose.Schema({
    email: { type: String,  required: true, unique: true },
    password: { type: String, required: true },
    api_key: { type: String, required: true, unique: true, default: generateApiKey },
    saldo: { type: Number, default: 5 }
});

// UserSchema.pre('save', function(next) {
//     if (!this.api_key) {
//         this.api_key = generateApiKey();
//     }
//     next();
// });

//Definimos el modelo de la entidad usuarios
const User = mongoose.model('User', UserSchema);

//Exportamos el modelo de la entidad usuarios
module.exports = User;