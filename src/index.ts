import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
//import usuarioRoutes from './User/routes/usuario.routes'

//import registerRoutes from './User/routes/register.route';
import usuarioRoutes from './User/routes/usuario.routes';
import loginRoutes from './Login/routes/login.routes';
import cambiarPRoutes from './cambiarPassword/routes/cambiarP.routes'

//import userRoutes from './User/routes/user.route';
//import validateRoutes from './User/routes/checkIfUserExists.route';
//import saveInfomationRoutes from './User/routes/saveInformation.route';
//import userProfileRoutes from './User/routes/profile'; // NUEVA RUTA

import adminProfileRoutes from './Admin/routes/profile'; // NUEVA RUTA
import newsRoutes from './Admin/routes/news.routes'; // ← LÍNEA ACTUALIZADA
//import newsRoutes from './news/routes/newsRoutes';
import shareholderRoute from './lista_accionista/routes/shareholder.routes';
import recoveryPassword from './User/recoveryPassword/route/recoveryRoute';
import resetPassword from './User/recoveryPassword/route/resetPasswordRoute'
//import updatePassword from './User/updatePassword/route/updatePasswordRoute'
import recoveryPasswordAdmin from './Admin/recoveryPassword/route/recoveryRouteAdmin';
// import resetPasswordAdmin from './Admin/recoveryPassword/route/resetPasswordRouteAdmin'
import adminRoutes from './Admin/routes/admin.routes';
import montoContributionRoute from './MontoContribution/routes/MontoContributionRoute';
import paymentContributionRoute from './PaymentContribution/routes/payment.routes';
import notificationRoutes from './news/routes/notificationRoute';
import creditRoutes from './CreditForm/routes/creditRoutes';
import contributionsAdminRoutes from './Admin/routes/contributions.routes';
import financialBalanceRoutes from './FinancialBalance/routes/financialBalanceRoutes';
import institutionalEarningsRoutes from './InstitutionalEarnings/routes/institutionalEarningsRoutes';
import shareholdersRoutes from './AccionistasList/routes/shareholdersRoutes';
import directivaRoutes from './Directiva/routes/directivaRoutes';

import depositoRoutes from './Deposito/routes/depositoRoutes';
import asambleaRoutes from './Asamblea/routes/asambleaRoutes';
import capacitacionesRoutes from './Capacitacion/routes/capacitacionRoutes';
import credencialRoutes from './User/credencial/routes/credencialRoutes';

import cors from 'cors';


const app = express();
app.use(bodyParser.json());
const PORT = 3001;

app.use(cors());

app.use(express.json());

// Ruta Login general
app.use('/api', loginRoutes);

// User
//app.use('/api/register', registerRoutes);
app.use('/api', usuarioRoutes);

//Cambiar contraseña
app.use('/api', cambiarPRoutes);


//app.use('/api/validate', validateRoutes);
//app.use('/api/user', saveInfomationRoutes);
//app.use('/api/user', userProfileRoutes); // NUEVA RUTA PARA PERFIL DE USUARIO
app.use('/api/user', montoContributionRoute);
app.use('/api/user', paymentContributionRoute);
app.use('/api/user', financialBalanceRoutes); // Rutas de balances para usuarios
app.use('/api/user', institutionalEarningsRoutes);
app.use('/api/user', shareholdersRoutes); // Para usuarios
//agregado el 12/06/2025
app.use('/api/user', depositoRoutes);
// agregado el 19/06/2025
app.use('/api', asambleaRoutes);
////////////////////////
app.use('/api', capacitacionesRoutes);

app.use('/api', directivaRoutes);// Rutas de directiva para usuarios

// Notification
app.use('/api/user', notificationRoutes);
// para resetear la contrasena
app.use('/api/user', resetPassword);
// para actualizar la contrasena
//app.use('/api/user', updatePassword);

// Recovery Password for User
app.use('/api/user', recoveryPassword);
//  rest password for user

// Create Shareholder Form 
app.use('/api', shareholderRoute);

// Admin
app.use('/api', adminRoutes);

app.use('/api/admin', adminProfileRoutes); // NUEVA RUTA PARA PERFIL DE ADMIN

app.use('/api/admin', recoveryPasswordAdmin);
app.use('/api/admin', contributionsAdminRoutes);
app.use('/api/admin', directivaRoutes); // Rutas de directiva para admin
app.use('/api', financialBalanceRoutes);
app.use('/api', institutionalEarningsRoutes);
app.use('/api', shareholdersRoutes); // Para admins
// Middleware para servir archivos estáticos (imágenes de noticias)
// app.use('/uploads', express.static('uploads'));
// Middleware para servir archivos estáticos de imágenes
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use('/assets', express.static(path.join(__dirname, '../app/assets')));
//news
app.use('/api/admin', newsRoutes);

// credit
app.use('/api/user', creditRoutes);

// credenciales
app.use('/api/user', credencialRoutes);
app.use('/api/admin', credencialRoutes);

//console.log("¡Hola mundo desde TypeScript!");

app.get('/', (req, res) => {
  res.send('Bienvenido a la API del Banco ANEUPI');
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error en middleware global:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

/*import { seedAdmin } from './Admin/createAdmin/seed';
async function main() {

  // Crear admin automáticamente
  await seedAdmin();

  

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});*/

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});