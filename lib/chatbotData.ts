// Predefined Q&A data for the Raw Earth Crystals chatbot
export interface Question {
  id: string;
  text: string;
  category: string;
  keywords: string[];
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'shipping', name: 'Orders & Shipping', icon: '📦' },
  { id: 'products', name: 'Products & Crystals', icon: '✨' },
  { id: 'care', name: 'Crystal Use & Care', icon: '🌙' },
  { id: 'returns', name: 'Returns & Issues', icon: '🔄' },
  { id: 'payment', name: 'Payments & Checkout', icon: '💳' },
];

export const questions: Question[] = [
  // Orders & Shipping
  {
    id: 'track-order',
    text: 'Where is my order?',
    category: 'shipping',
    keywords: ['track', 'where', 'status', 'ship', 'dispatched'],
    answer: 'Your order will ship within 48 hours (excluding weekends & holidays). Once dispatched, you’ll receive tracking via email. Tracking updates may take up to 24 hours to appear.\n— Raw Earth Crystals Support',
  },
  {
    id: 'shipping-time',
    text: 'How long does shipping take?',
    category: 'shipping',
    keywords: ['long', 'time', 'days', 'express', 'international', 'standard'],
    answer: 'Standard AU: usually up to 7 business days. Express AU: usually 1–3 business days. International shipping is not currently available.\n— Raw Earth Crystals Support',
  },
  {
    id: 'shipping-cost',
    text: 'How much is shipping?',
    category: 'shipping',
    keywords: ['cost', 'price', 'free', 'shipping fee', 'australian'],
    answer: 'Free standard shipping on Australian orders over $99 AUD. Shipping costs for other orders are calculated at checkout.\n— Raw Earth Crystals Support',
  },
  {
    id: 'cancel-order',
    text: 'Can I change or cancel my order?',
    category: 'shipping',
    keywords: ['cancel', 'change', 'modify', 'stop', 'edit'],
    answer: 'If your order hasn’t shipped yet, contact us as soon as possible and we’ll do our best to help.\n— Raw Earth Crystals Support',
  },

  // Products & Crystals
  {
    id: 'exact-crystal',
    text: 'Will I receive the exact crystal pictured?',
    category: 'products',
    keywords: ['exact', 'pictured', 'photo', 'looks like', 'same'],
    answer: 'Yes. You will receive the exact crystal shown unless stated otherwise in the product description.\n— Raw Earth Crystals Support',
  },
  {
    id: 'natural-crystals',
    text: 'Are your crystals natural?',
    category: 'products',
    keywords: ['natural', 'real', 'dyed', 'lab grown', 'authentic', 'genuine'],
    answer: 'Many are natural. Some pieces are dyed or lab-grown using natural minerals for unique appearance and energy. Any treatments are disclosed on the product page.\n— Raw Earth Crystals Support',
  },
  {
    id: 'visual-difference',
    text: 'Why does my crystal look slightly different in person?',
    category: 'products',
    keywords: ['different', 'color', 'texture', 'lighting', 'appearance'],
    answer: 'Natural variations and screen lighting can cause small differences in colour, texture, or clarity.\n— Raw Earth Crystals Support',
  },
  {
    id: 'cleansed-shipping',
    text: 'Are crystals cleansed before shipping?',
    category: 'products',
    keywords: ['cleansed', 'smoke', 'sound', 'energy', 'dispatch'],
    answer: 'Yes. All crystals are cleansed before dispatch using smoke, sound, and intention.\n— Raw Earth Crystals Support',
  },

  // Crystal Use & Care
  {
    id: 'crystal-use',
    text: 'What is this crystal used for?',
    category: 'care',
    keywords: ['use', 'purpose', 'spiritual', 'energy', 'benefit', 'meaning'],
    answer: 'Crystals are commonly used for spiritual and energetic support, intention-setting, and mindfulness practices. \n\nDisclaimer: Our products are not a substitute for medical advice or treatment.\n— Raw Earth Crystals Support',
  },
  {
    id: 'cleanse-charge',
    text: 'How do I cleanse or charge my crystal?',
    category: 'care',
    keywords: ['cleanse', 'charge', 'water', 'sunlight', 'moonlight', 'how to'],
    answer: 'Common methods include smoke cleansing, sound, and intention. Please check your specific crystal before using water or sunlight.\n— Raw Earth Crystals Support',
  },

  // Returns & Issues
  {
    id: 'return-policy',
    text: 'What is your return policy?',
    category: 'returns',
    keywords: ['return', 'refund', 'faulty', 'change of mind', 'policy'],
    answer: 'We accept returns within 30 days for faulty items only. Change-of-mind returns aren’t accepted.\n— Raw Earth Crystals Support',
  },
  {
    id: 'damaged-item',
    text: 'My item arrived damaged',
    category: 'returns',
    keywords: ['damaged', 'broken', 'cracked', 'photos', 'help'],
    answer: 'Please contact us within 30 days with clear photos of the item and original packaging so we can assist.\n— Raw Earth Crystals Support',
  },
  {
    id: 'refund-time',
    text: 'How long do refunds take?',
    category: 'returns',
    keywords: ['refund', 'money back', 'bank', 'processed', 'time'],
    answer: 'Approved refunds are processed back to your original payment method and usually take a few business days, depending on your bank.\n— Raw Earth Crystals Support',
  },

  // Payments & Checkout
  {
    id: 'payment-methods',
    text: 'What payment methods do you accept?',
    category: 'payment',
    keywords: ['visa', 'mastercard', 'paypal', 'afterpay', 'zip', 'payment'],
    answer: 'We accept Visa, Mastercard, and PayPal. Afterpay and Zip are coming soon.\n— Raw Earth Crystals Support',
  },
  {
    id: 'guest-account',
    text: 'Do I need an account to order?',
    category: 'payment',
    keywords: ['account', 'guest', 'register', 'sign up', 'order'],
    answer: 'No. Guest checkout is available.\n— Raw Earth Crystals Support',
  },
];

export const FALLBACK_MESSAGE = "I'm sorry, I can only help with specific questions about our crystals and orders. If you have a refund request or a damaged item, please let me know so I can escalate this to our team.";

export const GREETING_MESSAGE = "Hello! ✨ Welcome to Raw Earth Crystals Customer Care. How can I help you today? Please select a category or choose a question below.";

// Function to find matching question based on user input
export function findMatchingQuestion(userInput: string): Question | null {
  const input = userInput.toLowerCase().trim();
  
  // First, try exact match
  const exactMatch = questions.find(
    q => q.text.toLowerCase() === input
  );
  if (exactMatch) return exactMatch;

  // Then try keyword matching
  const keywordMatch = questions.find(q =>
    q.keywords.some(keyword => input.includes(keyword.toLowerCase()))
  );
  
  return keywordMatch || null;
}

// Get questions by category
export function getQuestionsByCategory(categoryId: string): Question[] {
  return questions.filter(q => q.category === categoryId);
}