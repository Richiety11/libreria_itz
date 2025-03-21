//Importamos la librería de sqlite3
const sqlite3 = require('sqlite3').verbose();

//Creamos una base de datos en memoria
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Conexión a la base de datos sql exitosa.');
});

db.serialize(() => {
    //Creamos la tabla de usuarios
    db.run
    db.run(`CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)`);
    //Insertamos un usuario
    db.run(`INSERT INTO users(username, password) VALUES('admin', 'admin123')`);
    db.run(`INSERT INTO users(username, password) VALUES('user', 'user123')`);
});

//Exportamos la base de datos
module.exports = db;