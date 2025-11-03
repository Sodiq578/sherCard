// src/data/shops.js

let shops = [
  {
    id: 1,
    name: "Burger King",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Burger_King_2020.svg",
    description: "Tez tayyorlanadigan burgerlar",
    menu: [
      {
        id: 1,
        name: "Whopper",
        price: 45000,
        image: "https://static.wikia.nocookie.net/burgerking/images/7/7c/Whopper.png",
      },
      {
        id: 2,
        name: "Cheeseburger",
        price: 35000,
        image: "https://static.wikia.nocookie.net/burgerking/images/2/28/Cheeseburger.png",
      },
    ],
  },
  {
    id: 2,
    name: "KFC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/KFC_logo.svg",
    description: "Mazali tovuq go‘shtli taomlar",
    menu: [
      {
        id: 3,
        name: "Zinger",
        price: 48000,
        image: "https://static.wikia.nocookie.net/kfc/images/9/9e/Zinger.png",
      },
      {
        id: 4,
        name: "BoxMaster",
        price: 52000,
        image: "https://static.wikia.nocookie.net/kfc/images/a/a0/Boxmaster.png",
      },
    ],
  },
  {
    id: 3,
    name: "Domino's Pizza",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Dominos_pizza_logo.svg",
    description: "Issiq va yangi pitsa turlari",
    menu: [
      {
        id: 5,
        name: "Pepperoni",
        price: 68000,
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_pizza.jpg",
      },
      {
        id: 6,
        name: "Cheese Lava",
        price: 72000,
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Cheese_pizza.jpg",
      },
    ],
  },
  {
    id: 4,
    name: "Coca-Cola",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Coca-Cola_logo.svg",
    description: "Dunyo bo‘ylab mashhur ichimlik",
    menu: [
      {
        id: 7,
        name: "Coca-Cola 1L",
        price: 12000,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Coca-Cola_bottle_1L.jpg",
      },
      {
        id: 8,
        name: "Coca-Cola 0.5L",
        price: 8000,
        image: "https://upload.wikimedia.org/wikipedia/commons/2/27/Coca-Cola_0.5L.jpg",
      },
    ],
  },
  {
    id: 5,
    name: "Starbucks",
    logo: "https://upload.wikimedia.org/wikipedia/sco/4/45/Starbucks_Coffee_Logo.svg",
    description: "Kofe va shirinliklar",
    menu: [
      {
        id: 9,
        name: "Latte",
        price: 40000,
        image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Caff%C3%A8_Latte_at_Sightglass_Coffee.jpg",
      },
      {
        id: 10,
        name: "Cappuccino",
        price: 42000,
        image: "https://upload.wikimedia.org/wikipedia/commons/4/45/Cappuccino_Chiang_Mai.jpg",
      },
    ],
  },
  {
    id: 6,
    name: "Subway",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Subway_2016_logo.svg",
    description: "Yangi sabzavotli sendvichlar",
    menu: [
      {
        id: 11,
        name: "Chicken Teriyaki",
        price: 46000,
        image: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Subway_Teriyaki_Chicken_Sandwich.jpg",
      },
      {
        id: 12,
        name: "Tuna",
        price: 42000,
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Subway_tuna_sandwich.jpg",
      },
    ],
  },
  {
    id: 7,
    name: "Local Pizza",
    logo: "https://picsum.photos/seed/pizza/200/300",
    description: "Mahalliy ta’mli pitsa",
    menu: [
      {
        id: 13,
        name: "Margherita",
        price: 60000,
        image: "https://picsum.photos/seed/margherita/400/300",
      },
      {
        id: 14,
        name: "Four Cheese",
        price: 68000,
        image: "https://picsum.photos/seed/fourcheese/400/300",
      },
    ],
  },
  {
    id: 8,
    name: "Fast Food Point",
    logo: "https://picsum.photos/seed/fastfood/200/300",
    description: "Turli xil fast-food taomlar",
    menu: [
      {
        id: 15,
        name: "Hotdog",
        price: 25000,
        image: "https://picsum.photos/seed/hotdog/400/300",
      },
      {
        id: 16,
        name: "French Fries",
        price: 15000,
        image: "https://picsum.photos/seed/fries/400/300",
      },
    ],
  },
  {
    id: 9,
    name: "Juice Bar",
    logo: "https://picsum.photos/seed/juice/200/300",
    description: "Tabiiy sharbatlar va smuzilar",
    menu: [
      {
        id: 17,
        name: "Orange Juice",
        price: 18000,
        image: "https://picsum.photos/seed/orange/400/300",
      },
      {
        id: 18,
        name: "Strawberry Smoothie",
        price: 22000,
        image: "https://picsum.photos/seed/strawberry/400/300",
      },
    ],
  },
];

// === DO‘KONLARNI OLISH ===
export const getShops = () => {
  const stored = localStorage.getItem("shopsData");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : shops;
    } catch (e) {
      console.error("shopsData o‘qishda xato:", e);
    }
  }
  return shops;
};

// === DO‘KONLARNI SAQLASH ===
export const saveShops = (updatedShops) => {
  if (!Array.isArray(updatedShops)) {
    console.error("saveShops: Ma'lumotlar array bo‘lishi kerak!");
    return;
  }

  const sanitized = updatedShops.map((shop) => ({
    ...shop,
    id: shop.id || Date.now(),
    name: shop.name?.trim() || "Noma'lum",
    logo: shop.logo?.trim() || "https://picsum.photos/seed/default/200/300",
    description: shop.description?.trim() || "",
    menu: Array.isArray(shop.menu)
      ? shop.menu.map((item) => ({
          ...item,
          id: item.id || Date.now(),
          name: item.name?.trim() || "Noma'lum",
          price: parseInt(item.price) || 0,
          image:
            item.image?.trim() ||
            "https://picsum.photos/seed/defaultmenu/400/300",
        }))
      : [],
  }));

  localStorage.setItem("shopsData", JSON.stringify(sanitized));
  console.log("Do‘konlar saqlandi:", sanitized);
};
