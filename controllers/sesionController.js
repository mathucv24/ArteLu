import bycrypt from 'bcryptjs';
import Usuario from '../models/usuario.js';
import jwt from 'jsonwebtoken';
import Pago from '../models/pago.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,            
  secure: true,         
  auth: {
    type: 'OAuth2',
    user: 'arteluaerial@gmail.com',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  },
  family: 4,            
  connectionTimeout: 10000, 
  greetingTimeout: 5000     
});

const registrarUsuario = async (req, res) => {
    try {

        const { nombre, telefono, email, password, repassword } = req.body;

        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        if (!telefono) {
            return res.status(400).json({ mensaje: 'El telefono es obligatorio' });
        }

        if (!email) {
            return res.status(400).json({ mensaje: 'El correo es obligatorio' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }

        if (password !== repassword) {
            return res.status(400).json({ mensaje: 'Las contraseñas no coinciden' });
        }

        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
        }

        const passwordEncriptado = await bycrypt.hash(password, 10);

        const codigo = Math.floor(100000 + Math.random() * 900000);

        const nuevoUsuario = {
            nombre,
            telefono,
            email,
            password: passwordEncriptado,
            verificado: false,
            codigoVerificacion: codigo
        };

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #efefdc; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                
                <div style="background-color: #52054d; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin-top: 10px; font-size: 36px; font-weight: bold;">
                        ArteLu
                    </h1>
                    <h2 style="color: #ffffff; margin-top: 10px; font-size: 24px;">Academia de Deportes Aéreos</h2>
                </div>

                <div style="padding: 40px 30px; text-align: center; color: #333333;">
                    <h2 style="color: #2f328a; margin-bottom: 20px;">¡Verifica tu cuenta!</h2>
                    
                    <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
                        Hola <strong>${nombre}</strong>, estamos felices de tenerte aquí. 
                        Usa el siguiente código para completar tu registro:
                    </p>

                    <div style="margin: 30px 0;">
                        <div style="
                            display: inline-block;
                            background-color: #f3f4f6;
                            border: 2px dashed #52054d;
                            color: #52054d;
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 20px 40px;
                            border-radius: 8px;
                        ">
                            ${codigo}
                        </div>
                    </div>

                    <p style="
                        font-family: 'Times New Roman', serif;
                        font-style: italic;
                        font-size: 22px;
                        color: #ab5b9f;
                        margin-top: 30px;
                        font-weight: bold;
                    ">
                        "¡Gracias por atreverte a volar!"
                    </p>
                </div>

                <div style="background-color: #d9d9d9; padding: 20px; text-align: center; font-size: 12px; color: #666666;">
                    <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
                    <p>&copy; ${new Date().getFullYear()} ArteLu Academia. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>`;

        await Usuario.create(nuevoUsuario);

        await transporter.sendMail({
            from: '"ArteLu Academia de Deportes Aereos" <arteluaerial@gmail.com>',
            to: email,
            subject: "Código de Verificación - ArteLu",
            text: `<b>Tu código de verificación es: ${codigo}. Gracias por atreverte a volar!`,
            html: htmlContent
        });

        return res.status(201).json({
            mensaje: 'Código enviado a su correo',
            requiereVerificacion: true,
            email: email
        });


    } catch (error) {
        console.error("ERROR EN REGISTRO:", error);
        return res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalles: error.message
        });
    }
};

const verificarUsuario = async (req, res) => {
    try {
        const { email, codigo } = req.body;

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        if (usuario.codigoVerificacion == codigo) {
            usuario.verificado = true;
            usuario.codigoVerificacion = null;
            await usuario.save();

            return res.status(200).json({ mensaje: 'Cuenta verificada exitosamente' });
        } else {
            return res.status(400).json({ mensaje: 'Código incorrecto' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al verificar' });
    }
};

const iniciarSesion = async (req, res) => {

    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ 
            mensaje: 'El correo es obligatorio'
        });
    }

    if (!password) {
        return res.status(400).json({ 
            mensaje: 'La contraseña es obligatoria'
        });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        return res.status(404).json({ 
            mensaje: 'No existe un usuario con ese correo'
        });
    }

    if (usuario.activo === false) {
        return res.status(403).json({ 
            mensaje: 'Usuario inactivo. Por favor comunicarse con administración.' 
        });
    }

    const passwordEncriptado = usuario.password;

    const estaValidado = await bycrypt.compare(password, passwordEncriptado);

    if (!estaValidado) {
        return res.status(401).json({ 
            mensaje: 'Las credenciales son incorrectas'
        });
    }

    const userToken = jwt.sign(
        {
            id: usuario._id,
            email: usuario.email,
            rol: usuario.rol
        },
        process.env.JWT_SECRET || 'secret',
        {
            expiresIn: '3600000'
        },
    );

    res.cookie('userToken', userToken, {
        httpOnly: true,
        maxAge: 3600000,
    });

    res.json({
        mensaje: 'Se ha iniciado sesion correctamente',
        token: userToken,
        rol: usuario.rol 
    });
}

const actualizarPerfil = async (req, res) => {

    try {
        const {
            nombre,
            telefono,
            lesiones,
            fecha_nacimiento_ppal,
            rol_user,
            alumno,
            fecha_nacimiento_alumno,
            edad
        } = req.body;

        const token = req.cookies.userToken;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuarioId = decoded.id;

        await Usuario.findByIdAndUpdate(
            usuarioId,
            {
                nombre,
                telefono,
                lesiones,
                fecha_nacimiento_ppal,
                rol_user,
                alumno,
                fecha_nacimiento_alumno,
                edad
            }
        );

        res.status(200).json({ mensaje: 'Perfil actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};


const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

const obtenerDetalleUsuarioAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

        const pagos = await Pago.find({ usuario: id });

        res.json({ usuario, pagos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener detalles" });
    }
};

const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body; 

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id, 
            { activo: activo }, 
            { new: true } 
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ 
            mensaje: "Estado actualizado correctamente", 
            usuario: usuarioActualizado 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al cambiar estado" });
    }
};

const solicitarRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'No existe un usuario con este correo.' });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        usuario.codigoRecuperacion = codigo;
        await usuario.save();

        await transporter.sendMail({
            from: '"ArteLu Academia de Deportes Aereos" <arteluaerial@gmail.com>',
            to: email,
            subject: "Recuperación de Contraseña - ArteLu",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Recupera tu acceso</h2>
                    <p>Usa el siguiente código para restablecer tu contraseña:</p>
                    <h1 style="color: #52054d; letter-spacing: 5px;">${codigo}</h1>
                    <p>Si no solicitaste esto, ignora este mensaje.</p>
                </div>
            `
        });

        res.json({ mensaje: 'Código enviado a tu correo.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al enviar el correo.' });
    }
};

const restablecerPassword = async (req, res) => {
    try {
        const { email, codigo, newPassword } = req.body;

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        if (usuario.codigoRecuperacion !== codigo) {
            return res.status(400).json({ mensaje: 'El código es incorrecto.' });
        }

        const passwordEncriptado = await bycrypt.hash(newPassword, 10);

        usuario.password = passwordEncriptado;
        usuario.codigoRecuperacion = null; 
        await usuario.save();

        res.json({ mensaje: 'Contraseña restablecida exitosamente.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar contraseña.' });
    }
};

export {
    registrarUsuario,
    verificarUsuario,
    iniciarSesion,
    actualizarPerfil,
    obtenerTodosLosUsuarios,
    obtenerDetalleUsuarioAdmin,
    cambiarEstadoUsuario,
    solicitarRecuperacion,
    restablecerPassword
};