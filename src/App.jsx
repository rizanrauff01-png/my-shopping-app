import { useState, useEffect, useRef } from "react";

const CATEGORIES = {
  grocery: { label: "Groceries", emoji: "🥦", color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  food: { label: "Food & Drinks", emoji: "🍔", color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  clothing: { label: "Clothing", emoji: "👗", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  household: { label: "Household", emoji: "🏠", color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
};

const PRIORITIES = ["high", "medium", "low"];
const PRIORITY_COLORS = { high: "#f87171", medium: "#fbbf24", low: "#4ade80" };

// ─── Offline AI Brain ────────────────────────────────────────────────────────

const KEYWORDS = {
  grocery: ["milk","egg","eggs","bread","butter","rice","flour","sugar","salt","oil","onion","onions","garlic","potato","potatoes","tomato","tomatoes","carrot","carrots","apple","apples","banana","bananas","orange","oranges","lemon","lemons","cheese","yogurt","cream","cereal","oats","pasta","noodles","sauce","vinegar","pepper","chili","ginger","coriander","turmeric","curry","coconut","tea","coffee","biscuit","biscuits","chocolate","jam","honey","ketchup","mustard","pickle","beans","lentils","dal","wheat","corn","peas","spinach","cabbage","lettuce","broccoli","cauliflower","cucumber","mushroom","mushrooms","avocado","mango","grapes","strawberry","watermelon","pineapple","papaya","vegetable","vegetables","fruit","fruits"],
  food: ["burger","pizza","sandwich","fries","juice","soda","cola","energy drink","cake","pastry","donut","ice cream","chips","snack","snacks","popcorn","candy","sweets","takeaway","takeout","soup","ramen","sushi","fried rice","biryani","kottu","hoppers","smoothie","milkshake","latte","cappuccino","espresso","hot chocolate","beer","wine","drink","drinks","beverage","beverages","fast food","bottled water","water bottle"],
  clothing: ["shirt","t-shirt","tshirt","trouser","trousers","pants","jeans","shorts","skirt","dress","saree","sari","kurta","blouse","jacket","coat","sweater","hoodie","sweatshirt","underwear","socks","sock","shoes","shoe","sandals","sandal","slippers","slipper","boots","boot","hat","cap","scarf","tie","belt","bag","handbag","purse","wallet","watch","sunglasses","glasses","jewelry","necklace","bracelet","ring","earrings","gloves","swimsuit","pyjamas","pajamas","nightgown","uniform","suit","blazer","vest","raincoat","umbrella","leggings","tights","bra","sportswear","tracksuit","gym wear"],
  household: ["tap","faucet","brush","broom","mop","bucket","soap","detergent","washing powder","dishwash","sponge","cleaning","cleaner","bleach","toilet paper","tissue","napkin","towel","towels","curtain","curtains","pillow","pillows","bedsheet","blanket","mattress","chair","table","shelf","shelves","rack","hanger","hangers","hook","nail","screw","hammer","screwdriver","wrench","pliers","drill","paint","bulb","light bulb","fan","switch","socket","wire","cable","battery","batteries","candle","candles","trash bag","garbage bag","bin","dustbin","basket","container","jar","lock","key","shower","pipe","ladder","tape","glue","scissors","knife","knives","fork","spoon","plate","plates","bowl","bowls","cup","cups","pot","pots","pan","pans","cooker","kettle","toaster","blender","mixer","iron","vacuum","floor cleaner","air freshener","insecticide","mosquito repellent","lamp","charger","remote","adapter","extension cord","light","dustpan","water tap","net","mosquito net","window net","dish rack","laundry","washing","mop stick","paint brush","paint roller","wall paint","floor mat","door mat","mat","rug","mirror","clock","calendar","photo frame","frame","safe","locker","tool","toolbox","measuring tape","level","saw","axe","shovel","garden","hose","watering can","flower pot","flowerpot","vase","birdcage","fish tank","aquarium","pet bowl","litter box"],
};

const REMOVE_WORDS = ["remove","delete","take out","cancel","cross off","drop"];
const DONE_WORDS = ["done","bought","purchased","got","completed","finished","mark","ticked"];
const CLEAR_WORDS = ["clear all","empty all","reset all","wipe all","remove all","delete all"];
const SHOW_WORDS = ["show","list","what","view","display","see","how many","tell me"];
const GREETINGS = ["hi","hello","hey","good morning","good afternoon","good evening","howdy","sup"];
const HELP_WORDS = ["help","what can you do","commands","instructions","how to use"];

// ─── Recipe Database ──────────────────────────────────────────────────────────
const RECIPES = {
  // ── Sri Lankan Desserts ──
  "wattalapam": {
    name: "Wattalapam",
    emoji: "🍮",
    description: "Classic Sri Lankan steamed coconut custard pudding",
    serves: "6 people",
    ingredients: [
      { name: "Coconut milk", qty: "400ml", cat: "grocery" },
      { name: "Jaggery (kithul)", qty: "200g", cat: "grocery" },
      { name: "Eggs", qty: "6", cat: "grocery" },
      { name: "Cardamom powder", qty: "1 tsp", cat: "grocery" },
      { name: "Cloves", qty: "4", cat: "grocery" },
      { name: "Nutmeg powder", qty: "½ tsp", cat: "grocery" },
      { name: "Vanilla essence", qty: "1 tsp", cat: "grocery" },
      { name: "Cashew nuts", qty: "50g", cat: "grocery" },
      { name: "Raisins", qty: "50g", cat: "grocery" },
    ],
    steps: "1. Melt jaggery in coconut milk over low heat. Cool.\n2. Beat eggs well, mix into coconut milk.\n3. Add cardamom, cloves, nutmeg, vanilla.\n4. Strain mixture, pour into greased mould.\n5. Top with cashews & raisins.\n6. Steam for 45 mins until set.\n7. Cool, refrigerate 2 hrs before serving."
  },
  "biscuit pudding": {
    name: "Biscuit Pudding",
    emoji: "🍰",
    description: "No-bake Sri Lankan layered biscuit dessert",
    serves: "8 people",
    ingredients: [
      { name: "Marie biscuits", qty: "400g", cat: "grocery" },
      { name: "Butter", qty: "100g", cat: "grocery" },
      { name: "Sugar", qty: "100g", cat: "grocery" },
      { name: "Eggs", qty: "3", cat: "grocery" },
      { name: "Cocoa powder", qty: "3 tbsp", cat: "grocery" },
      { name: "Vanilla essence", qty: "1 tsp", cat: "grocery" },
      { name: "Milk", qty: "100ml", cat: "grocery" },
      { name: "Chocolate", qty: "100g", cat: "grocery" },
      { name: "Cream", qty: "200ml", cat: "grocery" },
    ],
    steps: "1. Beat butter & sugar until fluffy.\n2. Add eggs one by one, beat well.\n3. Mix in cocoa powder & vanilla.\n4. Dip biscuits in milk briefly.\n5. Layer: biscuits → cream mixture → biscuits.\n6. Repeat layers, top with chocolate ganache.\n7. Refrigerate overnight before serving."
  },
  "love cake": {
    name: "Love Cake",
    emoji: "🎂",
    description: "Traditional Sri Lankan semolina spice cake",
    serves: "12 people",
    ingredients: [
      { name: "Semolina", qty: "500g", cat: "grocery" },
      { name: "Sugar", qty: "500g", cat: "grocery" },
      { name: "Eggs", qty: "10", cat: "grocery" },
      { name: "Butter", qty: "250g", cat: "grocery" },
      { name: "Cashew nuts", qty: "200g", cat: "grocery" },
      { name: "Honey", qty: "3 tbsp", cat: "grocery" },
      { name: "Rose water", qty: "2 tbsp", cat: "grocery" },
      { name: "Cardamom powder", qty: "1 tsp", cat: "grocery" },
      { name: "Nutmeg powder", qty: "1 tsp", cat: "grocery" },
      { name: "Pumpkin preserve", qty: "200g", cat: "grocery" },
    ],
    steps: "1. Toast semolina until golden, cool.\n2. Beat egg yolks & sugar until thick.\n3. Add butter, honey, rose water.\n4. Mix in semolina, cashews, pumpkin preserve.\n5. Add spices, fold in beaten egg whites.\n6. Bake at 150°C for 60-70 mins."
  },
  "kokis": {
    name: "Kokis",
    emoji: "🌸",
    description: "Crispy Sri Lankan fried rice flour snack",
    serves: "20 pieces",
    ingredients: [
      { name: "Rice flour", qty: "2 cups", cat: "grocery" },
      { name: "Coconut milk", qty: "400ml", cat: "grocery" },
      { name: "Eggs", qty: "2", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Turmeric powder", qty: "¼ tsp", cat: "grocery" },
      { name: "Cooking oil", qty: "500ml", cat: "grocery" },
    ],
    steps: "1. Mix rice flour, coconut milk, eggs, salt & turmeric.\n2. Batter should be smooth & not too thick.\n3. Heat oil in deep pan.\n4. Dip kokis mould in hot oil, then in batter.\n5. Dip back in hot oil & fry until golden.\n6. Drain on paper towels."
  },
  "wambatu moju": {
    name: "Wambatu Moju",
    emoji: "🍆",
    description: "Sri Lankan pickled eggplant",
    serves: "4 people",
    ingredients: [
      { name: "Eggplant (brinjal)", qty: "500g", cat: "grocery" },
      { name: "Vinegar", qty: "3 tbsp", cat: "grocery" },
      { name: "Sugar", qty: "2 tbsp", cat: "grocery" },
      { name: "Onion", qty: "2", cat: "grocery" },
      { name: "Green chili", qty: "4", cat: "grocery" },
      { name: "Mustard seeds", qty: "1 tsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Oil", qty: "200ml", cat: "grocery" },
    ],
    steps: "1. Cut eggplant, rub with turmeric & salt.\n2. Deep fry until golden, drain.\n3. Fry onions & chili until golden.\n4. Add mustard seeds, vinegar, sugar.\n5. Mix in fried eggplant.\n6. Cool & store in airtight jar."
  },
  "string hoppers": {
    name: "String Hoppers (Indi Appa)",
    emoji: "🍝",
    description: "Steamed Sri Lankan rice noodle nests",
    serves: "4 people",
    ingredients: [
      { name: "Rice flour (roasted)", qty: "2 cups", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Hot water", qty: "as needed", cat: "grocery" },
      { name: "Coconut milk", qty: "200ml", cat: "grocery" },
    ],
    steps: "1. Mix rice flour & salt, add hot water gradually.\n2. Knead into smooth soft dough.\n3. Fill string hopper press with dough.\n4. Press onto string hopper mats in circular motion.\n5. Steam for 5-7 mins until cooked.\n6. Serve with coconut sambol & dhal curry."
  },
  "hoppers": {
    name: "Hoppers (Appa)",
    emoji: "🥣",
    description: "Sri Lankan crispy bowl-shaped rice pancakes",
    serves: "4 people",
    ingredients: [
      { name: "Rice flour", qty: "2 cups", cat: "grocery" },
      { name: "Coconut milk", qty: "400ml", cat: "grocery" },
      { name: "Yeast", qty: "1 tsp", cat: "grocery" },
      { name: "Sugar", qty: "1 tsp", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Eggs", qty: "4 (optional)", cat: "grocery" },
    ],
    steps: "1. Mix rice flour, coconut milk, yeast, sugar & salt.\n2. Rest batter 4-6 hours until slightly fermented.\n3. Heat hopper pan, add small amount of oil.\n4. Pour batter, swirl to coat sides.\n5. Cover & cook 3-4 mins until edges crispy.\n6. Serve with lunu miris or curry."
  },
  "pol sambol": {
    name: "Pol Sambol",
    emoji: "🥥",
    description: "Sri Lankan coconut relish",
    serves: "4 people",
    ingredients: [
      { name: "Fresh coconut (grated)", qty: "2 cups", cat: "grocery" },
      { name: "Red onion", qty: "2", cat: "grocery" },
      { name: "Green chili", qty: "3", cat: "grocery" },
      { name: "Red chili powder", qty: "1 tsp", cat: "grocery" },
      { name: "Lime", qty: "1", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Maldive fish (umbalakada)", qty: "2 tbsp", cat: "grocery" },
    ],
    steps: "1. Grate fresh coconut finely.\n2. Finely chop onion & chili.\n3. Mix coconut, onion, chili, chili powder.\n4. Add maldive fish, lime juice & salt.\n5. Mix well by hand, squeezing as you go.\n6. Taste & adjust seasoning."
  },
  "kottu": {
    name: "Kottu Roti",
    emoji: "🔪",
    description: "Sri Lankan chopped roti stir-fry",
    serves: "2 people",
    ingredients: [
      { name: "Godamba roti", qty: "4", cat: "food" },
      { name: "Chicken", qty: "200g", cat: "grocery" },
      { name: "Eggs", qty: "2", cat: "grocery" },
      { name: "Onion", qty: "1", cat: "grocery" },
      { name: "Leeks", qty: "2 stalks", cat: "grocery" },
      { name: "Carrot", qty: "1", cat: "grocery" },
      { name: "Cabbage", qty: "½ cup", cat: "grocery" },
      { name: "Soy sauce", qty: "2 tbsp", cat: "grocery" },
      { name: "Curry powder", qty: "1 tsp", cat: "grocery" },
      { name: "Chili flakes", qty: "1 tsp", cat: "grocery" },
      { name: "Oil", qty: "3 tbsp", cat: "grocery" },
    ],
    steps: "1. Cut roti into thin strips.\n2. Heat oil, fry chicken until cooked.\n3. Add onion, leeks, carrot, cabbage.\n4. Push aside, scramble eggs in pan.\n5. Add roti strips, mix everything.\n6. Add soy sauce, curry powder, chili.\n7. Chop & mix vigorously while cooking."
  },
  "dhal curry": {
    name: "Dhal Curry (Parippu)",
    emoji: "🍛",
    description: "Sri Lankan red lentil curry",
    serves: "4 people",
    ingredients: [
      { name: "Red lentils (masoor dal)", qty: "250g", cat: "grocery" },
      { name: "Coconut milk", qty: "200ml", cat: "grocery" },
      { name: "Onion", qty: "1", cat: "grocery" },
      { name: "Garlic", qty: "3 cloves", cat: "grocery" },
      { name: "Green chili", qty: "2", cat: "grocery" },
      { name: "Tomato", qty: "1", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Curry powder", qty: "1 tsp", cat: "grocery" },
      { name: "Mustard seeds", qty: "1 tsp", cat: "grocery" },
      { name: "Curry leaves", qty: "a few", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
      { name: "Oil", qty: "2 tbsp", cat: "grocery" },
    ],
    steps: "1. Boil lentils with turmeric until soft.\n2. Add coconut milk, simmer 10 mins.\n3. In separate pan, heat oil.\n4. Add mustard seeds until they pop.\n5. Add onion, garlic, curry leaves, chili.\n6. Add tomato & curry powder, cook 3 mins.\n7. Pour tempering over lentils, mix well."
  },
  // ── Sri Lankan Mains ──
  "chicken curry": {
    name: "Sri Lankan Chicken Curry",
    emoji: "🍗",
    description: "Authentic spicy Sri Lankan chicken curry",
    serves: "4 people",
    ingredients: [
      { name: "Chicken pieces", qty: "1 kg", cat: "grocery" },
      { name: "Onion", qty: "2 large", cat: "grocery" },
      { name: "Garlic", qty: "5 cloves", cat: "grocery" },
      { name: "Ginger", qty: "1 inch", cat: "grocery" },
      { name: "Tomatoes", qty: "2", cat: "grocery" },
      { name: "Coconut milk", qty: "400ml", cat: "grocery" },
      { name: "Sri Lankan curry powder", qty: "2 tbsp", cat: "grocery" },
      { name: "Turmeric powder", qty: "1 tsp", cat: "grocery" },
      { name: "Red chili powder", qty: "1 tsp", cat: "grocery" },
      { name: "Cinnamon stick", qty: "1", cat: "grocery" },
      { name: "Curry leaves", qty: "a few", cat: "grocery" },
      { name: "Pandan leaf", qty: "1", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
      { name: "Oil", qty: "3 tbsp", cat: "grocery" },
    ],
    steps: "1. Marinate chicken with curry powder, turmeric, chili & salt for 30 mins.\n2. Heat oil, fry onion, garlic, ginger until golden.\n3. Add curry leaves, pandan, cinnamon.\n4. Add chicken, fry until sealed.\n5. Add tomatoes, cook until soft.\n6. Pour coconut milk, simmer 25-30 mins.\n7. Adjust seasoning & serve with rice."
  },
  "fish curry": {
    name: "Sri Lankan Fish Curry",
    emoji: "🐟",
    description: "Tangy Sri Lankan fish curry with goraka",
    serves: "4 people",
    ingredients: [
      { name: "Fish pieces (tuna/seer)", qty: "500g", cat: "grocery" },
      { name: "Goraka (gamboge)", qty: "3 pieces", cat: "grocery" },
      { name: "Onion", qty: "1", cat: "grocery" },
      { name: "Garlic", qty: "3 cloves", cat: "grocery" },
      { name: "Green chili", qty: "3", cat: "grocery" },
      { name: "Curry powder", qty: "2 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Coconut milk", qty: "200ml", cat: "grocery" },
      { name: "Curry leaves", qty: "a few", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
      { name: "Oil", qty: "2 tbsp", cat: "grocery" },
    ],
    steps: "1. Marinate fish with turmeric, curry powder & salt.\n2. Soak goraka in warm water, extract juice.\n3. Heat oil, fry onion, garlic, curry leaves.\n4. Add fish, fry lightly on both sides.\n5. Add goraka juice & coconut milk.\n6. Simmer 15 mins until fish is cooked.\n7. Serve with rice or string hoppers."
  },
  "rice and curry": {
    name: "Sri Lankan Rice & Curry",
    emoji: "🍚",
    description: "Traditional Sri Lankan rice with multiple curries",
    serves: "4 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Chicken pieces", qty: "500g", cat: "grocery" },
      { name: "Red lentils", qty: "1 cup", cat: "grocery" },
      { name: "Coconut milk", qty: "600ml", cat: "grocery" },
      { name: "Onion", qty: "3", cat: "grocery" },
      { name: "Garlic", qty: "4 cloves", cat: "grocery" },
      { name: "Curry powder", qty: "3 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "1 tsp", cat: "grocery" },
      { name: "Curry leaves", qty: "a few", cat: "grocery" },
      { name: "Pandan leaves", qty: "2", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
      { name: "Oil", qty: "4 tbsp", cat: "grocery" },
    ],
    steps: "1. Cook rice with pandan leaves & coconut milk.\n2. Make chicken curry (see chicken curry recipe).\n3. Make dhal curry with lentils.\n4. Prepare pol sambol.\n5. Serve rice with curries & sambol on the side."
  },
  // ── International Desserts & Bakes ──
  "chocolate cake": {
    name: "Chocolate Cake",
    emoji: "🎂",
    description: "Rich moist chocolate layer cake",
    serves: "8 people",
    ingredients: [
      { name: "All-purpose flour", qty: "2 cups", cat: "grocery" },
      { name: "Sugar", qty: "2 cups", cat: "grocery" },
      { name: "Cocoa powder", qty: "¾ cup", cat: "grocery" },
      { name: "Baking soda", qty: "2 tsp", cat: "grocery" },
      { name: "Baking powder", qty: "1 tsp", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Eggs", qty: "2", cat: "grocery" },
      { name: "Butter", qty: "100g", cat: "grocery" },
      { name: "Milk", qty: "1 cup", cat: "grocery" },
      { name: "Vanilla essence", qty: "2 tsp", cat: "grocery" },
      { name: "Heavy cream", qty: "200ml", cat: "grocery" },
      { name: "Dark chocolate", qty: "200g", cat: "grocery" },
    ],
    steps: "1. Mix dry ingredients: flour, sugar, cocoa, baking soda, baking powder, salt.\n2. Add eggs, butter, milk & vanilla, mix well.\n3. Pour into greased pan.\n4. Bake at 175°C for 30-35 mins.\n5. Cool completely.\n6. Make ganache: heat cream, pour over chocolate, stir.\n7. Frost cake with ganache."
  },
  "muffins": {
    name: "Muffins",
    emoji: "🧁",
    description: "Fluffy classic vanilla or blueberry muffins",
    serves: "12 muffins",
    ingredients: [
      { name: "All-purpose flour", qty: "2 cups", cat: "grocery" },
      { name: "Sugar", qty: "¾ cup", cat: "grocery" },
      { name: "Baking powder", qty: "2 tsp", cat: "grocery" },
      { name: "Salt", qty: "½ tsp", cat: "grocery" },
      { name: "Eggs", qty: "2", cat: "grocery" },
      { name: "Milk", qty: "1 cup", cat: "grocery" },
      { name: "Butter (melted)", qty: "½ cup", cat: "grocery" },
      { name: "Vanilla essence", qty: "1 tsp", cat: "grocery" },
      { name: "Blueberries (optional)", qty: "1 cup", cat: "grocery" },
    ],
    steps: "1. Mix dry ingredients: flour, sugar, baking powder, salt.\n2. In another bowl mix eggs, milk, butter, vanilla.\n3. Fold wet into dry — don't overmix!\n4. Fold in blueberries if using.\n5. Fill muffin cases ¾ full.\n6. Bake at 190°C for 18-20 mins.\n7. Cool 5 mins before removing."
  },
  "pizza": {
    name: "Homemade Pizza",
    emoji: "🍕",
    description: "Classic homemade pizza with tomato sauce & cheese",
    serves: "2 people",
    ingredients: [
      { name: "All-purpose flour", qty: "2 cups", cat: "grocery" },
      { name: "Yeast", qty: "1 tsp", cat: "grocery" },
      { name: "Sugar", qty: "1 tsp", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Olive oil", qty: "2 tbsp", cat: "grocery" },
      { name: "Warm water", qty: "¾ cup", cat: "grocery" },
      { name: "Tomato paste", qty: "3 tbsp", cat: "grocery" },
      { name: "Mozzarella cheese", qty: "200g", cat: "grocery" },
      { name: "Bell pepper", qty: "1", cat: "grocery" },
      { name: "Onion", qty: "1", cat: "grocery" },
      { name: "Mushrooms", qty: "100g", cat: "grocery" },
      { name: "Oregano", qty: "1 tsp", cat: "grocery" },
      { name: "Chili flakes", qty: "½ tsp", cat: "grocery" },
    ],
    steps: "1. Mix yeast, sugar & warm water, rest 10 mins.\n2. Add flour, salt, olive oil, knead 8 mins.\n3. Rest dough 1 hour until doubled.\n4. Roll out thin on floured surface.\n5. Spread tomato paste, add toppings.\n6. Top generously with mozzarella.\n7. Bake at 220°C for 12-15 mins."
  },
  "fried rice": {
    name: "Fried Rice",
    emoji: "🍳",
    description: "Sri Lankan style egg fried rice",
    serves: "3 people",
    ingredients: [
      { name: "Cooked rice (cold)", qty: "3 cups", cat: "grocery" },
      { name: "Eggs", qty: "3", cat: "grocery" },
      { name: "Carrot", qty: "1", cat: "grocery" },
      { name: "Leeks", qty: "2 stalks", cat: "grocery" },
      { name: "Cabbage", qty: "½ cup", cat: "grocery" },
      { name: "Onion", qty: "1", cat: "grocery" },
      { name: "Soy sauce", qty: "3 tbsp", cat: "grocery" },
      { name: "Garlic", qty: "3 cloves", cat: "grocery" },
      { name: "Salt & pepper", qty: "to taste", cat: "grocery" },
      { name: "Oil", qty: "3 tbsp", cat: "grocery" },
    ],
    steps: "1. Heat oil in large wok or pan.\n2. Fry garlic & onion until golden.\n3. Add carrot, leeks, cabbage, stir fry 3 mins.\n4. Push vegetables aside, scramble eggs.\n5. Add cold rice, mix everything together.\n6. Add soy sauce, salt & pepper.\n7. Stir fry on high heat 3-4 mins."
  },
  "biryani": {
    name: "Chicken Biryani",
    emoji: "🍲",
    description: "Fragrant layered chicken biryani",
    serves: "4 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Chicken pieces", qty: "750g", cat: "grocery" },
      { name: "Yogurt", qty: "1 cup", cat: "grocery" },
      { name: "Onion", qty: "3 large", cat: "grocery" },
      { name: "Tomatoes", qty: "2", cat: "grocery" },
      { name: "Garlic", qty: "5 cloves", cat: "grocery" },
      { name: "Ginger", qty: "1 inch", cat: "grocery" },
      { name: "Biryani masala", qty: "2 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Saffron", qty: "a pinch", cat: "grocery" },
      { name: "Mint leaves", qty: "handful", cat: "grocery" },
      { name: "Ghee", qty: "3 tbsp", cat: "grocery" },
      { name: "Oil", qty: "3 tbsp", cat: "grocery" },
    ],
    steps: "1. Marinate chicken in yogurt, spices, garlic, ginger 2 hrs.\n2. Fry onions until golden brown.\n3. Cook marinated chicken until 80% done.\n4. Par-boil rice with whole spices.\n5. Layer rice over chicken in pot.\n6. Add saffron milk, mint, fried onions.\n7. Seal & cook on low heat (dum) 25 mins."
  },
  "pancakes": {
    name: "Pancakes",
    emoji: "🥞",
    description: "Fluffy American-style pancakes",
    serves: "4 people",
    ingredients: [
      { name: "All-purpose flour", qty: "1½ cups", cat: "grocery" },
      { name: "Sugar", qty: "2 tbsp", cat: "grocery" },
      { name: "Baking powder", qty: "2 tsp", cat: "grocery" },
      { name: "Salt", qty: "½ tsp", cat: "grocery" },
      { name: "Eggs", qty: "2", cat: "grocery" },
      { name: "Milk", qty: "1¼ cups", cat: "grocery" },
      { name: "Butter (melted)", qty: "3 tbsp", cat: "grocery" },
      { name: "Vanilla essence", qty: "1 tsp", cat: "grocery" },
    ],
    steps: "1. Mix dry ingredients in large bowl.\n2. Whisk eggs, milk, butter & vanilla separately.\n3. Pour wet into dry, mix until just combined.\n4. Heat greased pan on medium heat.\n5. Pour ¼ cup batter per pancake.\n6. Cook until bubbles form, flip once.\n7. Serve with honey or maple syrup."
  },
  "butter cake": {
    name: "Butter Cake",
    emoji: "🍰",
    description: "Classic Sri Lankan butter sponge cake",
    serves: "8 people",
    ingredients: [
      { name: "Butter", qty: "250g", cat: "grocery" },
      { name: "Sugar", qty: "200g", cat: "grocery" },
      { name: "Eggs", qty: "4", cat: "grocery" },
      { name: "All-purpose flour", qty: "2 cups", cat: "grocery" },
      { name: "Baking powder", qty: "2 tsp", cat: "grocery" },
      { name: "Milk", qty: "½ cup", cat: "grocery" },
      { name: "Vanilla essence", qty: "1 tsp", cat: "grocery" },
      { name: "Salt", qty: "pinch", cat: "grocery" },
    ],
    steps: "1. Cream butter & sugar until light & fluffy.\n2. Add eggs one by one, beating well.\n3. Sift flour, baking powder & salt.\n4. Fold dry ingredients into butter mix.\n5. Add milk & vanilla, mix gently.\n6. Pour into greased tin.\n7. Bake at 175°C for 35-40 mins."
  },
  "chocolate brownies": {
    name: "Chocolate Brownies",
    emoji: "🍫",
    description: "Fudgy rich chocolate brownies",
    serves: "12 pieces",
    ingredients: [
      { name: "Dark chocolate", qty: "200g", cat: "grocery" },
      { name: "Butter", qty: "150g", cat: "grocery" },
      { name: "Sugar", qty: "1½ cups", cat: "grocery" },
      { name: "Eggs", qty: "3", cat: "grocery" },
      { name: "All-purpose flour", qty: "¾ cup", cat: "grocery" },
      { name: "Cocoa powder", qty: "¼ cup", cat: "grocery" },
      { name: "Vanilla essence", qty: "1 tsp", cat: "grocery" },
      { name: "Salt", qty: "pinch", cat: "grocery" },
    ],
    steps: "1. Melt chocolate & butter together, cool.\n2. Whisk sugar & eggs until thick.\n3. Add chocolate mixture to eggs.\n4. Fold in flour, cocoa, vanilla & salt.\n5. Pour into lined baking tin.\n6. Bake at 175°C for 20-25 mins.\n7. Cool completely before cutting."
  },
  "kiri bath": {
    name: "Kiri Bath (Milk Rice)",
    emoji: "🍚",
    description: "Sri Lankan auspicious coconut milk rice",
    serves: "4 people",
    ingredients: [
      { name: "Raw rice", qty: "2 cups", cat: "grocery" },
      { name: "Coconut milk (thick)", qty: "400ml", cat: "grocery" },
      { name: "Salt", qty: "1 tsp", cat: "grocery" },
      { name: "Water", qty: "3 cups", cat: "grocery" },
    ],
    steps: "1. Wash rice, add water & cook until almost done.\n2. Add thick coconut milk & salt.\n3. Stir well, cook on low heat.\n4. When thick & creamy, remove from heat.\n5. Spread on flat plate, cool slightly.\n6. Cut into diamond shapes.\n7. Serve with lunu miris or jaggery."
  },
  "lamprais": {
    name: "Lamprais",
    emoji: "🌿",
    description: "Dutch-Sri Lankan rice baked in banana leaf",
    serves: "4 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Chicken pieces", qty: "500g", cat: "grocery" },
      { name: "Banana leaves", qty: "4 large", cat: "grocery" },
      { name: "Onion", qty: "2", cat: "grocery" },
      { name: "Garlic", qty: "4 cloves", cat: "grocery" },
      { name: "Curry powder", qty: "2 tbsp", cat: "grocery" },
      { name: "Coconut milk", qty: "400ml", cat: "grocery" },
      { name: "Eggs (hard boiled)", qty: "4", cat: "grocery" },
      { name: "Brinjal", qty: "2", cat: "grocery" },
      { name: "Lemongrass", qty: "2 stalks", cat: "grocery" },
      { name: "Butter", qty: "50g", cat: "grocery" },
    ],
    steps: "1. Cook rice in stock until 80% done.\n2. Prepare chicken curry.\n3. Fry brinjal moju.\n4. Soften banana leaves over flame.\n5. Place rice, chicken, egg, brinjal on leaf.\n6. Wrap tightly into parcel.\n7. Bake at 175°C for 30 mins."
  },
  "samosas": {
    name: "Samosas",
    emoji: "🥟",
    description: "Crispy fried pastry with spiced potato filling",
    serves: "12 pieces",
    ingredients: [
      { name: "All-purpose flour", qty: "2 cups", cat: "grocery" },
      { name: "Butter", qty: "3 tbsp", cat: "grocery" },
      { name: "Potato", qty: "4 large", cat: "grocery" },
      { name: "Green peas", qty: "½ cup", cat: "grocery" },
      { name: "Onion", qty: "1", cat: "grocery" },
      { name: "Ginger", qty: "½ inch", cat: "grocery" },
      { name: "Curry powder", qty: "1 tsp", cat: "grocery" },
      { name: "Cumin seeds", qty: "1 tsp", cat: "grocery" },
      { name: "Chili powder", qty: "½ tsp", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
      { name: "Oil", qty: "for frying", cat: "grocery" },
    ],
    steps: "1. Make pastry: rub butter into flour, add water, knead.\n2. Boil & mash potatoes.\n3. Fry onion, cumin, ginger & spices.\n4. Mix with potatoes & peas.\n5. Roll pastry, cut into circles.\n6. Fill & fold into triangles, seal edges.\n7. Deep fry until golden & crispy."
  },
  "mutton biryani": {
    name: "Mutton Biryani",
    emoji: "🍖",
    description: "Rich & aromatic slow-cooked mutton biryani",
    serves: "4 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Mutton pieces", qty: "750g", cat: "grocery" },
      { name: "Yogurt", qty: "1 cup", cat: "grocery" },
      { name: "Onion", qty: "3 large", cat: "grocery" },
      { name: "Tomatoes", qty: "2", cat: "grocery" },
      { name: "Garlic", qty: "6 cloves", cat: "grocery" },
      { name: "Ginger", qty: "2 inches", cat: "grocery" },
      { name: "Biryani masala", qty: "3 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Red chili powder", qty: "1 tsp", cat: "grocery" },
      { name: "Saffron", qty: "a pinch", cat: "grocery" },
      { name: "Warm milk", qty: "3 tbsp", cat: "grocery" },
      { name: "Mint leaves", qty: "handful", cat: "grocery" },
      { name: "Coriander leaves", qty: "handful", cat: "grocery" },
      { name: "Ghee", qty: "4 tbsp", cat: "grocery" },
      { name: "Whole spices (cinnamon, cardamom, cloves, bay leaf)", qty: "mixed", cat: "grocery" },
      { name: "Oil", qty: "3 tbsp", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
    ],
    steps: "1. Marinate mutton with yogurt, garlic, ginger, chili, turmeric & salt for 3-4 hrs.\n2. Fry onions in oil + ghee until deep golden brown. Set aside half.\n3. In same pan, add whole spices, then marinated mutton.\n4. Cook mutton on high heat 10 mins, then low heat 40 mins until tender.\n5. Par-boil rice with whole spices & salt until 70% cooked. Drain.\n6. Dissolve saffron in warm milk.\n7. Layer: mutton → rice → fried onions → mint → coriander → saffron milk → ghee.\n8. Seal pot with foil & lid, cook on very low heat (dum) 30 mins.\n9. Rest 10 mins before opening & mixing."
  },
  "prawn biryani": {
    name: "Prawn Biryani",
    emoji: "🦐",
    description: "Fragrant spiced prawn biryani with coconut",
    serves: "4 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Prawns (cleaned)", qty: "500g", cat: "grocery" },
      { name: "Coconut milk", qty: "200ml", cat: "grocery" },
      { name: "Yogurt", qty: "½ cup", cat: "grocery" },
      { name: "Onion", qty: "2 large", cat: "grocery" },
      { name: "Tomatoes", qty: "2", cat: "grocery" },
      { name: "Garlic", qty: "4 cloves", cat: "grocery" },
      { name: "Ginger", qty: "1 inch", cat: "grocery" },
      { name: "Green chili", qty: "3", cat: "grocery" },
      { name: "Biryani masala", qty: "2 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Mint leaves", qty: "handful", cat: "grocery" },
      { name: "Coriander leaves", qty: "handful", cat: "grocery" },
      { name: "Lemon juice", qty: "2 tbsp", cat: "grocery" },
      { name: "Ghee", qty: "3 tbsp", cat: "grocery" },
      { name: "Saffron", qty: "a pinch", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
    ],
    steps: "1. Marinate prawns with turmeric, chili, lemon juice & salt for 30 mins.\n2. Fry onions until golden brown.\n3. Add garlic, ginger, tomatoes & biryani masala, cook 5 mins.\n4. Add prawns, cook 5 mins only (don't overcook!).\n5. Add yogurt & coconut milk, simmer 5 mins.\n6. Par-boil rice until 70% done. Drain.\n7. Layer prawn masala → rice → mint → coriander → saffron → ghee.\n8. Seal & cook on low heat 20 mins.\n9. Gently mix before serving."
  },
  "vegetable biryani": {
    name: "Vegetable Biryani",
    emoji: "🥦",
    description: "Colourful aromatic mixed vegetable biryani",
    serves: "4 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Carrot", qty: "2", cat: "grocery" },
      { name: "Potato", qty: "2", cat: "grocery" },
      { name: "Green beans", qty: "100g", cat: "grocery" },
      { name: "Green peas", qty: "½ cup", cat: "grocery" },
      { name: "Cauliflower", qty: "1 cup", cat: "grocery" },
      { name: "Onion", qty: "2 large", cat: "grocery" },
      { name: "Tomatoes", qty: "2", cat: "grocery" },
      { name: "Yogurt", qty: "½ cup", cat: "grocery" },
      { name: "Garlic", qty: "4 cloves", cat: "grocery" },
      { name: "Ginger", qty: "1 inch", cat: "grocery" },
      { name: "Biryani masala", qty: "2 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Saffron", qty: "a pinch", cat: "grocery" },
      { name: "Mint leaves", qty: "handful", cat: "grocery" },
      { name: "Coriander leaves", qty: "handful", cat: "grocery" },
      { name: "Ghee", qty: "3 tbsp", cat: "grocery" },
      { name: "Whole spices (cinnamon, cardamom, cloves)", qty: "mixed", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
    ],
    steps: "1. Fry onions until golden, set aside half for layering.\n2. Add whole spices, garlic & ginger, fry 1 min.\n3. Add tomatoes & biryani masala, cook until oil separates.\n4. Add all vegetables, stir fry 5 mins.\n5. Add yogurt, mix well, cook on low heat 10 mins.\n6. Par-boil rice with whole spices until 70% done. Drain.\n7. Layer vegetables → rice → fried onions → mint → coriander → saffron → ghee.\n8. Seal & cook on very low heat 25 mins.\n9. Rest 5 mins, mix gently before serving."
  },
  "egg biryani": {
    name: "Egg Biryani",
    emoji: "🥚",
    description: "Quick & delicious spiced egg biryani",
    serves: "3 people",
    ingredients: [
      { name: "Basmati rice", qty: "2 cups", cat: "grocery" },
      { name: "Eggs", qty: "6", cat: "grocery" },
      { name: "Onion", qty: "2 large", cat: "grocery" },
      { name: "Tomatoes", qty: "2", cat: "grocery" },
      { name: "Yogurt", qty: "½ cup", cat: "grocery" },
      { name: "Garlic", qty: "4 cloves", cat: "grocery" },
      { name: "Ginger", qty: "1 inch", cat: "grocery" },
      { name: "Green chili", qty: "2", cat: "grocery" },
      { name: "Biryani masala", qty: "2 tbsp", cat: "grocery" },
      { name: "Turmeric", qty: "½ tsp", cat: "grocery" },
      { name: "Red chili powder", qty: "½ tsp", cat: "grocery" },
      { name: "Mint leaves", qty: "handful", cat: "grocery" },
      { name: "Coriander leaves", qty: "handful", cat: "grocery" },
      { name: "Saffron", qty: "a pinch", cat: "grocery" },
      { name: "Ghee", qty: "2 tbsp", cat: "grocery" },
      { name: "Oil", qty: "3 tbsp", cat: "grocery" },
      { name: "Salt", qty: "to taste", cat: "grocery" },
    ],
    steps: "1. Hard boil eggs, peel & make shallow cuts on each.\n2. Fry eggs in little oil until golden on outside. Set aside.\n3. Fry onions until golden brown.\n4. Add garlic, ginger, green chili, cook 2 mins.\n5. Add tomatoes, biryani masala, turmeric, chili powder.\n6. Cook until oil separates, add yogurt & mix.\n7. Gently add fried eggs to masala, coat well.\n8. Par-boil rice until 70% done. Drain.\n9. Layer egg masala → rice → mint → coriander → saffron → ghee.\n10. Seal & cook on low heat 20 mins."
  },
  "ice cream": {
    name: "Vanilla Ice Cream",
    emoji: "🍦",
    description: "Creamy homemade vanilla ice cream",
    serves: "6 people",
    ingredients: [
      { name: "Heavy cream", qty: "500ml", cat: "grocery" },
      { name: "Whole milk", qty: "250ml", cat: "grocery" },
      { name: "Sugar", qty: "150g", cat: "grocery" },
      { name: "Egg yolks", qty: "4", cat: "grocery" },
      { name: "Vanilla essence", qty: "2 tsp", cat: "grocery" },
      { name: "Salt", qty: "pinch", cat: "grocery" },
    ],
    steps: "1. Heat milk & cream until steaming.\n2. Whisk egg yolks & sugar until pale.\n3. Slowly pour hot milk into eggs.\n4. Return to pan, stir on low heat until thickened.\n5. Add vanilla & salt, cool completely.\n6. Churn in ice cream maker or freeze 6 hrs.\n7. Stir every hour to avoid ice crystals."
  },
  "sandwich": {
    name: "Club Sandwich",
    emoji: "🥪",
    description: "Classic triple-decker club sandwich",
    serves: "2 people",
    ingredients: [
      { name: "Bread slices", qty: "6", cat: "grocery" },
      { name: "Chicken breast (cooked)", qty: "200g", cat: "grocery" },
      { name: "Eggs", qty: "2", cat: "grocery" },
      { name: "Lettuce leaves", qty: "4", cat: "grocery" },
      { name: "Tomato", qty: "1", cat: "grocery" },
      { name: "Cheese slices", qty: "4", cat: "grocery" },
      { name: "Mayonnaise", qty: "3 tbsp", cat: "grocery" },
      { name: "Butter", qty: "2 tbsp", cat: "grocery" },
      { name: "Salt & pepper", qty: "to taste", cat: "grocery" },
    ],
    steps: "1. Toast bread slices lightly.\n2. Hard boil & slice eggs.\n3. Slice chicken & tomato.\n4. Spread mayo on bread.\n5. Layer: bread, lettuce, chicken, tomato.\n6. Add second bread slice.\n7. Layer egg, cheese, lettuce.\n8. Top with final bread slice, cut diagonally."
  },
};

// Recipe trigger words
const RECIPE_WORDS = ["recipe","how to make","how do i make","how to cook","how do i cook","ingredients for","make me","teach me","what do i need for","steps for","prepare"];


function detectCategory(word) {
  const w = word.toLowerCase().trim();
  // Check in priority order: household first to avoid kitchen items going to wrong category
  const order = ["household", "food", "clothing", "grocery"];
  for (const cat of order) {
    if (KEYWORDS[cat].some(kw => w === kw || w.includes(kw) || kw.includes(w))) return cat;
  }
  return null;
}

function extractItems(text) {
  let clean = text.toLowerCase()
    .replace(/\b(please|pls|can you|could you|i need|i want|add|buy|get|purchase|pick up|order|to buy|to get|to the list|to my list|to groceries|to food|to clothing|to household|some|a few|few|couple of|bunch of|lots of|lot of|the|an|a)\b/gi, " ")
    .replace(/\s+/g, " ").trim();
  return clean.split(/,|&|\band\b/).map(s => s.trim()).filter(s => s.length > 1);
}

function processMessage(text, lists) {
  const lower = text.toLowerCase().trim();

  // Greeting
  if (GREETINGS.some(g => lower === g || lower.startsWith(g + " ") || lower.startsWith(g + "!"))) {
    return { response: "Hey there! 👋 I'm your offline shopping assistant.\n\nJust tell me what you need and I'll sort it automatically!\n\nExamples:\n• \"Add milk, eggs and bread\"\n• \"I need a jacket\"\n• \"Buy broom and mop\"\n• Type \"help\" for all commands", actions: [] };
  }

  // Help
  if (HELP_WORDS.some(h => lower.includes(h))) {
    return {
      response: "Here's what I can do 🤖\n\n➕ ADD items:\n\"Add milk and eggs\"\n\"I need a jacket\"\n\n🍳 RECIPES (auto-adds ingredients!):\n\"Recipe for wattalapam\"\n\"How to make chocolate cake\"\n\"Chicken curry recipe\"\n\"Show all recipes\"\n\n✅ MARK as done:\n\"Milk is done\"\n\n🗑️ REMOVE items:\n\"Remove milk\"\n\n🧹 CLEAR list:\n\"Clear groceries\"\n\"Clear all\"\n\n📋 SHOW list:\n\"Show my list\"\n\n💰 SET PRICE:\n\"Price for egg 43\"",
      actions: []
    };
  }

  // Show all recipes — must be checked BEFORE the general "show list" handler
  if (lower.includes("show all recipes") || lower.includes("list recipes") || lower.includes("what recipes") || lower.includes("all recipes") || lower.includes("recipes list") || lower.includes("show recipes")) {
    const recipeList = Object.values(RECIPES).map((r, i) => `${i + 1}. ${r.emoji} ${r.name} — ${r.description}`).join("\n");
    return {
      response: `Here are all my recipes 🍳\n\n${recipeList}\n\n👉 Just say "recipe for [name]" to get full ingredients & steps!`,
      actions: []
    };
  }

  // Show list
  if (SHOW_WORDS.some(w => lower.includes(w)) && !lower.includes("add") && !lower.includes("buy") && !lower.includes("need") && !lower.includes("delete") && !lower.includes("remove") && !lower.includes("clear") && !lower.includes("empty")) {
    let cat = null;
    for (const key of Object.keys(CATEGORIES)) {
      if (lower.includes(key) || lower.includes(CATEGORIES[key].label.toLowerCase())) { cat = key; break; }
    }
    const targetLists = cat ? { [cat]: lists[cat] } : lists;
    const lines = [];
    for (const [c, items] of Object.entries(targetLists)) {
      const pending = (items || []).filter(i => !i.done);
      if (pending.length > 0) lines.push(`${CATEGORIES[c].emoji} ${CATEGORIES[c].label}:\n  ${pending.map(i => `• ${i.name}`).join("\n  ")}`);
    }
    if (lines.length === 0) return { response: "Your lists are empty! Tell me what to add 🛒", actions: [] };
    return { response: `Here's what you need:\n\n${lines.join("\n\n")}`, actions: [] };
  }

  // Clear list — "delete everything in household", "clear all", "remove all from food"
  const isClearIntent = /delete\s+every|remove\s+every|delete\s+all|remove\s+all|clear\s+every|wipe\s+every|empty\s+every/.test(lower);
  if (CLEAR_WORDS.some(w => lower.includes(w)) || isClearIntent) {
    let cat = null;
    for (const key of Object.keys(CATEGORIES)) {
      if (lower.includes(key) || lower.includes(CATEGORIES[key].label.toLowerCase())) { cat = key; break; }
    }
    return { response: cat ? `🧹 Cleared your ${CATEGORIES[cat].label} list!` : "🧹 Cleared all your lists!", actions: [{ type: "clear", category: cat || "all" }] };
  }
  // Single category clear like "clear groceries"
  if (lower.startsWith("clear ") || lower.startsWith("empty ")) {
    for (const key of Object.keys(CATEGORIES)) {
      if (lower.includes(key) || lower.includes(CATEGORIES[key].label.toLowerCase())) {
        return { response: `🧹 Cleared your ${CATEGORIES[key].label} list!`, actions: [{ type: "clear", category: key }] };
      }
    }
  }

  // Recipe lookup
  if (RECIPE_WORDS.some(w => lower.includes(w)) || lower.startsWith("recipe")) {
    const found = Object.entries(RECIPES).find(([key]) => lower.includes(key));
    if (found) {
      const [, recipe] = found;
      return { response: null, recipe, actions: [] };
    }
    const recipeList = Object.values(RECIPES).map(r => `${r.emoji} ${r.name}`).join("\n");
    return { response: `I know these recipes! Just ask "recipe for [name]":\n\n${recipeList}`, actions: [] };
  }

  // Direct recipe name (e.g. just "wattalapam" or "chocolate cake")
  const directRecipe = Object.entries(RECIPES).find(([key]) => lower.includes(key));
  if (directRecipe && !lower.includes("add") && !lower.includes("buy") && !lower.includes("remove")) {
    const [, recipe] = directRecipe;
    return { response: null, recipe, actions: [] };
  }
  // e.g. "price for butter 1200", "butter price 1200", "butter is 1200", "butter costs 1200", "set butter to 1200"
  const priceNumMatch = lower.match(/([\d.]+)/);
  const hasPriceWord = /price|cost|costs|rs|rupee|rupees|set.*to|is\s+\d|for\s+\w+\s+\d/.test(lower);
  if (priceNumMatch && hasPriceWord) {
    const price = parseFloat(priceNumMatch[1]);
    // Strip all price-related words and numbers to isolate the item name
    const stripped = lower
      .replace(/price\s*(for|of)?|costs?|rs\.?|rupees?|set|update|change|to|is|=|\d+(\.\d+)?/gi, " ")
      .replace(/\s+/g, " ").trim();
    if (stripped.length > 0 && !isNaN(price)) {
      for (const [c, citems] of Object.entries(lists)) {
        const found = (citems || []).find(i =>
          stripped.includes(i.name.toLowerCase()) ||
          i.name.toLowerCase().includes(stripped)
        );
        if (found) {
          return {
            response: `💰 Updated! ${found.name} price set to Rs ${price}`,
            actions: [{ type: "setprice", category: c, item: found.name, price }]
          };
        }
      }
    }
  }

  // Mark as done
  if (DONE_WORDS.some(w => lower.includes(w))) {
    const items = extractItems(text);
    const completed = [];
    for (const item of items) {
      for (const [c, citems] of Object.entries(lists)) {
        const found = (citems || []).find(i => i.name.toLowerCase().includes(item.toLowerCase()));
        if (found) { completed.push({ type: "complete", category: c, item: found.name }); break; }
      }
    }
    if (completed.length > 0) return { response: `✅ Marked as done: ${completed.map(c => c.item).join(", ")}`, actions: completed };
    return { response: "I couldn't find those items. Try \"show my list\" to see what's there.", actions: [] };
  }

  // Remove items
  if (REMOVE_WORDS.some(w => lower.includes(w))) {
    const cleaned = text.replace(new RegExp(REMOVE_WORDS.join("|"), "gi"), "");
    const items = extractItems(cleaned);
    const removed = [];
    for (const item of items) {
      for (const [c, citems] of Object.entries(lists)) {
        const found = (citems || []).find(i => i.name.toLowerCase().includes(item.toLowerCase()));
        if (found) { removed.push({ type: "remove", category: c, item: found.name }); break; }
      }
    }
    if (removed.length > 0) return { response: `🗑️ Removed: ${removed.map(r => r.item).join(", ")}`, actions: removed };
    return { response: "I couldn't find those items to remove.", actions: [] };
  }

  // ADD items (default)
  const items = extractItems(text);
  const actions = [];
  const grouped = { grocery: [], food: [], clothing: [], household: [] };

  for (const item of items) {
    if (!item || item.length < 2) continue;
    let forcedCat = null;
    for (const key of Object.keys(CATEGORIES)) {
      if (lower.includes(`to ${key}`) || lower.includes(`in ${key}`) ||
          lower.includes(`to ${CATEGORIES[key].label.toLowerCase()}`) ||
          lower.includes(`in ${CATEGORIES[key].label.toLowerCase()}`)) {
        forcedCat = key; break;
      }
    }
    const cat = forcedCat || detectCategory(item) || "grocery";
    const name = item.charAt(0).toUpperCase() + item.slice(1);
    grouped[cat].push(name);
    actions.push({ type: "add", category: cat, item: name, quantity: "1", priority: "medium" });
  }

  if (actions.length > 0) {
    const lines = Object.entries(grouped).filter(([, its]) => its.length > 0)
      .map(([cat, its]) => `${CATEGORIES[cat].emoji} ${CATEGORIES[cat].label}: ${its.join(", ")}`);
    return { response: `✅ Added ${actions.length} item${actions.length > 1 ? "s" : ""}!\n\n${lines.join("\n")}`, actions };
  }

  return { response: "Hmm, I'm not sure what to do 🤔\n\nTry:\n• \"Add milk, eggs, bread\"\n• \"I need a jacket\"\n• \"Remove sugar\"\n• \"Show my list\"\n• Type \"help\" for all commands", actions: [] };
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ─── Main App ─────────────────────────────────────────────────────────────────

function scaleQty(qty, baseServes, newServes) {
  if (!qty) return "";
  const qtyStr = String(qty);
  if (qtyStr === "to taste" || qtyStr === "as needed" || qtyStr === "mixed" || qtyStr === "a few" || qtyStr === "handful" || qtyStr === "a pinch" || qtyStr === "pinch") return qtyStr;
  const base = parseInt(String(baseServes)) || 4;
  const ratio = newServes / base;
  const match = qtyStr.match(/^([\d./]+)\s*(.*)/);
  if (!match) return qtyStr;
  let num;
  if (match[1].includes("/")) {
    const parts = match[1].split("/");
    num = parseFloat(parts[0]) / parseFloat(parts[1]);
  } else {
    num = parseFloat(match[1]);
  }
  if (isNaN(num)) return qtyStr;
  const unit = String(match[2] || "").trim();
  let scaled = num * ratio;
  if (scaled % 1 !== 0) scaled = Math.round(scaled * 4) / 4;
  let numStr;
  if (scaled === 0.25) numStr = "¼";
  else if (scaled === 0.5) numStr = "½";
  else if (scaled === 0.75) numStr = "¾";
  else if (scaled === 1.25) numStr = "1¼";
  else if (scaled === 1.5) numStr = "1½";
  else if (scaled === 1.75) numStr = "1¾";
  else numStr = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
  return unit ? numStr + " " + unit : numStr;
}

function RecipeCard({ recipe, onAddToList }) {
  const baseServes = parseInt(recipe.serves) || 4;
  const [serves, setServes] = useState(baseServes);
  const [added, setAdded] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleAdd = () => {
    const actions = recipe.ingredients.map(ing => ({
      type: "add", category: ing.cat, item: ing.name,
      quantity: scaleQty(ing.qty, baseServes, serves), priority: "medium"
    }));
    onAddToList(actions);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px", fontSize: 13, maxWidth: "82%" }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{recipe.emoji} {recipe.name}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 10 }}>{recipe.description}</div>

      {/* Serving adjuster */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, background: "rgba(74,222,128,0.08)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(74,222,128,0.2)" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1 }}>👥 Servings</span>
        <button onClick={() => setServes(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 16, cursor: "pointer", fontWeight: 800, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#4ade80", minWidth: 24, textAlign: "center" }}>{serves}</span>
        <button onClick={() => setServes(s => s + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 16, cursor: "pointer", fontWeight: 800, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
      </div>

      {/* Ingredients */}
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#4ade80", fontSize: 12 }}>📝 Ingredients</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
        {recipe.ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{ing.name}</span>
            <span style={{ color: "#4ade80", fontWeight: 700 }}>{scaleQty(ing.qty, baseServes, serves)}</span>
          </div>
        ))}
      </div>

      {/* Steps toggle */}
      <button onClick={() => setShowSteps(s => !s)} style={{ width: "100%", padding: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", marginBottom: showSteps ? 8 : 12 }}>
        {showSteps ? "▲ Hide Steps" : "▼ Show Cooking Steps"}
      </button>
      {showSteps && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 12, whiteSpace: "pre-wrap" }}>
          {recipe.steps}
        </div>
      )}

      {/* Add to list button */}
      <button onClick={handleAdd} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: added ? "rgba(74,222,128,0.2)" : "linear-gradient(135deg,#4ade80,#22c55e)", color: added ? "#4ade80" : "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
        {added ? "✅ Added to list!" : `🛒 Add ${serves} servings to list`}
      </button>
    </div>
  );
}

export default function App() {
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem("smart-shopper-lists");
      return saved ? JSON.parse(saved) : { grocery: [], food: [], clothing: [], household: [] };
    } catch { return { grocery: [], food: [], clothing: [], household: [] }; }
  });

  const [activeTab, setActiveTab] = useState("chat");
  const [activeCategory, setActiveCategory] = useState("grocery");
  const [newItem, setNewItem] = useState({ name: "", quantity: "", priority: "medium", estimatedPrice: "" });
  const [filterCat, setFilterCat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [quickInput, setQuickInput] = useState("");
  const [quickCat, setQuickCat] = useState("grocery");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hey! 👋 I'm your offline AI assistant.\n\nI know Sri Lankan & international recipes! Just ask:\n• \"Recipe for wattalapam\"\n• \"How to make chocolate cake\"\n• \"Chicken curry recipe\"\n\nI'll show ingredients & steps, and add everything to your shopping list automatically! 🛒\n\nType \"help\" for all commands or \"show all recipes\" to see what I know!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem("smart-shopper-lists", JSON.stringify(lists)); } catch {}
  }, [lists]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const showToast = (msg, color = "#4ade80") => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  const applyActions = (actions) => {
    setLists(prev => {
      let updated = { ...prev };
      for (const a of actions) {
        if (a.type === "add") {
          const exists = (updated[a.category] || []).find(i => i.name.toLowerCase() === a.item.toLowerCase());
          if (!exists) updated[a.category] = [...(updated[a.category] || []), { id: generateId(), name: a.item, quantity: a.quantity || "1", priority: a.priority || "medium", estimatedPrice: null, done: false, createdAt: Date.now() }];
        } else if (a.type === "setprice") {
          updated[a.category] = (updated[a.category] || []).map(i => i.name.toLowerCase() === a.item.toLowerCase() ? { ...i, estimatedPrice: a.price } : i);
        } else if (a.type === "remove") {
          updated[a.category] = (updated[a.category] || []).filter(i => i.name.toLowerCase() !== a.item.toLowerCase());
        } else if (a.type === "complete") {
          updated[a.category] = (updated[a.category] || []).map(i => i.name.toLowerCase() === a.item.toLowerCase() ? { ...i, done: true } : i);
        } else if (a.type === "clear") {
          if (a.category === "all") updated = { grocery: [], food: [], clothing: [], household: [] };
          else updated[a.category] = [];
        }
      }
      return updated;
    });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setIsTyping(true);
    setTimeout(() => {
      const result = processMessage(userText, lists);
      if (result.recipe) {
        setMessages(prev => [...prev, { role: "ai", recipe: result.recipe }]);
      } else {
        if (result.actions && result.actions.length > 0) applyActions(result.actions);
        setMessages(prev => [...prev, { role: "ai", text: result.response }]);
        if (result.actions && result.actions.filter(a => a.type === "add").length > 0) showToast("✅ Items added to list!");
      }
      setIsTyping(false);
    }, 400);
  };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const item = { id: generateId(), name: newItem.name.trim(), quantity: newItem.quantity || "1", priority: newItem.priority, estimatedPrice: newItem.estimatedPrice ? parseFloat(newItem.estimatedPrice) : null, done: false, createdAt: Date.now() };
    setLists(prev => ({ ...prev, [activeCategory]: [...(prev[activeCategory] || []), item] }));
    setNewItem({ name: "", quantity: "", priority: "medium", estimatedPrice: "" });
    showToast(`✅ ${item.name} added!`);
  };

  const quickAdd = () => {
    if (!quickInput.trim()) return;
    const items = quickInput.split(",").map(s => s.trim()).filter(Boolean);
    const newItems = items.map(name => ({ id: generateId(), name, quantity: "1", priority: "medium", estimatedPrice: null, done: false, createdAt: Date.now() }));
    setLists(prev => ({ ...prev, [quickCat]: [...(prev[quickCat] || []), ...newItems] }));
    setQuickInput("");
    showToast(`✅ ${newItems.length} item${newItems.length > 1 ? "s" : ""} added!`);
  };

  const toggleDone = (cat, id) => setLists(prev => ({ ...prev, [cat]: (prev[cat] || []).map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  const removeItem = (cat, id) => { setLists(prev => ({ ...prev, [cat]: (prev[cat] || []).filter(i => i.id !== id) })); showToast("🗑️ Removed", "#f87171"); };
  const clearDone = (cat) => { setLists(prev => ({ ...prev, [cat]: (prev[cat] || []).filter(i => !i.done) })); showToast("🧹 Cleared done items!"); };
  const saveEdit = () => {
    if (!editItem) return;
    setLists(prev => ({ ...prev, [editItem.cat]: (prev[editItem.cat] || []).map(i => i.id === editItem.id ? { ...i, name: editItem.name, quantity: editItem.quantity, priority: editItem.priority, estimatedPrice: editItem.estimatedPrice ? parseFloat(editItem.estimatedPrice) : null } : i) }));
    setEditItem(null); showToast("✏️ Updated!");
  };

  const allItems = Object.entries(lists).flatMap(([cat, items]) => (items || []).map(i => ({ ...i, cat })));
  const filteredItems = allItems.filter(i => (filterCat === "all" || i.cat === filterCat) && i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalItems = allItems.length;
  const doneItems = allItems.filter(i => i.done).length;
  const totalBudget = allItems.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

  const SUGGESTIONS = ["Recipe for wattalapam", "Chocolate cake recipe", "Chicken curry recipe", "Show all recipes", "Add milk, eggs, bread", "help"];

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#f0f0f5", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle,rgba(74,222,128,0.07),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.07),transparent 70%)", pointerEvents: "none" }} />

      {toast && <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#000", padding: "10px 20px", borderRadius: 24, fontWeight: 800, fontSize: 13, zIndex: 999, boxShadow: `0 4px 24px ${toast.color}66`, whiteSpace: "nowrap", animation: "slideDown 0.3s ease" }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ padding: "14px 14px 0", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4ade80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🛒</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Smart Shopper</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>🤖 Offline AI • Works without internet</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#4ade80" }}>{doneItems}/{totalItems}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>done</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <div key={key} style={{ flex: "1 1 calc(25% - 6px)", minWidth: 54, background: val.bg, borderRadius: 10, padding: "7px 4px", textAlign: "center", border: `1px solid ${val.color}22`, cursor: "pointer" }} onClick={() => { setActiveTab("lists"); setFilterCat(key); }}>
              <div style={{ fontSize: 13 }}>{val.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: val.color }}>{(lists[key] || []).length}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{val.label}</div>
            </div>
          ))}
          {totalBudget > 0 && (
            <div style={{ flex: "1 1 calc(25% - 6px)", minWidth: 54, background: "rgba(250,204,21,0.08)", borderRadius: 10, padding: "7px 4px", textAlign: "center", border: "1px solid rgba(250,204,21,0.2)" }}>
              <div style={{ fontSize: 13 }}>💰</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#facc15" }}>Rs{totalBudget.toFixed(0)}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>budget</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[["chat", "🤖 AI Chat"], ["lists", "📋 Lists"], ["add", "➕ Add"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "8px 0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, borderRadius: "8px 8px 0 0", background: activeTab === tab ? "#111118" : "transparent", color: activeTab === tab ? "#4ade80" : "rgba(255,255,255,0.35)", borderBottom: activeTab === tab ? "2px solid #4ade80" : "2px solid transparent" }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10, maxHeight: "calc(100vh - 290px)" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                {msg.role === "ai" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4ade80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>}
                {msg.recipe ? (
                  <RecipeCard recipe={msg.recipe} onAddToList={(actions) => { applyActions(actions); showToast("✅ Ingredients added to list!"); }} />
                ) : (
                  <div style={{ maxWidth: "78%", padding: "10px 13px", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "linear-gradient(135deg,#4ade80,#22c55e)" : "rgba(255,255,255,0.07)", color: msg.role === "user" ? "#000" : "#f0f0f5", fontWeight: msg.role === "user" ? 700 : 400, border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none" }}>{msg.text || ""}</div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4ade80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
                <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.07)", borderRadius: "16px 16px 16px 4px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 4 }}>
                  {[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "bounce 1s infinite", animationDelay: `${d*0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "6px 14px", display: "flex", gap: 5, overflowX: "auto" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setChatInput(s)} style={{ whiteSpace: "nowrap", padding: "5px 10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", fontSize: 11, cursor: "pointer" }}>{s}</button>
            ))}
          </div>

          <div style={{ padding: "8px 14px 18px", display: "flex", gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Tell me what you need..." style={{ flex: 1, padding: "11px 14px", borderRadius: 22, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#f0f0f5", fontSize: 13, outline: "none" }} />
            <button onClick={sendChat} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#4ade80,#22c55e)", color: "#000", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>➤</button>
          </div>
        </div>
      )}

      {/* ── LISTS TAB ── */}
      {activeTab === "lists" && (
        <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="🔍 Search items..." style={{ width: "100%", padding: "10px 13px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#f0f0f5", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
            {[["all", "🗂️ All"], ...Object.entries(CATEGORIES).map(([k, v]) => [k, `${v.emoji} ${v.label}`])].map(([key, label]) => (
              <button key={key} onClick={() => setFilterCat(key)} style={{ padding: "5px 10px", borderRadius: 14, border: `1px solid ${filterCat === key ? "#4ade80" : "rgba(255,255,255,0.1)"}`, background: filterCat === key ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)", color: filterCat === key ? "#4ade80" : "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>
            ))}
          </div>
          {totalItems > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}><span>Progress</span><span>{Math.round((doneItems / totalItems) * 100)}%</span></div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(doneItems / totalItems) * 100}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 10, transition: "width 0.4s" }} />
              </div>
            </div>
          )}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Nothing here yet!</div>
              <div style={{ fontSize: 12, marginTop: 5 }}>Use AI Chat or ➕ Add tab</div>
            </div>
          ) : (
            (filterCat === "all" ? Object.keys(CATEGORIES) : [filterCat]).map(cat => {
              const items = filteredItems.filter(i => i.cat === cat);
              if (!items.length) return null;
              const val = CATEGORIES[cat];
              const doneCat = items.filter(i => i.done).length;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                    <span>{val.emoji}</span>
                    <span style={{ fontWeight: 800, fontSize: 12, color: val.color }}>{val.label}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{doneCat}/{items.length}</span>
                    {doneCat > 0 && <button onClick={() => clearDone(cat)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 7, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", cursor: "pointer" }}>Clear done</button>}
                  </div>
                  {items.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 11px", background: item.done ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)", borderRadius: 11, marginBottom: 5, border: `1px solid ${item.done ? "rgba(255,255,255,0.04)" : val.color + "22"}` }}>
                      <button onClick={() => toggleDone(item.cat, item.id)} style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, cursor: "pointer", border: `2px solid ${item.done ? "#4ade80" : "rgba(255,255,255,0.25)"}`, background: item.done ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#000" }}>{item.done ? "✓" : ""}</button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, textDecoration: item.done ? "line-through" : "none", color: item.done ? "rgba(255,255,255,0.3)" : "#f0f0f5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                        <div style={{ display: "flex", gap: 7, marginTop: 2 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Qty: {item.quantity}</span>
                          {item.estimatedPrice && <span style={{ fontSize: 10, color: "#facc15" }}>Rs {item.estimatedPrice}</span>}
                          <span style={{ fontSize: 10, color: PRIORITY_COLORS[item.priority] }}>● {item.priority}</span>
                        </div>
                      </div>
                      <button onClick={() => setEditItem({ ...item, estimatedPrice: item.estimatedPrice || "" })} style={{ width: 26, height: 26, borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>✏️</button>
                      <button onClick={() => removeItem(item.cat, item.id)} style={{ width: 26, height: 26, borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 14, fontWeight: 800 }}>×</button>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── ADD TAB ── */}
      {activeTab === "add" && (
        <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: 1 }}>STEP 1 — CHOOSE CATEGORY</div>
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <button key={key} onClick={() => { setActiveCategory(key); setQuickCat(key); }} style={{ flex: 1, padding: "11px 3px", borderRadius: 11, border: `2px solid ${activeCategory === key ? val.color : "rgba(255,255,255,0.07)"}`, background: activeCategory === key ? val.bg : "rgba(255,255,255,0.03)", color: activeCategory === key ? val.color : "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 800, cursor: "pointer", textAlign: "center", boxShadow: activeCategory === key ? `0 0 12px ${val.color}44` : "none" }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{val.emoji}</div>{val.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 13, padding: 13, marginBottom: 11, border: `1px solid ${CATEGORIES[activeCategory].color}33` }}>
            <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 7, color: CATEGORIES[activeCategory].color }}>⚡ Quick Add to {CATEGORIES[activeCategory].label}</div>
            <div style={{ display: "flex", gap: 7 }}>
              <input value={quickInput} onChange={e => setQuickInput(e.target.value)} onKeyDown={e => e.key === "Enter" && quickAdd()} placeholder="milk, eggs, bread" style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: `1px solid ${CATEGORIES[activeCategory].color}44`, background: "rgba(255,255,255,0.06)", color: "#f0f0f5", fontSize: 13, outline: "none" }} />
              <button onClick={quickAdd} style={{ padding: "9px 13px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: CATEGORIES[activeCategory].color, color: "#000" }}>Add ✓</button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 13, padding: 13, border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 11, color: "rgba(255,255,255,0.6)" }}>🔍 Add with Details</div>
            {[["ITEM NAME", "name", "e.g. Whole Milk", "text"], ["QUANTITY", "quantity", "e.g. 2 litres", "text"], ["PRICE (Rs)", "estimatedPrice", "e.g. 350", "number"]].map(([label, key, ph, type]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
                <input type={type} value={newItem[key]} onChange={e => setNewItem(prev => ({ ...prev, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#f0f0f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 11 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>PRIORITY</div>
              <div style={{ display: "flex", gap: 5 }}>
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setNewItem(prev => ({ ...prev, priority: p }))} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${newItem.priority === p ? PRIORITY_COLORS[p] : "rgba(255,255,255,0.1)"}`, background: newItem.priority === p ? `${PRIORITY_COLORS[p]}22` : "transparent", color: newItem.priority === p ? PRIORITY_COLORS[p] : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>● {p}</button>
                ))}
              </div>
            </div>
            <button onClick={addItem} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", cursor: "pointer", background: CATEGORIES[activeCategory].color, color: "#000", fontWeight: 800, fontSize: 13 }}>Add to {CATEGORIES[activeCategory].label} ✓</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, padding: 14 }} onClick={() => setEditItem(null)}>
          <div style={{ width: "100%", maxWidth: 480, background: "#111118", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 13 }}>✏️ Edit Item</div>
            {[["Item Name", "name", "text"], ["Quantity", "quantity", "text"], ["Price (Rs)", "estimatedPrice", "number"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
                <input type={type} value={editItem[key]} onChange={e => setEditItem(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#f0f0f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>PRIORITY</div>
              <div style={{ display: "flex", gap: 5 }}>
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setEditItem(prev => ({ ...prev, priority: p }))} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${editItem.priority === p ? PRIORITY_COLORS[p] : "rgba(255,255,255,0.1)"}`, background: editItem.priority === p ? `${PRIORITY_COLORS[p]}22` : "transparent", color: editItem.priority === p ? PRIORITY_COLORS[p] : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>● {p}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => setEditItem(null)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveEdit} style={{ flex: 2, padding: 10, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ade80,#22c55e)", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        *{box-sizing:border-box}
        input::placeholder{color:rgba(255,255,255,0.22)}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        button{transition:opacity 0.15s,transform 0.15s}
        button:active{opacity:0.8;transform:scale(0.97)}
      `}</style>
    </div>
  );
}
