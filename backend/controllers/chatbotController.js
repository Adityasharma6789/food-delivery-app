import { getDbMode } from '../utils/db.js';
import { jsonDb } from '../utils/dbStore.js';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

// @desc    Process chatbot message and return smart contextual response
// @route   POST /api/chatbot
// @access  Private
export const handleChatbotMessage = async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user._id || req.user.id;
  const userName = req.user.name || 'Friend';

  try {
    if (!message) {
      res.status(400);
      throw new Error('Message content is required');
    }

    const msgLower = message.toLowerCase();

    // 1. Fetch user's latest order for context
    let latestOrder = null;
    if (getDbMode()) {
      const userOrders = jsonDb.find('orders', { user: userId });
      if (userOrders.length > 0) {
        // Sort desc
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        latestOrder = userOrders[0];
      }
    } else {
      latestOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    // 2. Fetch some popular foods for recommendation context
    let popularFoods = [];
    if (getDbMode()) {
      popularFoods = jsonDb.find('foods');
    } else {
      popularFoods = await FoodItem.find({});
    }
    // Filter and sort high rated
    const recommendations = popularFoods
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    let reply = '';

    // 3. Match user intent
    if (msgLower.includes('order') || msgLower.includes('status') || msgLower.includes('track') || msgLower.includes('delivery') || msgLower.includes('where')) {
      if (!latestOrder) {
        reply = `Hello ${userName}! I couldn't find any recent orders associated with your account. Try exploring our delicious menu and placing your first order! 🍕🍔`;
      } else {
        const orderIdFormatted = (latestOrder._id || latestOrder.id).substr(-6).toUpperCase();
        const dateStr = new Date(latestOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        reply = `Your latest order **#${orderIdFormatted}** (placed at ${dateStr}) is currently in the **${latestOrder.status}** phase. \n\n`;
        
        if (latestOrder.status === 'Placed') {
          reply += `🛵 The restaurant has accepted the order and is preparing to cook.`;
        } else if (latestOrder.status === 'Preparing') {
          reply += `🍳 Our kitchen staff is cooking your hot food items right now!`;
        } else if (latestOrder.status === 'Out for Delivery') {
          reply += `🚴 Our delivery agent has picked up your warm meal and is riding to your address: "${latestOrder.shippingAddress}". It should arrive shortly!`;
        } else if (latestOrder.status === 'Delivered') {
          reply += `🎉 This order was marked as Delivered! Hope you enjoyed the taste. Let me know if you need help with anything else.`;
        }
      }
    } 
    else if (msgLower.includes('recommend') || msgLower.includes('suggest') || msgLower.includes('eat') || msgLower.includes('food') || msgLower.includes('menu') || msgLower.includes('hungry') || msgLower.includes('best') || msgLower.includes('veg')) {
      reply = `I would love to suggest some of our top-rated dishes on the platform, ${userName}! Here are my recommendations: \n\n`;
      
      recommendations.forEach((food, idx) => {
        const dietSymbol = food.isVeg ? '🟢 VEG' : '🔴 NON-VEG';
        reply += `${idx + 1}. **${food.name}** (${dietSymbol}) - **₹${food.price}** at *${food.restaurant}* (⭐${food.rating.toFixed(1)})\n_${food.description}_\n\n`;
      });

      reply += `Aap directly in items ko Cart me add karke Checkout kar sakte hain! 🚀`;
    } 
    else if (msgLower.includes('phone') || msgLower.includes('number') || msgLower.includes('email') || msgLower.includes('contact') || msgLower.includes('support') || msgLower.includes('help') || msgLower.includes('address') || msgLower.includes('call')) {
      reply = `Aap hamari team se directly connect kar sakte hain, ${userName}! SwiftBite support parameters ye hain:\n\n` +
              `📞 **Phone helpline:** 9257570348\n` +
              `✉️ **Email support:** aditya.sharma13804@gmail.com\n` +
              `📍 **Corporate office:** 789 Foodie SwiftBite, jaipur district\n\n` +
              `Hum aapki query resolve karne ke liye 24/7 available hain! 💻`;
    }
    else if (msgLower.includes('hi') || msgLower.includes('hello') || msgLower.includes('hey') || msgLower.includes('greetings') || msgLower.includes('chatbot') || msgLower.includes('namaste')) {
      reply = `Hello ${userName}! Welcome to SwiftBite Support Agent. 🤖\n\n` +
              `Main aapki orders ko track karne, dishes recommend karne aur support parameters share karne me help kar sakta hu.\n\n` +
              `Aap niche diye gaye queries puch sakte hain ya option chips use kar sakte hain!`;
    }
    else {
      reply = `Hello ${userName}! Main SwiftBite Virtual Support Bot hu. 🤖\n\n` +
              `Mujhe lagta hai main aapki request completely samajh nahi paya. Main in cheezon me aapki help kar sakta hu:\n\n` +
              `1. **Active Order status check karna:** Bolen "where is my order" ya "track order". 🛵\n` +
              `2. **Dish Suggestions:** Bolen "recommend food" ya "food suggestions". 🍔\n` +
              `3. **Contact details retrieve karna:** Bolen "support email" or "contact info". 📞\n\n` +
              `Aap please in options me se select karen ya contact detail check karen.`;
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
