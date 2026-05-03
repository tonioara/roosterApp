const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/shifts', require('./routes/shiftRoutes'));

app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/requests', require('./routes/requestRoutes')); // Agrega esta línea
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roster', require('./routes/rosterRoutes'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
