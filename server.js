const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/roster',      require('./routes/rosterRoutes'));
app.use('/api/requests',    require('./routes/requestRoutes'));
app.use('/api/shifts',      require('./routes/shiftRoutes'));
app.use('/api/push',        require('./routes/pushRoutes'));
app.use('/api/schedule',    require('./routes/scheduleRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));

app.get('/', (req, res) => res.json({ status: 'success', message: 'RoosterApp API — Multi-restaurant' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
