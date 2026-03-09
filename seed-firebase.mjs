/**
 * Uni-Eats Firebase Seeder
 * Seeds: menu, notifications collections
 * Run: node seed-firebase.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDd_tCdK5IJ0CxP9qtbGTnYFWajXJ7S_aE",
    authDomain: "uni-eats-3142b.firebaseapp.com",
    projectId: "uni-eats-3142b",
    storageBucket: "uni-eats-3142b.firebasestorage.app",
    messagingSenderId: "387541660658",
    appId: "1:387541660658:web:8ad17a12fdb74a4ce2716b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── MENU ITEMS ────────────────────────────────────────────────────────────
const MENU_ITEMS = [
    // BREAKFAST
    { id: 'b1', name: 'Rice and Curry', description: 'Traditional Sri Lankan breakfast rice with dhal and coconut sambol.', price: 450, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.8, reviewCount: 210 },
    { id: 'b2', name: 'Egg Hoppers', description: 'Crispy bowl-shaped pancakes with a soft-cooked egg at the center.', price: 150, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.9, reviewCount: 156 },
    { id: 'b3', name: 'String Hoppers', description: 'Steamed rice flour noodles served with spicy coconut gravy.', price: 200, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.7, reviewCount: 89 },
    { id: 'b4', name: 'Plain Hoppers', description: 'Traditional Sri Lankan bowl-shaped pancakes with crispy edges and a soft center.', price: 80, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.6, reviewCount: 92 },
    // LUNCH
    { id: 'l1', name: 'Spicy Noodles', description: 'Wok-tossed noodles with fresh vegetables and Sri Lankan spices.', price: 550, category: 'Lunch', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.5, reviewCount: 320 },
    { id: 'l2', name: 'Chicken Fried Rice', description: 'Fragrant basmati rice tossed with shredded chicken and eggs.', price: 650, category: 'Lunch', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.6, reviewCount: 410 },
    { id: 'l3', name: 'Yellow Rice Platter', description: 'Ghee-infused yellow rice with cashew nuts and caramelised onions.', price: 750, category: 'Lunch', image: 'https://images.unsplash.com/photo-1596797038558-bc43d14406c1?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.8, reviewCount: 145 },
    { id: 'l4', name: 'Lunch Rice & Curry', description: 'Full meal with 3 veg curries, papadum, and fish/chicken.', price: 550, category: 'Lunch', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.9, reviewCount: 600 },
    // SAVOURY
    { id: 's1', name: 'Egg Rolls', description: 'Crispy deep-fried pancake rolls filled with a spicy egg and potato mixture.', price: 120, category: 'Savoury', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.4, reviewCount: 230 },
    { id: 's2', name: 'Fish Bun', description: 'Soft baked bun with a heart of seasoned fish filling.', price: 100, category: 'Savoury', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.2, reviewCount: 195 },
    { id: 's3', name: 'Classic Hotdog', description: 'Grilled sausage in a soft roll with mustard and ketchup.', price: 250, category: 'Savoury', image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.5, reviewCount: 88 },
    // SWEET
    { id: 'sw1', name: 'Choco Chip Muffin', description: 'Buttery muffin loaded with dark chocolate chips.', price: 180, category: 'Sweet', image: 'https://images.unsplash.com/photo-1587538637146-8a84882c447f?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.7, reviewCount: 112 },
    { id: 'sw2', name: 'Velvet Cupcakes', description: 'Sweet red velvet cupcakes with cream cheese frosting.', price: 150, category: 'Sweet', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.6, reviewCount: 76 },
    // DRINKS
    { id: 'd1', name: 'Coca-Cola', description: 'Classic chilled 250ml glass bottle.', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.9, reviewCount: 1200 },
    { id: 'd2', name: 'Milo', description: 'Bite-sized energy with Nestle Milo chocolate malt drink (180ml).', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80', available: true, rating: 4.8, reviewCount: 450 },
];

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
const NOTIFICATIONS = [
    { id: 'n1', type: 'Promo', title: 'Lunch Special! 🍔', message: 'Get 20% off all burger combos today between 12 PM and 2 PM.', time: '5h ago', read: false, createdAt: new Date() },
    { id: 'n2', type: 'Update', title: 'App Update v2.5', message: 'New features added: Dark mode refinements and performance improvements.', time: '1d ago', read: false, createdAt: new Date() },
    { id: 'n3', type: 'Alert', title: 'Cafeteria Closing Early', message: 'The main cafeteria will be closing at 4 PM today for maintenance.', time: '2d ago', read: true, createdAt: new Date() },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────
async function clearCollection(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletes = snapshot.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
    await Promise.all(deletes);
    console.log(`  🗑️  Cleared existing ${collectionName} (${snapshot.docs.length} docs)`);
}

async function seedCollection(collectionName, items) {
    console.log(`\n📦 Seeding "${collectionName}" collection...`);
    await clearCollection(collectionName);
    for (const item of items) {
        const { id, ...data } = item;
        await setDoc(doc(db, collectionName, id), data);
        console.log(`  ✅ ${item.name || item.title}`);
    }
    console.log(`  ✔️  Done — ${items.length} documents written.`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
console.log('🚀 Uni-Eats Firebase Seeder\n');
console.log('🔗 Project:', firebaseConfig.projectId);

try {
    await seedCollection('menu', MENU_ITEMS);
    await seedCollection('notifications', NOTIFICATIONS);

    console.log('\n🎉 All collections seeded successfully!');
    console.log('\n📋 Collections created:');
    console.log('   ✅ menu          — 15 food items');
    console.log('   ✅ notifications — 3 sample notifications');
    console.log('   ℹ️  orders        — auto-created when students place orders');
    console.log('   ℹ️  users         — auto-created when students sign up');
    console.log('\n✅ Your database is ready for launch!');
} catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    if (err.code === 'permission-denied') {
        console.error('   → Make sure Firestore is in TEST MODE in your Firebase Console.');
        console.error('   → Go to: Firestore → Rules → change "false" to "true" temporarily.');
    }
}

process.exit(0);
