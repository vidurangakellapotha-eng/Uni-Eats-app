
import { MenuItem, OrderStatus, Order, PaymentMethod } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // BREAKFAST
  {
    id: 'b1',
    name: 'Rice and Curry',
    description: 'Traditional Sri Lankan breakfast rice with dhal and coconut sambol.',
    price: 450,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.8,
    reviewCount: 210
  },
  {
    id: 'b2',
    name: 'Egg Hoppers',
    description: 'Crispy bowl-shaped pancakes with a soft-cooked egg at the center.',
    price: 150,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.9,
    reviewCount: 156
  },
  {
    id: 'b4',
    name: 'Plain Hoppers',
    description: 'Traditional Sri Lankan bowl-shaped pancakes with crispy edges and a soft center.',
    price: 80,
    category: 'Breakfast',
    image: 'https://www.theflavorbender.com/wp-content/uploads/2018/02/Sri-Lankan-Hoppers-Appam-The-Flavor-Bender-1-4.jpg',
    available: true,
    rating: 4.6,
    reviewCount: 92
  },
  {
    id: 'b3',
    name: 'String Hoppers',
    description: 'Steamed rice flour noodles served with spicy coconut gravy.',
    price: 200,
    category: 'Breakfast',
    image: 'https://1.bp.blogspot.com/-_6U0eM-w8_8/Xh_6U0eM-w8/AAAAAAAAF6U/_6U0eM-w8_8V-w8_8w8_8w8_8w8_8w8_8w8_8Aw/s1600/Sri%2BLankan%2BString%2BHoppers.jpg',
    available: true,
    rating: 4.7,
    reviewCount: 89
  },

  // LUNCH
  {
    id: 'l1',
    name: 'Spicy Noodles',
    description: 'Wok-tossed noodles with fresh vegetables and Sri Lankan spices.',
    price: 550,
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.5,
    reviewCount: 320
  },
  {
    id: 'l2',
    name: 'Chicken Fried Rice',
    description: 'Fragrant basmati rice tossed with shredded chicken and eggs.',
    price: 650,
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.6,
    reviewCount: 410
  },
  {
    id: 'l3',
    name: 'Yellow Rice Platter',
    description: 'Ghee-infused yellow rice with cashew nuts and caramelised onions.',
    price: 750,
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1596797038558-bc43d14406c1?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.8,
    reviewCount: 145
  },
  {
    id: 'l4',
    name: 'Lunch Rice & Curry',
    description: 'Full meal with 3 veg curries, papadum, and fish/chicken.',
    price: 550,
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.9,
    reviewCount: 600
  },

  // SAVOURY
  {
    id: 's1',
    name: 'Egg Rolls',
    description: 'Crispy deep-fried pancake rolls filled with a spicy egg and potato mixture.',
    price: 120,
    category: 'Savoury',
    image: 'https://3.bp.blogspot.com/-_G0g_6f0f-8/WA5-w8-w8-I/AAAAAAAAA-w/R-C9G_hA59-w8-w8-w8AAAA/s1600/Egg%2BRolls.jpg',
    available: true,
    rating: 4.4,
    reviewCount: 230
  },
  {
    id: 's2',
    name: 'Fish Bun',
    description: 'Soft baked bun with a heart of seasoned fish filling.',
    price: 100,
    category: 'Savoury',
    image: 'https://www.islandsmile.org/wp-content/uploads/2016/11/malu-paansri-lankan-fish-bun11-1.jpg',
    available: true,
    rating: 4.2,
    reviewCount: 195
  },
  {
    id: 's3',
    name: 'Classic Hotdog',
    description: 'Grilled sausage in a soft roll with mustard and ketchup.',
    price: 250,
    category: 'Savoury',
    image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.5,
    reviewCount: 88
  },

  // SWEET
  {
    id: 'sw1',
    name: 'Choco Chip Muffin',
    description: 'Buttery muffin loaded with dark chocolate chips.',
    price: 180,
    category: 'Sweet',
    image: 'https://images.unsplash.com/photo-1587538637146-8a84882c447f?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.7,
    reviewCount: 112
  },
  {
    id: 'sw2',
    name: 'Velvet Cupcakes',
    description: 'Sweet red velvet cupcakes with cream cheese frosting.',
    price: 150,
    category: 'Sweet',
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.6,
    reviewCount: 76
  },

  // DRINKS
  {
    id: 'd1',
    name: 'Coca-Cola',
    description: 'Classic chilled 250ml glass bottle.',
    price: 150,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    available: true,
    rating: 4.9,
    reviewCount: 1200
  },
  {
    id: 'd2',
    name: 'Milo',
    description: 'Bite-sized energy with Nestle Milo chocolate malt drink (180ml).',
    price: 150,
    category: 'Drinks',
    image: 'https://glomark.lk/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/7/6/7613034944444.jpg',
    available: true,
    rating: 4.8,
    reviewCount: 450
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2941',
    userId: 'STU12345',
    userName: 'John Doe',
    userType: 'Student',
    items: [
      { menuItemId: 's2', name: 'Fish Bun', quantity: 2, price: 100 },
      { menuItemId: 'd1', name: 'Coca-Cola', quantity: 1, price: 150 }
    ],
    total: 350,
    status: OrderStatus.PLACED,
    // Fix: Added missing required property 'paymentMethod'
    paymentMethod: PaymentMethod.CREDITS,
    timestamp: '10:42 AM'
  }
];