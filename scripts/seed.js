require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const MONGO_URI = process.env.MONGO_URI;

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected.');

    await User.deleteMany({});
    await Restaurant.deleteMany({});
    console.log('Previous data cleared.');

    // Crear restaurante
    const restaurant = await Restaurant.create({
      name: 'Rooster Café',
      address: 'Buenos Aires, Argentina',
      openTime: '10:30',
      closeTime: '22:00',
    });
    console.log(`✅ Restaurant: ${restaurant.name} (${restaurant._id})`);

    const users = [
      { name: 'Amber',         email: 'amber@rooster.com',   password: 'amber123',   role: 'admin',     contractType: 'full-time', skills: ['management'] },
      { name: 'Antonio',       email: 'antonio@rooster.com', password: 'antonio123', role: 'FOH',       contractType: 'full-time', skills: ['bar','coffee','service'] },
      { name: 'PJ',            email: 'pj@rooster.com',      password: 'pj1234',     role: 'FOH',       contractType: 'full-time', skills: ['bar','service'] },
      { name: 'Crystal',       email: 'crystal@rooster.com', password: 'crystal123', role: 'FOH',       contractType: 'full-time', skills: ['service','management'] },
      { name: 'Jane',          email: 'jane@rooster.com',    password: 'jane1234',   role: 'FOH',       contractType: 'part-time', skills: ['service'] },
      { name: 'Pin',           email: 'pin@rooster.com',     password: 'pin1234',    role: 'BOH',       contractType: 'full-time', skills: ['chef','kitchen'] },
      { name: 'Antonio Taiwan',email: 'taiwan@rooster.com',  password: 'taiwan123',  role: 'BOH',       contractType: 'full-time', skills: ['chef','kitchen'] },
      { name: 'Betty',         email: 'betty@rooster.com',   password: 'betty123',   role: 'BOH',       contractType: 'part-time', skills: ['support','kitchen'] },
    ];

    for (const u of users) {
      await User.create({ ...u, restaurantId: restaurant._id });
      console.log(`✅ ${u.name} (${u.role} — ${u.contractType})`);
    }

    console.log('\n🎉 Done! Credentials:');
    users.forEach(u => console.log(`  ${u.name}: ${u.email} / ${u.password}`));
    console.log(`\nRestaurant ID: ${restaurant._id}`);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌', error.message);
    mongoose.connection.close();
  }
};

seedDB();
