require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    await User.deleteMany({});
    await Restaurant.deleteMany({});

    // Crear dos restaurantes
    const r1 = await Restaurant.create({
      name: 'Rooster Café — Palermo',
      address: 'Palermo, Buenos Aires',
      openTime: '10:30', closeTime: '22:00',
    });

    const r2 = await Restaurant.create({
      name: 'Rooster Café — Recoleta',
      address: 'Recoleta, Buenos Aires',
      openTime: '10:30', closeTime: '22:00',
    });

    console.log(`✅ Restaurant 1: ${r1.name}`);
    console.log(`✅ Restaurant 2: ${r2.name}`);

    // Superadmin — maneja los dos
    await User.create({
      name: 'Amber',
      email: 'amber@rooster.com',
      password: 'amber123',
      role: 'superadmin',
      contractType: 'full-time',
      skills: ['management'],
      managedRestaurants: [r1._id, r2._id],
    });
    console.log('✅ Superadmin: Amber (manages both restaurants)');

    // Staff del restaurante 1
    const staff1 = [
      { name: 'Antonio',        email: 'antonio@rooster.com',  password: 'antonio123', role: 'FOH', contractType: 'full-time',  skills: ['bar','coffee','service'] },
      { name: 'PJ',             email: 'pj@rooster.com',       password: 'pj1234',     role: 'FOH', contractType: 'full-time',  skills: ['bar','service'] },
      { name: 'Crystal',        email: 'crystal@rooster.com',  password: 'crystal123', role: 'FOH', contractType: 'full-time',  skills: ['service','management'] },
      { name: 'Jane',           email: 'jane@rooster.com',     password: 'jane1234',   role: 'FOH', contractType: 'part-time',  skills: ['service'] },
      { name: 'Pin',            email: 'pin@rooster.com',      password: 'pin1234',    role: 'BOH', contractType: 'full-time',  skills: ['chef','kitchen'] },
      { name: 'Antonio Taiwan', email: 'taiwan@rooster.com',   password: 'taiwan123',  role: 'BOH', contractType: 'full-time',  skills: ['chef','kitchen'] },
      { name: 'Betty',          email: 'betty@rooster.com',    password: 'betty123',   role: 'BOH', contractType: 'part-time',  skills: ['support','kitchen'] },
    ];

    for (const u of staff1) {
      await User.create({ ...u, restaurantId: r1._id });
      console.log(`  ✅ ${u.name} → ${r1.name}`);
    }

    // Staff del restaurante 2 (ejemplo)
    const staff2 = [
      { name: 'Sofia',  email: 'sofia@rooster2.com',  password: 'sofia123',  role: 'FOH', contractType: 'full-time', skills: ['service'] },
      { name: 'Marco',  email: 'marco@rooster2.com',  password: 'marco123',  role: 'BOH', contractType: 'full-time', skills: ['chef'] },
    ];

    for (const u of staff2) {
      await User.create({ ...u, restaurantId: r2._id });
      console.log(`  ✅ ${u.name} → ${r2.name}`);
    }

    console.log('\n🎉 Done!');
    console.log('  Amber: amber@rooster.com / amber123 (superadmin)');
    console.log('  Antonio: antonio@rooster.com / antonio123');
    console.log('  Crystal: crystal@rooster.com / crystal123');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌', error.message);
    mongoose.connection.close();
  }
};

seedDB();
