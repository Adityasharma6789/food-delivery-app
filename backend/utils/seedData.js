export const seedFoods = [
  // Burgers
  {
    name: "Classic Cheeseburger",
    description: "Flame-grilled premium beef patty, melted cheddar cheese, crisp lettuce, vine-ripened tomatoes, pickles, and our signature Swift sauce on a toasted brioche bun.",
    price: 199.00,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    category: "Burgers",
    restaurant: "Burger Bistro",
    rating: 4.8,
    isVeg: false
  },
  {
    name: "Spicy Crispy Chicken Burger",
    description: "Crispy fried chicken breast dipped in hot buffalo glaze, creamy coleslaw, jalapeños, and spicy chipotle aioli on a toasted sesame bun.",
    price: 249.00,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&q=80&w=800",
    category: "Burgers",
    restaurant: "Burger Bistro",
    rating: 4.6,
    isVeg: false
  },
  {
    name: "Smoky BBQ Bacon Burger",
    description: "Prime beef patty, crispy applewood smoked bacon, caramelized onions, Swiss cheese, and smoky hickory BBQ sauce.",
    price: 299.00,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=800",
    category: "Burgers",
    restaurant: "Burger Bistro",
    rating: 4.7,
    isVeg: false
  },
  {
    name: "Ultimate Garden Burger",
    description: "A grilled plant-based patty, sliced avocado, alfalfa sprouts, red onion, tomatoes, and garlic herb spread on a whole wheat bun.",
    price: 229.00,
    image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=800",
    category: "Burgers",
    restaurant: "Burger Bistro",
    rating: 4.5,
    isVeg: true
  },

  // Pizzas
  {
    name: "Margherita Supreme",
    description: "Authentic Neapolitan crust, rich San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves, and a drizzle of extra virgin olive oil.",
    price: 349.00,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800",
    category: "Pizzas",
    restaurant: "Pizzeria Italia",
    rating: 4.9,
    isVeg: true
  },
  {
    name: "Pepperoni Overload",
    description: "Double portion of spicy pepperoni slices, mozzarella cheese, and Italian herbs on a thin and crispy crust.",
    price: 449.00,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800",
    category: "Pizzas",
    restaurant: "Pizzeria Italia",
    rating: 4.8,
    isVeg: false
  },
  {
    name: "Truffle Mushroom Pizza",
    description: "White sauce pizza with wild forest mushrooms, roasted garlic, fontina cheese, fresh arugula, and premium truffle oil.",
    price: 499.00,
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=800",
    category: "Pizzas",
    restaurant: "Pizzeria Italia",
    rating: 4.7,
    isVeg: true
  },

  // Sushi
  {
    name: "Premium Salmon Roll",
    description: "Fresh Atlantic salmon, creamy avocado, cucumber, wrapped in seasoned sushi rice and seaweed, topped with spicy mayo and toasted sesame seeds.",
    price: 499.00,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
    category: "Sushi",
    restaurant: "Tokyo Sushi",
    rating: 4.9,
    isVeg: false
  },
  {
    name: "Dragon Roll Special",
    description: "Eel and cucumber inside, topped with thinly sliced avocado, sweet unagi sauce, and orange tobiko.",
    price: 599.00,
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800",
    category: "Sushi",
    restaurant: "Tokyo Sushi",
    rating: 4.8,
    isVeg: false
  },
  {
    name: "Veggie Maki Crunch",
    description: "Pickled radish, carrots, cucumber, and asparagus wrapped in sushi rice, topped with tempura flakes and sweet soy reduction.",
    price: 399.00,
    image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&q=80&w=800",
    category: "Sushi",
    restaurant: "Tokyo Sushi",
    rating: 4.4,
    isVeg: true
  },

  // Desserts
  {
    name: "Lava Chocolate Cake",
    description: "Rich dark chocolate cake with a warm molten chocolate center, served with a scoop of Madagascar vanilla bean gelato.",
    price: 149.00,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800",
    category: "Desserts",
    restaurant: "Sweet Delights",
    rating: 4.9,
    isVeg: true
  },
  {
    name: "Classic New York Cheesecake",
    description: "Velvety smooth cream cheese cake on a golden graham cracker crust, topped with fresh strawberry compote and whipped cream.",
    price: 199.00,
    image: "https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&q=80&w=800",
    category: "Desserts",
    restaurant: "Sweet Delights",
    rating: 4.7,
    isVeg: true
  },
  {
    name: "Matcha Tiramisu",
    description: "Decadent layers of matcha-soaked ladyfingers, whipped mascarpone cream, and a dusting of ceremonial grade green tea powder.",
    price: 229.00,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800",
    category: "Desserts",
    restaurant: "Sweet Delights",
    rating: 4.6,
    isVeg: true
  },

  // Drinks
  {
    name: "Iced Caramel Macchiato",
    description: "Rich espresso combined with sweet vanilla syrup, milk, and ice, topped with a drizzle of buttery caramel sauce.",
    price: 189.00,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800",
    category: "Drinks",
    restaurant: "Matcha & Co",
    rating: 4.8,
    isVeg: true
  },
  {
    name: "Fresh Mango Mint Cooler",
    description: "A refreshing blend of ripe sweet mangoes, fresh lime juice, crushed mint leaves, and sparkling water.",
    price: 129.00,
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800",
    category: "Drinks",
    restaurant: "Matcha & Co",
    rating: 4.5,
    isVeg: true
  },
  {
    name: "Organic Matcha Latte",
    description: "Whisked Japanese green tea powder combined with steamed almond milk and a touch of raw organic honey.",
    price: 169.00,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800",
    category: "Drinks",
    restaurant: "Matcha & Co",
    rating: 4.7,
    isVeg: true
  }
];
