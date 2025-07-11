require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('../src/models/model-offer');

const offers = [
    {
    from: "BER",
    to: "AMS",
    departDate: new Date("2025-08-05"),
    returnDate: new Date("2025-08-12"),
    provider: "KLM",
    price: 180.00,
    currency: "EUR",
    legs: [
      { flightNum: "KL1820", dep: "BER", arr: "AMS", duration: 90 }
    ],
    hotel: { name: "Canal View Hotel", nights: 7, price: 750 },
    activity: { title: "Croisière sur les canaux", price: 60 }
  },
  {
    from: "BER",
    to: "AMS",
    departDate: new Date("2025-10-01"),
    returnDate: new Date("2025-10-06"),
    provider: "EasyJet",
    price: 95.00,
    currency: "EUR",
    legs: [
      { flightNum: "EJU4593", dep: "BER", arr: "AMS", duration: 95 }
    ],
    hotel: { name: "Hostel Jordaan", nights: 5, price: 320 }
  },
  {
    from: "VIE",
    to: "LIS",
    departDate: new Date("2025-09-10"),
    returnDate: new Date("2025-09-20"),
    provider: "TAP Air Portugal",
    price: 240.00,
    currency: "EUR",
    legs: [
      { flightNum: "TP1279", dep: "VIE", arr: "LIS", duration: 195 }
    ],
    hotel: { name: "Lisbon Atlantic Hotel", nights: 10, price: 880 },
    activity: { title: "Tour de Belém + Tram 28", price: 70 }
  },
  {
    from: "CHI",
    to: "SEL",
    departDate: new Date("2025-07-20"),
    returnDate: new Date("2025-07-30"),
    provider: "Korean Air",
    price: 860.00,
    currency: "USD",
    legs: [
      { flightNum: "KE38", dep: "ORD", arr: "ICN", duration: 840 }
    ],
    hotel: { name: "Gangnam Sky Hotel", nights: 10, price: 950 },
    activity: { title: "Palais Gyeongbokgung + K-Pop Tour", price: 150 }
  },
  {
    from: "CHI",
    to: "SEL",
    departDate: new Date("2025-11-01"),
    returnDate: new Date("2025-11-10"),
    provider: "Asiana Airlines",
    price: 820.00,
    currency: "USD",
    legs: [
      { flightNum: "OZ235", dep: "ORD", arr: "ICN", duration: 830 }
    ],
    hotel: { name: "Seoul City Center Hotel", nights: 9, price: 870 }
  },
  {
    from: "SEL",
    to: "VIE",
    departDate: new Date("2025-10-05"),
    returnDate: new Date("2025-10-15"),
    provider: "Austrian Airlines",
    price: 790.00,
    currency: "EUR",
    legs: [
      { flightNum: "OS64", dep: "ICN", arr: "VIE", duration: 800 }
    ],
    hotel: { name: "Vienna Grand Palace Hotel", nights: 10, price: 980 },
    activity: { title: "Concert de Mozart + châteaux", price: 180 }
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );
    
    console.log('MongoDB connecté');
    
    const currentCount = await Offer.countDocuments();
    console.log(`Offres actuelles: ${currentCount}`);
    
    const deleted = await Offer.deleteMany({});
    console.log(`${deleted.deletedCount} offres supprimées`);
    
    const inserted = await Offer.insertMany(offers);
    console.log(`${inserted.length} nouvelles offres insérées`);
    
    const newCount = await Offer.countDocuments();
    console.log(`Total final: ${newCount} offres`);
    
    const stats = await Offer.aggregate([
      {
        $group: {
          _id: { from: "$from", to: "$to" },
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    stats.forEach(stat => {
      console.log(`  ${stat._id.from} → ${stat._id.to}: ${stat.count} offres (${Math.round(stat.avgPrice)}€ en moyenne)`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Connexion fermée');
  }
}

seedDatabase();