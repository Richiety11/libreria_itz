var Libros = require('../models/Libros');

//Definir el crud para la entidad Libros

//Crear libros
exports.create = async function (req, res) {
    console.log(req.body);
    console.log(req.query);
    try {
        var libro = new Libros(req.body);
        await libro.save();
        return res.json(libro);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al crear el libro",
            error: error 
        });
    }
};

//Mostar todos los libros
exports.list = async function (req, res) {
    // await Libros.find.then(function (libros){
    //     return res.json(libros)
    // }).catch(error => {
    //     return res.status(500).json({ 
    //         message: "Error al listar los libros",
    //         error: error 
    //     })
    // })
    try {
        const libros = await Libros.find();
        res.json(libros);
    } catch (error) {
        res.status(500).send(error);
    }
};
//Actualizar un libro}
exports.update = async function (req, res) {
    console.log(req.body);
    console.log(req.params);
    try {
        const libroAct = await Libros.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!libroAct) {
            return res.status(404).json({ message: "No se encontro el libro" });
        }
        return res.json(libroAct);
    } catch (error) {
        return res.status(500).json({ 
            message: "Error al actualizar el libro",
            error: error 
        });
    }
}

//Eliminar un libro
exports.delete = async function (req, res) {
    try {
        const libroElim = await Libros.findByIdAndDelete(req.params.id);
        if (!libroElim) {
            return res.status(404).json({ message: "No se encontro el libro" });
        }
        return res.status(204).json({ message: "Libro eliminado correctamente" });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error al eliminar el libro",
            error: error 
        });
    }
}

//Mostrar un libro por su id
exports.show = async function (req, res) {
    console.log(req.params);
    try {
        const libro = await Libros.findById(req.params.id);
        if (!libro) {
            return res.status(404).json({ message: "No se encontro el libro" });
        }
        return res.json(libro);
    } catch (error) {
        return res.status(500).json({ 
            message: "Error al mostrar el libro",
            error: error 
        });
    }
}