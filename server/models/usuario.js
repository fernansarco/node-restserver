const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};


let usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre del usuario es obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El Email del usuario es obligatorio'] },
    password: { type: String, required: [true, 'El password del usuario es obligatorio'] },
    img: { type: String, required: false },
    role: { type: String, default: 'USER_ROLE', enum: rolesValidos },
    estado: { type: Boolean, default: true, required: [true, 'El estado del usuario es obligatorio'] },
    google: { type: Boolean, default: false, },
});

//función para no mostrar el password por patalla
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}


usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);