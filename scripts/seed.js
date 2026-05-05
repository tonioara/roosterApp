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

    // ✅ Restaurante real
    const r1 = await Restaurant.create({
      name: 'TheRabbit Restaurant',
      address: '',
      openTime: '10:30',
      closeTime: '22:00',
    });
    console.log(`✅ Restaurant: ${r1.name} (${r1._id})`);

    // ✅ Amber — superadmin con ese restaurante
    await User.create({
      name: 'Amber',
      email: 'amber@rooster.com',
      password: 'amber123',
      role: 'superadmin',
      contractType: 'full-time',
      skills: ['management'],
      managedRestaurants: [r1._id],
      restaurantId: null,
    });
    console.log('✅ Superadmin: Amber');

    // ✅ Staff del restaurante
    const staff = [
      { name: 'Antonio',        email: 'antonio@rooster.com',  password: 'antonio123', role: 'FOH', contractType: 'full-time',  skills: ['bar','coffee','service'] },
      { name: 'PJ',             email: 'pj@rooster.com',       password: 'pj1234',     role: 'FOH', contractType: 'full-time',  skills: ['bar','service'] },
      { name: 'Crystal',        email: 'crystal@rooster.com',  password: 'crystal123', role: 'FOH', contractType: 'full-time',  skills: ['service','management'] },
      { name: 'Jane',           email: 'jane@rooster.com',     password: 'jane1234',   role: 'FOH', contractType: 'part-time',  skills: ['service'] },
      { name: 'Pin',            email: 'pin@rooster.com',      password: 'pin1234',    role: 'BOH', contractType: 'full-time',  skills: ['chef','kitchen'] },
      { name: 'Antonio Taiwan', email: 'taiwan@rooster.com',   password: 'taiwan123',  role: 'BOH', contractType: 'full-time',  skills: ['chef','kitchen'] },
      { name: 'Betty',          email: 'betty@rooster.com',    password: 'betty123',   role: 'BOH', contractType: 'part-time',  skills: ['support','kitchen'] },
    ];

    for (const u of staff) {
      await User.create({ ...u, restaurantId: r1._id });
      console.log(`  ✅ ${u.name}`);
    }

    console.log('\n🎉 Done!');
    console.log('  amber@rooster.com / amber123 → selector de restaurantes');
    console.log('  crystal@rooster.com / crystal123 → TheRabbit Restaurant');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌', error.message);
    mongoose.connection.close();
  }
};

seedDB();
