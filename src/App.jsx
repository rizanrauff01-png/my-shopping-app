import { useState, useEffect, useRef, useCallback } from "react";

// ─── Fuzzy Match ─────────────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_,i) => Array.from({length: n+1}, (_,j) => i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

const KNOWN_ITEMS = [
  "milk","eggs","bread","butter","rice","flour","sugar","salt","oil","onion","garlic","potato","tomato","carrot",
  "apple","banana","orange","cheese","yogurt","cream","cereal","oats","pasta","tea","coffee","chocolate","honey",
  "chicken","beef","fish","prawns","spinach","broccoli","cabbage","cucumber","mushroom","avocado","lemon","lime",
  "coconut milk","curry powder","turmeric","ginger","cinnamon","cardamom","saffron","vanilla","baking powder",
  "soap","detergent","shampoo","toothpaste","toilet paper","sponge","broom","mop","towel","tissue",
  "shirt","pants","dress","shoes","socks","jacket","jeans","bag","wallet","cap",
  "pizza","burger","juice","soda","cake","chips","ice cream","sandwich","noodles","ramen",
  "goraka","pandan","rampe","maldive fish","jaggery","semolina","treacle","jak fruit","breadfruit","drumstick",
];

function fuzzyMatch(input) {
  const word = input.toLowerCase().trim();
  const scored = KNOWN_ITEMS.map(item => ({
    item, score: levenshtein(word, item),
    startsWith: item.startsWith(word) || word.startsWith(item.split(" ")[0])
  }));
  return scored
    .filter(x => x.score <= Math.max(2, Math.floor(word.length * 0.4)) || x.startsWith)
    .sort((a,b) => (a.startsWith===b.startsWith ? a.score-b.score : a.startsWith?-1:1))
    .slice(0,4).map(x=>x.item);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = {
  grocery:   { label:"Groceries",    emoji:"🥦", color:"#4ade80", bg:"rgba(74,222,128,0.1)"  },
  food:      { label:"Food & Drinks",emoji:"🍔", color:"#fb923c", bg:"rgba(251,146,60,0.1)"  },
  clothing:  { label:"Clothing",     emoji:"👗", color:"#a78bfa", bg:"rgba(167,139,250,0.1)" },
  household: { label:"Household",    emoji:"🏠", color:"#38bdf8", bg:"rgba(56,189,248,0.1)"  },
};
const PRIORITIES = ["high","medium","low"];
const PRIORITY_COLORS = { high:"#f87171", medium:"#fbbf24", low:"#4ade80" };

const STORE_SECTIONS = {
  produce:   { label:"Produce",       emoji:"🥬", color:"#4ade80" },
  dairy:     { label:"Dairy & Eggs",  emoji:"🥛", color:"#facc15" },
  bakery:    { label:"Bakery",        emoji:"🍞", color:"#fb923c" },
  meat:      { label:"Meat & Fish",   emoji:"🥩", color:"#f87171" },
  frozen:    { label:"Frozen",        emoji:"🧊", color:"#38bdf8" },
  pantry:    { label:"Pantry",        emoji:"🥫", color:"#a78bfa" },
  household: { label:"Household",     emoji:"🧹", color:"#94a3b8" },
  clothing:  { label:"Clothing",      emoji:"👔", color:"#c084fc" },
};
const SECTION_MAP = {
  milk:"dairy",eggs:"dairy",butter:"dairy",cheese:"dairy",yogurt:"dairy",cream:"dairy",
  bread:"bakery",biscuits:"bakery",biscuit:"bakery",cake:"bakery",muffin:"bakery",
  chicken:"meat",fish:"meat",beef:"meat",mutton:"meat",prawn:"meat",prawns:"meat",
  rice:"pantry",flour:"pantry",sugar:"pantry",salt:"pantry",oil:"pantry",pasta:"pantry",
  lentils:"pantry",dal:"pantry",oats:"pantry",cereal:"pantry",sauce:"pantry",vinegar:"pantry",
  apple:"produce",banana:"produce",orange:"produce",tomato:"produce",onion:"produce",
  carrot:"produce",spinach:"produce",broccoli:"produce",potato:"produce",garlic:"produce",
  "ice cream":"frozen","frozen peas":"frozen",
  soap:"household",detergent:"household",broom:"household",mop:"household",
  shirt:"clothing",pants:"clothing",dress:"clothing",shoes:"clothing",
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MEALS = ["Breakfast","Lunch","Dinner"];

// ─── Extended Recipe DB ────────────────────────────────────────────────────────
const RECIPES = {
  "wattalapam":{name:"Wattalapam",emoji:"🍮",description:"Classic Sri Lankan steamed coconut custard",serves:6,cuisine:"Sri Lankan",
    ingredients:[{name:"Coconut milk",qty:"400ml",cat:"grocery"},{name:"Jaggery (kithul)",qty:"200g",cat:"grocery"},{name:"Eggs",qty:"6",cat:"grocery"},{name:"Cardamom powder",qty:"1 tsp",cat:"grocery"},{name:"Cloves",qty:"4",cat:"grocery"},{name:"Nutmeg powder",qty:"½ tsp",cat:"grocery"},{name:"Vanilla essence",qty:"1 tsp",cat:"grocery"},{name:"Cashew nuts",qty:"50g",cat:"grocery"},{name:"Raisins",qty:"50g",cat:"grocery"}],
    steps:"1. Melt jaggery in coconut milk. Cool.\n2. Beat eggs, mix into coconut milk.\n3. Add spices & vanilla, strain.\n4. Pour into mould, top with cashews & raisins.\n5. Steam 45 mins. Refrigerate 2 hrs."},
  "biscuit pudding":{name:"Biscuit Pudding",emoji:"🍰",description:"No-bake Sri Lankan layered biscuit dessert",serves:8,cuisine:"Sri Lankan",
    ingredients:[{name:"Marie biscuits",qty:"400g",cat:"grocery"},{name:"Butter",qty:"100g",cat:"grocery"},{name:"Sugar",qty:"100g",cat:"grocery"},{name:"Eggs",qty:"3",cat:"grocery"},{name:"Cocoa powder",qty:"3 tbsp",cat:"grocery"},{name:"Vanilla essence",qty:"1 tsp",cat:"grocery"},{name:"Milk",qty:"100ml",cat:"grocery"},{name:"Chocolate",qty:"100g",cat:"grocery"},{name:"Cream",qty:"200ml",cat:"grocery"}],
    steps:"1. Beat butter & sugar until fluffy. Add eggs & cocoa.\n2. Dip biscuits in milk, layer with cream.\n3. Top with ganache. Refrigerate overnight."},
  "kottu":{name:"Kottu Roti",emoji:"🔪",description:"Sri Lankan chopped roti stir-fry",serves:2,cuisine:"Sri Lankan",
    ingredients:[{name:"Godamba roti",qty:"4",cat:"food"},{name:"Chicken",qty:"200g",cat:"grocery"},{name:"Eggs",qty:"2",cat:"grocery"},{name:"Onion",qty:"1",cat:"grocery"},{name:"Leeks",qty:"2 stalks",cat:"grocery"},{name:"Carrot",qty:"1",cat:"grocery"},{name:"Soy sauce",qty:"2 tbsp",cat:"grocery"},{name:"Curry powder",qty:"1 tsp",cat:"grocery"},{name:"Oil",qty:"3 tbsp",cat:"grocery"}],
    steps:"1. Cut roti into thin strips.\n2. Fry chicken, add vegetables.\n3. Scramble eggs, add roti.\n4. Add soy sauce & spices, chop & mix vigorously."},
  "dhal curry":{name:"Dhal Curry",emoji:"🍛",description:"Sri Lankan red lentil curry",serves:4,cuisine:"Sri Lankan",
    ingredients:[{name:"Red lentils",qty:"250g",cat:"grocery"},{name:"Coconut milk",qty:"200ml",cat:"grocery"},{name:"Onion",qty:"1",cat:"grocery"},{name:"Garlic",qty:"3 cloves",cat:"grocery"},{name:"Turmeric",qty:"½ tsp",cat:"grocery"},{name:"Curry powder",qty:"1 tsp",cat:"grocery"},{name:"Mustard seeds",qty:"1 tsp",cat:"grocery"},{name:"Curry leaves",qty:"a few",cat:"grocery"},{name:"Oil",qty:"2 tbsp",cat:"grocery"}],
    steps:"1. Boil lentils with turmeric.\n2. Add coconut milk, simmer 10 mins.\n3. Temper mustard seeds, onion, garlic & curry leaves.\n4. Mix tempering into lentils."},
  "chicken curry":{name:"Sri Lankan Chicken Curry",emoji:"🍗",description:"Authentic spicy Sri Lankan chicken curry",serves:4,cuisine:"Sri Lankan",
    ingredients:[{name:"Chicken pieces",qty:"1 kg",cat:"grocery"},{name:"Onion",qty:"2 large",cat:"grocery"},{name:"Garlic",qty:"5 cloves",cat:"grocery"},{name:"Ginger",qty:"1 inch",cat:"grocery"},{name:"Coconut milk",qty:"400ml",cat:"grocery"},{name:"Sri Lankan curry powder",qty:"2 tbsp",cat:"grocery"},{name:"Turmeric powder",qty:"1 tsp",cat:"grocery"},{name:"Red chili powder",qty:"1 tsp",cat:"grocery"},{name:"Curry leaves",qty:"a few",cat:"grocery"},{name:"Oil",qty:"3 tbsp",cat:"grocery"}],
    steps:"1. Marinate chicken with spices 30 mins.\n2. Fry onion, garlic, ginger until golden.\n3. Add chicken, seal well.\n4. Add coconut milk, simmer 25-30 mins."},
  "hoppers":{name:"Hoppers (Appa)",emoji:"🥣",description:"Sri Lankan crispy bowl-shaped rice pancakes",serves:4,cuisine:"Sri Lankan",
    ingredients:[{name:"Rice flour",qty:"2 cups",cat:"grocery"},{name:"Coconut milk",qty:"400ml",cat:"grocery"},{name:"Yeast",qty:"1 tsp",cat:"grocery"},{name:"Sugar",qty:"1 tsp",cat:"grocery"},{name:"Salt",qty:"1 tsp",cat:"grocery"},{name:"Eggs",qty:"4",cat:"grocery"}],
    steps:"1. Mix all ingredients, rest 4-6 hrs.\n2. Heat hopper pan with oil.\n3. Pour batter, swirl to coat sides.\n4. Cover & cook 3-4 mins until edges crispy."},
  "kiri bath":{name:"Kiri Bath (Milk Rice)",emoji:"🍚",description:"Sri Lankan auspicious coconut milk rice",serves:4,cuisine:"Sri Lankan",
    ingredients:[{name:"Raw rice",qty:"2 cups",cat:"grocery"},{name:"Thick coconut milk",qty:"400ml",cat:"grocery"},{name:"Salt",qty:"1 tsp",cat:"grocery"}],
    steps:"1. Cook rice until almost done.\n2. Add coconut milk & salt, stir on low heat.\n3. Spread on plate, cool & cut into diamonds."},
  "pol sambol":{name:"Pol Sambol",emoji:"🥥",description:"Sri Lankan coconut relish",serves:4,cuisine:"Sri Lankan",
    ingredients:[{name:"Fresh coconut (grated)",qty:"2 cups",cat:"grocery"},{name:"Red onion",qty:"2",cat:"grocery"},{name:"Green chili",qty:"3",cat:"grocery"},{name:"Red chili powder",qty:"1 tsp",cat:"grocery"},{name:"Lime",qty:"1",cat:"grocery"},{name:"Maldive fish",qty:"2 tbsp",cat:"grocery"}],
    steps:"1. Grate coconut. Finely chop onion & chili.\n2. Mix everything, squeeze lime.\n3. Mix well by hand."},
  "lamprais":{name:"Lamprais",emoji:"🌿",description:"Dutch-Sri Lankan rice baked in banana leaf",serves:4,cuisine:"Sri Lankan",
    ingredients:[{name:"Basmati rice",qty:"2 cups",cat:"grocery"},{name:"Chicken pieces",qty:"500g",cat:"grocery"},{name:"Banana leaves",qty:"4 large",cat:"grocery"},{name:"Onion",qty:"2",cat:"grocery"},{name:"Curry powder",qty:"2 tbsp",cat:"grocery"},{name:"Coconut milk",qty:"400ml",cat:"grocery"},{name:"Eggs (hard boiled)",qty:"4",cat:"grocery"},{name:"Lemongrass",qty:"2 stalks",cat:"grocery"}],
    steps:"1. Cook rice 80%, prepare chicken curry.\n2. Soften banana leaves over flame.\n3. Wrap rice, chicken, egg in leaf.\n4. Bake at 175°C for 30 mins."},
  // Indian
  "butter chicken":{name:"Butter Chicken",emoji:"🍗",description:"Creamy North Indian tomato butter curry",serves:4,cuisine:"Indian",
    ingredients:[{name:"Chicken",qty:"750g",cat:"grocery"},{name:"Butter",qty:"100g",cat:"grocery"},{name:"Heavy cream",qty:"200ml",cat:"grocery"},{name:"Tomato puree",qty:"400g",cat:"grocery"},{name:"Onion",qty:"2",cat:"grocery"},{name:"Garlic",qty:"4 cloves",cat:"grocery"},{name:"Ginger",qty:"1 inch",cat:"grocery"},{name:"Garam masala",qty:"2 tsp",cat:"grocery"},{name:"Kashmiri chili powder",qty:"1 tbsp",cat:"grocery"},{name:"Yogurt",qty:"½ cup",cat:"grocery"}],
    steps:"1. Marinate chicken in yogurt & spices, grill.\n2. Sauté onion, garlic, ginger in butter.\n3. Add tomato puree, cook 15 mins.\n4. Blend sauce smooth, add cream.\n5. Add chicken, simmer 10 mins."},
  "palak paneer":{name:"Palak Paneer",emoji:"🥬",description:"Creamy Indian spinach & cottage cheese curry",serves:4,cuisine:"Indian",
    ingredients:[{name:"Paneer",qty:"300g",cat:"grocery"},{name:"Spinach",qty:"500g",cat:"grocery"},{name:"Onion",qty:"2",cat:"grocery"},{name:"Garlic",qty:"4 cloves",cat:"grocery"},{name:"Ginger",qty:"1 inch",cat:"grocery"},{name:"Tomato",qty:"2",cat:"grocery"},{name:"Cream",qty:"100ml",cat:"grocery"},{name:"Garam masala",qty:"1 tsp",cat:"grocery"},{name:"Cumin seeds",qty:"1 tsp",cat:"grocery"},{name:"Oil",qty:"3 tbsp",cat:"grocery"}],
    steps:"1. Blanch spinach, blend smooth.\n2. Fry paneer cubes until golden.\n3. Sauté onion, garlic, ginger, tomatoes.\n4. Add spinach puree & spices.\n5. Add paneer & cream, simmer 5 mins."},
  "biryani":{name:"Chicken Biryani",emoji:"🍲",description:"Fragrant layered chicken biryani",serves:4,cuisine:"Indian",
    ingredients:[{name:"Basmati rice",qty:"2 cups",cat:"grocery"},{name:"Chicken pieces",qty:"750g",cat:"grocery"},{name:"Yogurt",qty:"1 cup",cat:"grocery"},{name:"Onion",qty:"3 large",cat:"grocery"},{name:"Biryani masala",qty:"2 tbsp",cat:"grocery"},{name:"Saffron",qty:"a pinch",cat:"grocery"},{name:"Mint leaves",qty:"handful",cat:"grocery"},{name:"Ghee",qty:"3 tbsp",cat:"grocery"}],
    steps:"1. Marinate chicken in yogurt & spices 2 hrs.\n2. Fry onions golden brown.\n3. Cook chicken 80%.\n4. Par-boil rice 70%.\n5. Layer: chicken → rice → onions → mint → saffron.\n6. Seal & dum cook 25 mins."},
  "pani puri":{name:"Pani Puri",emoji:"💧",description:"Mumbai street snack – crispy shells with tangy water",serves:4,cuisine:"Indian",
    ingredients:[{name:"Semolina",qty:"1 cup",cat:"grocery"},{name:"All-purpose flour",qty:"2 tbsp",cat:"grocery"},{name:"Mint leaves",qty:"1 cup",cat:"grocery"},{name:"Tamarind paste",qty:"2 tbsp",cat:"grocery"},{name:"Green chili",qty:"3",cat:"grocery"},{name:"Boiled potatoes",qty:"3",cat:"grocery"},{name:"Chickpeas (cooked)",qty:"1 cup",cat:"grocery"},{name:"Cumin powder",qty:"1 tsp",cat:"grocery"},{name:"Black salt",qty:"1 tsp",cat:"grocery"},{name:"Oil for frying",qty:"500ml",cat:"grocery"}],
    steps:"1. Make semolina dough, rest 30 mins.\n2. Roll thin, cut circles, deep fry until puffed.\n3. Blend mint, chili, tamarind, cumin & black salt with water.\n4. Mix potato & chickpea filling.\n5. Poke hole in puri, fill, pour tangy water."},
  // Western / Fast food
  "pizza":{name:"Homemade Pizza",emoji:"🍕",description:"Classic homemade pizza",serves:2,cuisine:"Western",
    ingredients:[{name:"All-purpose flour",qty:"2 cups",cat:"grocery"},{name:"Yeast",qty:"1 tsp",cat:"grocery"},{name:"Olive oil",qty:"2 tbsp",cat:"grocery"},{name:"Tomato paste",qty:"3 tbsp",cat:"grocery"},{name:"Mozzarella cheese",qty:"200g",cat:"grocery"},{name:"Bell pepper",qty:"1",cat:"grocery"},{name:"Mushrooms",qty:"100g",cat:"grocery"},{name:"Oregano",qty:"1 tsp",cat:"grocery"}],
    steps:"1. Make dough, rest 1 hr.\n2. Roll thin, spread tomato paste.\n3. Add toppings & mozzarella.\n4. Bake 220°C for 12-15 mins."},
  "burger":{name:"Beef Burger",emoji:"🍔",description:"Classic homemade beef burger",serves:2,cuisine:"Western",
    ingredients:[{name:"Beef mince",qty:"400g",cat:"grocery"},{name:"Burger buns",qty:"2",cat:"grocery"},{name:"Lettuce",qty:"4 leaves",cat:"grocery"},{name:"Tomato",qty:"1",cat:"grocery"},{name:"Onion",qty:"1",cat:"grocery"},{name:"Cheese slices",qty:"2",cat:"grocery"},{name:"Mayonnaise",qty:"3 tbsp",cat:"grocery"},{name:"Ketchup",qty:"2 tbsp",cat:"grocery"},{name:"Salt & pepper",qty:"to taste",cat:"grocery"}],
    steps:"1. Season beef, form into patties.\n2. Grill 4 mins each side.\n3. Toast buns.\n4. Layer: bun → mayo → lettuce → patty → cheese → tomato → ketchup."},
  "pasta carbonara":{name:"Pasta Carbonara",emoji:"🍝",description:"Classic Italian creamy pasta",serves:2,cuisine:"Western",
    ingredients:[{name:"Spaghetti",qty:"200g",cat:"grocery"},{name:"Eggs",qty:"3",cat:"grocery"},{name:"Parmesan cheese",qty:"80g",cat:"grocery"},{name:"Bacon",qty:"150g",cat:"grocery"},{name:"Garlic",qty:"2 cloves",cat:"grocery"},{name:"Black pepper",qty:"1 tsp",cat:"grocery"},{name:"Salt",qty:"to taste",cat:"grocery"}],
    steps:"1. Cook pasta al dente.\n2. Fry bacon & garlic until crispy.\n3. Whisk eggs & parmesan.\n4. Off heat, toss pasta with bacon, add egg mix.\n5. Toss quickly, add pasta water for creaminess."},
  "fried chicken":{name:"Crispy Fried Chicken",emoji:"🍗",description:"Southern-style crispy fried chicken",serves:4,cuisine:"Western",
    ingredients:[{name:"Chicken pieces",qty:"1 kg",cat:"grocery"},{name:"All-purpose flour",qty:"2 cups",cat:"grocery"},{name:"Buttermilk",qty:"400ml",cat:"grocery"},{name:"Paprika",qty:"1 tbsp",cat:"grocery"},{name:"Garlic powder",qty:"1 tsp",cat:"grocery"},{name:"Onion powder",qty:"1 tsp",cat:"grocery"},{name:"Salt & pepper",qty:"to taste",cat:"grocery"},{name:"Oil for frying",qty:"1 litre",cat:"grocery"}],
    steps:"1. Marinate chicken in buttermilk 4 hrs.\n2. Mix flour with spices.\n3. Coat chicken in seasoned flour.\n4. Deep fry 165°C until golden & cooked through."},
  "chocolate cake":{name:"Chocolate Cake",emoji:"🎂",description:"Rich moist chocolate cake",serves:8,cuisine:"Western",
    ingredients:[{name:"All-purpose flour",qty:"2 cups",cat:"grocery"},{name:"Sugar",qty:"2 cups",cat:"grocery"},{name:"Cocoa powder",qty:"¾ cup",cat:"grocery"},{name:"Eggs",qty:"2",cat:"grocery"},{name:"Butter",qty:"100g",cat:"grocery"},{name:"Milk",qty:"1 cup",cat:"grocery"},{name:"Heavy cream",qty:"200ml",cat:"grocery"},{name:"Dark chocolate",qty:"200g",cat:"grocery"},{name:"Baking soda",qty:"2 tsp",cat:"grocery"}],
    steps:"1. Mix dry ingredients.\n2. Add eggs, butter, milk.\n3. Bake 175°C 30-35 mins.\n4. Make ganache with cream & chocolate.\n5. Frost cooled cake."},
  "brownies":{name:"Chocolate Brownies",emoji:"🍫",description:"Fudgy rich chocolate brownies",serves:12,cuisine:"Western",
    ingredients:[{name:"Dark chocolate",qty:"200g",cat:"grocery"},{name:"Butter",qty:"150g",cat:"grocery"},{name:"Sugar",qty:"1½ cups",cat:"grocery"},{name:"Eggs",qty:"3",cat:"grocery"},{name:"All-purpose flour",qty:"¾ cup",cat:"grocery"},{name:"Vanilla essence",qty:"1 tsp",cat:"grocery"}],
    steps:"1. Melt chocolate & butter.\n2. Whisk sugar & eggs until thick.\n3. Fold in flour & vanilla.\n4. Bake 175°C 20-25 mins."},
  "pancakes":{name:"Pancakes",emoji:"🥞",description:"Fluffy American-style pancakes",serves:4,cuisine:"Western",
    ingredients:[{name:"All-purpose flour",qty:"1½ cups",cat:"grocery"},{name:"Sugar",qty:"2 tbsp",cat:"grocery"},{name:"Baking powder",qty:"2 tsp",cat:"grocery"},{name:"Eggs",qty:"2",cat:"grocery"},{name:"Milk",qty:"1¼ cups",cat:"grocery"},{name:"Butter",qty:"3 tbsp",cat:"grocery"}],
    steps:"1. Mix dry then wet ingredients separately.\n2. Combine gently.\n3. Cook on medium heat, flip when bubbles form."},
  // Healthy
  "quinoa salad":{name:"Quinoa Power Salad",emoji:"🥗",description:"High-protein healthy quinoa salad",serves:2,cuisine:"Healthy",
    ingredients:[{name:"Quinoa",qty:"1 cup",cat:"grocery"},{name:"Cherry tomatoes",qty:"200g",cat:"grocery"},{name:"Cucumber",qty:"1",cat:"grocery"},{name:"Bell pepper",qty:"1",cat:"grocery"},{name:"Red onion",qty:"½",cat:"grocery"},{name:"Feta cheese",qty:"100g",cat:"grocery"},{name:"Olive oil",qty:"3 tbsp",cat:"grocery"},{name:"Lemon",qty:"1",cat:"grocery"},{name:"Parsley",qty:"handful",cat:"grocery"}],
    steps:"1. Cook quinoa, cool.\n2. Dice all vegetables.\n3. Mix quinoa & vegetables.\n4. Dress with olive oil & lemon.\n5. Top with feta & parsley."},
  "smoothie bowl":{name:"Smoothie Bowl",emoji:"🫐",description:"Nutritious acai-style smoothie bowl",serves:1,cuisine:"Healthy",
    ingredients:[{name:"Banana (frozen)",qty:"2",cat:"grocery"},{name:"Mixed berries",qty:"1 cup",cat:"grocery"},{name:"Spinach",qty:"1 handful",cat:"grocery"},{name:"Almond milk",qty:"½ cup",cat:"grocery"},{name:"Granola",qty:"¼ cup",cat:"grocery"},{name:"Honey",qty:"1 tbsp",cat:"grocery"},{name:"Chia seeds",qty:"1 tsp",cat:"grocery"}],
    steps:"1. Blend banana, berries, spinach & almond milk thick.\n2. Pour into bowl.\n3. Top with granola, chia seeds & honey."},
  "avocado toast":{name:"Avocado Toast",emoji:"🥑",description:"Healthy smashed avocado toast",serves:2,cuisine:"Healthy",
    ingredients:[{name:"Wholegrain bread",qty:"4 slices",cat:"grocery"},{name:"Avocado",qty:"2",cat:"grocery"},{name:"Eggs",qty:"2",cat:"grocery"},{name:"Cherry tomatoes",qty:"100g",cat:"grocery"},{name:"Lemon juice",qty:"1 tbsp",cat:"grocery"},{name:"Red chili flakes",qty:"¼ tsp",cat:"grocery"},{name:"Salt & pepper",qty:"to taste",cat:"grocery"}],
    steps:"1. Toast bread.\n2. Mash avocado with lemon, salt & pepper.\n3. Poach or fry eggs.\n4. Spread avocado, top with egg & tomatoes.\n5. Sprinkle chili flakes."},
  "overnight oats":{name:"Overnight Oats",emoji:"🌾",description:"Easy healthy make-ahead breakfast",serves:1,cuisine:"Healthy",
    ingredients:[{name:"Rolled oats",qty:"½ cup",cat:"grocery"},{name:"Milk",qty:"½ cup",cat:"grocery"},{name:"Greek yogurt",qty:"¼ cup",cat:"grocery"},{name:"Chia seeds",qty:"1 tbsp",cat:"grocery"},{name:"Honey",qty:"1 tbsp",cat:"grocery"},{name:"Banana",qty:"1",cat:"grocery"},{name:"Mixed berries",qty:"½ cup",cat:"grocery"}],
    steps:"1. Mix oats, milk, yogurt & chia seeds.\n2. Add honey, stir well.\n3. Refrigerate overnight.\n4. Top with banana & berries in morning."},
  "fried rice":{name:"Sri Lankan Fried Rice",emoji:"🍳",description:"Sri Lankan style egg fried rice",serves:3,cuisine:"Sri Lankan",
    ingredients:[{name:"Cooked rice (cold)",qty:"3 cups",cat:"grocery"},{name:"Eggs",qty:"3",cat:"grocery"},{name:"Carrot",qty:"1",cat:"grocery"},{name:"Leeks",qty:"2 stalks",cat:"grocery"},{name:"Soy sauce",qty:"3 tbsp",cat:"grocery"},{name:"Oil",qty:"3 tbsp",cat:"grocery"}],
    steps:"1. Heat oil, fry garlic & onion.\n2. Add vegetables, stir fry.\n3. Scramble eggs, add cold rice.\n4. Add soy sauce, stir fry on high heat."},
};

const CUISINE_EMOJI = { "Sri Lankan":"🇱🇰","Indian":"🇮🇳","Western":"🍟","Healthy":"💚" };

function generateId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2); }

function scaleQty(qty, base, serves) {
  const s = String(qty||"");
  if(["to taste","as needed","mixed","a few","handful","a pinch","pinch"].includes(s)) return s;
  const ratio = serves/(parseInt(base)||4);
  const m = s.match(/^([\d./½¼¾]+)\s*(.*)/);
  if(!m) return s;
  let n;
  if(m[1]==="½") n=0.5; else if(m[1]==="¼") n=0.25; else if(m[1]==="¾") n=0.75;
  else if(m[1].includes("/")){ const p=m[1].split("/"); n=parseFloat(p[0])/parseFloat(p[1]); }
  else n=parseFloat(m[1]);
  if(isNaN(n)) return s;
  let sc=Math.round(n*ratio*4)/4;
  const frac={0.25:"¼",0.5:"½",0.75:"¾",1.25:"1¼",1.5:"1½",1.75:"1¾"};
  const ns = frac[sc]||(Number.isInteger(sc)?String(sc):sc.toFixed(1));
  return m[2]?ns+" "+m[2].trim():ns;
}

// ─── RecipeCard Component ─────────────────────────────────────────────────────
function RecipeCard({ recipe, onAddToList }){
  const [serves,setServes]=useState(recipe.serves||4);
  const [added,setAdded]=useState(false);
  const [showSteps,setShowSteps]=useState(false);
  const handleAdd=()=>{
    onAddToList(recipe.ingredients.map(i=>({type:"add",category:i.cat,item:i.name,quantity:scaleQty(i.qty,recipe.serves,serves),priority:"medium"})));
    setAdded(true); setTimeout(()=>setAdded(false),3000);
  };
  return(
    <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:12,fontSize:13,maxWidth:"82%"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
        <span style={{fontSize:18}}>{recipe.emoji}</span>
        <div>
          <div style={{fontWeight:800,fontSize:14}}>{recipe.name}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{CUISINE_EMOJI[recipe.cuisine]||""} {recipe.cuisine} • serves {recipe.serves}</div>
        </div>
      </div>
      <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:10}}>{recipe.description}</div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,background:"rgba(74,222,128,0.08)",borderRadius:10,padding:"7px 12px",border:"1px solid rgba(74,222,128,0.2)"}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.6)",flex:1}}>👥 Servings</span>
        {[-1,null,1].map((d,i)=>d===null?
          <span key={i} style={{fontWeight:800,fontSize:16,color:"#4ade80",minWidth:24,textAlign:"center"}}>{serves}</span>:
          <button key={i} onClick={()=>setServes(s=>Math.max(1,s+d))} style={{width:28,height:28,borderRadius:"50%",border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.1)",color:"#4ade80",fontSize:16,cursor:"pointer",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{d<0?"−":"+"}</button>
        )}
      </div>
      <div style={{fontWeight:700,marginBottom:6,color:"#4ade80",fontSize:12}}>📝 Ingredients</div>
      {recipe.ingredients.map((ing,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
          <span style={{color:"rgba(255,255,255,0.8)"}}>{ing.name}</span>
          <span style={{color:"#4ade80",fontWeight:700}}>{scaleQty(ing.qty,recipe.serves,serves)}</span>
        </div>
      ))}
      <button onClick={()=>setShowSteps(s=>!s)} style={{width:"100%",marginTop:10,padding:6,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer"}}>
        {showSteps?"▲ Hide Steps":"▼ Show Steps"}
      </button>
      {showSteps&&<div style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.7,margin:"8px 0",whiteSpace:"pre-wrap"}}>{recipe.steps}</div>}
      <button onClick={handleAdd} style={{width:"100%",marginTop:8,padding:9,borderRadius:10,border:"none",background:added?"rgba(74,222,128,0.2)":"linear-gradient(135deg,#4ade80,#22c55e)",color:added?"#4ade80":"#000",fontWeight:800,fontSize:13,cursor:"pointer"}}>
        {added?"✅ Added to list!":"🛒 Add ingredients to list"}
      </button>
    </div>
  );
}

// ─── Budget Tracker Tab ────────────────────────────────────────────────────────
function BudgetTab({ lists, onUpdatePrice }){
  const allItems = Object.entries(lists).flatMap(([cat,items])=>(items||[]).map(i=>({...i,cat})));
  const withPrice = allItems.filter(i=>i.estimatedPrice>0);
  const total = withPrice.reduce((s,i)=>s+(i.estimatedPrice||0)*parseFloat(i.quantity||1),0);
  const done = allItems.filter(i=>i.done&&i.estimatedPrice>0).reduce((s,i)=>s+(i.estimatedPrice||0)*parseFloat(i.quantity||1),0);
  const byCategory = Object.entries(CATEGORIES).map(([cat,info])=>{
    const items=(lists[cat]||[]).filter(i=>i.estimatedPrice>0);
    const subtotal=items.reduce((s,i)=>s+(i.estimatedPrice||0)*parseFloat(i.quantity||1),0);
    return {cat,info,subtotal,items};
  }).filter(x=>x.subtotal>0);
  const [budget,setBudget]=useState(()=>{ try{ return parseFloat(localStorage.getItem("shopper-budget")||"0")||0; }catch{return 0;} });
  const [budgetInput,setBudgetInput]=useState(budget||"");
  const saveBudget=()=>{ const v=parseFloat(budgetInput)||0; setBudget(v); try{localStorage.setItem("shopper-budget",v);}catch{} };
  const remaining=budget>0?budget-total:null;
  return(
    <div style={{flex:1,padding:14,overflowY:"auto"}}>
      <div style={{background:"rgba(250,204,21,0.08)",border:"1px solid rgba(250,204,21,0.2)",borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6}}>SET BUDGET</div>
        <div style={{display:"flex",gap:8}}>
          <input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} placeholder="Rs 5000" type="number" style={{flex:1,padding:"9px 12px",borderRadius:9,border:"1px solid rgba(250,204,21,0.3)",background:"rgba(255,255,255,0.06)",color:"#f0f0f5",fontSize:13,outline:"none"}}/>
          <button onClick={saveBudget} style={{padding:"9px 14px",borderRadius:9,border:"none",background:"#facc15",color:"#000",fontWeight:800,fontSize:13,cursor:"pointer"}}>Set</button>
        </div>
        {budget>0&&<div style={{marginTop:8,fontSize:12,color:"rgba(255,255,255,0.5)"}}>Budget: <span style={{color:"#facc15",fontWeight:800}}>Rs {budget.toFixed(0)}</span></div>}
      </div>
      {total>0?(
        <>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            {[{label:"Total Estimated",val:`Rs ${total.toFixed(0)}`,color:"#4ade80"},{label:"Spent So Far",val:`Rs ${done.toFixed(0)}`,color:"#fb923c"},{label:remaining!==null?"Remaining":"Items Priced",val:remaining!==null?`Rs ${remaining.toFixed(0)}`:`${withPrice.length}`,color:remaining!==null&&remaining<0?"#f87171":"#38bdf8"}].map((s,i)=>(
              <div key={i} style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:11,padding:"10px 8px",textAlign:"center",border:`1px solid ${s.color}22`}}>
                <div style={{fontSize:13,fontWeight:800,color:s.color}}>{s.val}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          {budget>0&&<div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4}}><span>Budget used</span><span>{Math.min(100,Math.round((total/budget)*100))}%</span></div>
            <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:10,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,(total/budget)*100)}%`,background:`linear-gradient(90deg,#4ade80,${total>budget?"#f87171":"#22c55e"})`,borderRadius:10,transition:"width 0.4s"}}/>
            </div>
          </div>}
          {byCategory.map(({cat,info,subtotal,items})=>(
            <div key={cat} style={{marginBottom:12,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:12,border:`1px solid ${info.color}22`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontWeight:800,fontSize:13,color:info.color}}>{info.emoji} {info.label}</span>
                <span style={{fontWeight:800,color:"#facc15",fontSize:13}}>Rs {subtotal.toFixed(0)}</span>
              </div>
              {items.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{color:item.done?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.8)",textDecoration:item.done?"line-through":"none"}}>{item.name} ×{item.quantity}</span>
                  <span style={{color:"#facc15"}}>Rs {(item.estimatedPrice*parseFloat(item.quantity||1)).toFixed(0)}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      ):(
        <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(255,255,255,0.2)"}}>
          <div style={{fontSize:40,marginBottom:10}}>💰</div>
          <div style={{fontSize:14,fontWeight:700}}>No prices set yet</div>
          <div style={{fontSize:12,marginTop:5}}>Edit items to add prices, or tell the AI:<br/>"Set milk price to 150"</div>
        </div>
      )}
    </div>
  );
}

// ─── Meal Planner Tab ─────────────────────────────────────────────────────────
function MealPlannerTab({ onAddToList, showToast }){
  const [plan,setPlan]=useState(()=>{ try{ return JSON.parse(localStorage.getItem("meal-plan")||"{}"); }catch{ return {}; }});
  const [selecting,setSelecting]=useState(null);
  const [filter,setFilter]=useState("All");
  const cuisines=["All",...new Set(Object.values(RECIPES).map(r=>r.cuisine))];
  const savePlan=(p)=>{ setPlan(p); try{localStorage.setItem("meal-plan",JSON.stringify(p));}catch{}; };
  const setMeal=(day,meal,recipe)=>{ const p={...plan,[day]:{...plan[day],[meal]:recipe}}; savePlan(p); setSelecting(null); };
  const clearMeal=(day,meal)=>{ const p={...plan}; if(p[day]){ delete p[day][meal]; if(!Object.keys(p[day]).length) delete p[day]; } savePlan(p); };
  const addAllToList=()=>{
    const all={};
    Object.values(plan).forEach(day=>Object.values(day||{}).forEach(rk=>{
      const r=RECIPES[rk]; if(!r) return;
      r.ingredients.forEach(ing=>{ all[ing.name]={type:"add",category:ing.cat,item:ing.name,quantity:ing.qty,priority:"medium"}; });
    }));
    onAddToList(Object.values(all));
    showToast("✅ All meal ingredients added!");
  };
  const hasMeals=Object.keys(plan).length>0;
  const filtered=Object.entries(RECIPES).filter(([,r])=>filter==="All"||r.cuisine===filter);
  return(
    <div style={{flex:1,padding:14,overflowY:"auto"}}>
      {hasMeals&&<button onClick={addAllToList} style={{width:"100%",padding:10,marginBottom:12,borderRadius:11,border:"none",background:"linear-gradient(135deg,#4ade80,#22c55e)",color:"#000",fontWeight:800,fontSize:13,cursor:"pointer"}}>🛒 Add all meals to shopping list</button>}
      {DAYS.map(day=>(
        <div key={day} style={{marginBottom:12,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:11,border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:"rgba(255,255,255,0.7)"}}>{day}</div>
          {MEALS.map(meal=>{
            const rk=plan[day]?.[meal];
            const r=rk?RECIPES[rk]:null;
            return(
              <div key={meal} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",minWidth:65}}>{meal}</span>
                {r?(
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(74,222,128,0.08)",borderRadius:8,padding:"5px 10px",border:"1px solid rgba(74,222,128,0.2)"}}>
                    <span style={{fontSize:12}}>{r.emoji} {r.name}</span>
                    <button onClick={()=>clearMeal(day,meal)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:14,lineHeight:1}}>×</button>
                  </div>
                ):(
                  <button onClick={()=>setSelecting({day,meal})} style={{flex:1,padding:"5px 10px",borderRadius:8,border:"1px dashed rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.3)",fontSize:12,cursor:"pointer",textAlign:"left"}}>+ Add meal</button>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {selecting&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,padding:14}} onClick={()=>setSelecting(null)}>
          <div style={{width:"100%",maxWidth:480,background:"#111118",borderRadius:18,padding:16,border:"1px solid rgba(255,255,255,0.1)",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>Choose meal for {selecting.day} {selecting.meal}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {cuisines.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"4px 10px",borderRadius:14,border:`1px solid ${filter===c?"#4ade80":"rgba(255,255,255,0.1)"}`,background:filter===c?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.04)",color:filter===c?"#4ade80":"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer"}}>{c}</button>)}
            </div>
            {filtered.map(([key,r])=>(
              <div key={key} onClick={()=>setMeal(selecting.day,selecting.meal,key)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,marginBottom:5,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <span style={{fontSize:20}}>{r.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{r.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{CUISINE_EMOJI[r.cuisine]} {r.cuisine} • serves {r.serves}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Store Sections Tab ───────────────────────────────────────────────────────
function StoreTab({ lists }){
  const allItems=Object.entries(lists).flatMap(([cat,items])=>(items||[]).filter(i=>!i.done).map(i=>({...i,cat})));
  const bySection={};
  allItems.forEach(item=>{
    const key=Object.keys(SECTION_MAP).find(k=>item.name.toLowerCase().includes(k));
    const sec=key?SECTION_MAP[key]:(item.cat==="clothing"?"clothing":item.cat==="household"?"household":"pantry");
    if(!bySection[sec]) bySection[sec]=[];
    bySection[sec].push(item);
  });
  return(
    <div style={{flex:1,padding:14,overflowY:"auto"}}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:12,background:"rgba(56,189,248,0.08)",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(56,189,248,0.15)"}}>🏪 Items auto-sorted by store aisle. Shop each section efficiently!</div>
      {Object.entries(STORE_SECTIONS).map(([sec,info])=>{
        const items=bySection[sec]||[];
        if(!items.length) return null;
        return(
          <div key={sec} style={{marginBottom:12,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:12,border:`1px solid ${info.color}22`}}>
            <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:info.color}}>{info.emoji} {info.label} <span style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.3)"}}>({items.length})</span></div>
            {items.map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:CATEGORIES[item.cat]?.color||"#888",flexShrink:0}}/>
                <span style={{flex:1,fontSize:13}}>{item.name}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>×{item.quantity}</span>
                {item.estimatedPrice&&<span style={{fontSize:11,color:"#facc15"}}>Rs{item.estimatedPrice}</span>}
              </div>
            ))}
          </div>
        );
      })}
      {!Object.values(bySection).some(arr=>arr.length>0)&&(
        <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(255,255,255,0.2)"}}>
          <div style={{fontSize:40,marginBottom:10}}>🏪</div>
          <div style={{fontSize:14,fontWeight:700}}>No items yet</div>
          <div style={{fontSize:12,marginTop:5}}>Add items and they'll be sorted by aisle!</div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App(){
  const [lists,setLists]=useState(()=>{ try{ const s=localStorage.getItem("smart-shopper-lists-v2"); return s?JSON.parse(s):{grocery:[],food:[],clothing:[],household:[]}; }catch{ return {grocery:[],food:[],clothing:[],household:[]}; }});
  const [activeTab,setActiveTab]=useState("chat");
  const [activeCategory,setActiveCategory]=useState("grocery");
  const [filterCat,setFilterCat]=useState("all");
  const [searchTerm,setSearchTerm]=useState("");
  const [toast,setToast]=useState(null);
  const [editItem,setEditItem]=useState(null);
  const [messages,setMessages]=useState([{role:"ai",text:"Hey! 👋 I'm your upgraded AI assistant powered by Claude.\n\nI can understand natural language, suggest recipes, track your budget, and much more!\n\nTry:\n• \"I want to make chicken curry for dinner tonight\"\n• \"What should I cook this week?\"\n• \"Add milk, eggs and bread\"\n• \"Show me healthy recipes\"\n\nOr explore the tabs: 📋 Lists • 💰 Budget • 📅 Meals • 🏪 Store • ➕ Add"}]);
  const [suggestions,setSuggestions]=useState(null);
  const [chatInput,setChatInput]=useState("");
  const [isTyping,setIsTyping]=useState(false);
  const [newItem,setNewItem]=useState({name:"",quantity:"",priority:"medium",estimatedPrice:""});
  const [quickInput,setQuickInput]=useState("");
  const bottomRef=useRef(null);
  const abortRef=useRef(null);

  useEffect(()=>{ try{localStorage.setItem("smart-shopper-lists-v2",JSON.stringify(lists));}catch{} },[lists]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,isTyping]);

  const showToast=useCallback((msg,color="#4ade80")=>{ setToast({msg,color}); setTimeout(()=>setToast(null),2800); },[]);

  const applyActions=useCallback((actions)=>{
    setLists(prev=>{
      let u={...prev};
      for(const a of actions){
        if(a.type==="add"){
          const exists=(u[a.category]||[]).find(i=>i.name.toLowerCase()===a.item.toLowerCase());
          if(!exists) u[a.category]=[...(u[a.category]||[]),{id:generateId(),name:a.item,quantity:a.quantity||"1",priority:a.priority||"medium",estimatedPrice:null,done:false,createdAt:Date.now()}];
        } else if(a.type==="setprice"){
          u[a.category]=(u[a.category]||[]).map(i=>i.name.toLowerCase()===a.item.toLowerCase()?{...i,estimatedPrice:a.price}:i);
        } else if(a.type==="remove"){
          u[a.category]=(u[a.category]||[]).filter(i=>i.name.toLowerCase()!==a.item.toLowerCase());
        } else if(a.type==="complete"){
          u[a.category]=(u[a.category]||[]).map(i=>i.name.toLowerCase()===a.item.toLowerCase()?{...i,done:true}:i);
        } else if(a.type==="clear"){
          if(a.category==="all") u={grocery:[],food:[],clothing:[],household:[]};
          else u[a.category]=[];
        }
      }
      return u;
    });
  },[]);

  const buildListContext=()=>{
    const lines=[];
    for(const [cat,items] of Object.entries(lists)){
      const pending=(items||[]).filter(i=>!i.done);
      if(pending.length) lines.push(`${CATEGORIES[cat].label}: ${pending.map(i=>`${i.name}(qty:${i.quantity}${i.estimatedPrice?`,Rs${i.estimatedPrice}`:""})`).join(", ")}`);
    }
    return lines.length?lines.join(" | "):"(empty)";
  };

  const sendChat=async()=>{
    if(!chatInput.trim()||isTyping) return;
    const userText=chatInput.trim();
    setChatInput("");
    setMessages(prev=>[...prev,{role:"user",text:userText}]);
    setIsTyping(true);

    // Quick local recipe check
    const lower=userText.toLowerCase();
    const recipeMatch=Object.entries(RECIPES).find(([k])=>lower.includes(k));
    if(recipeMatch&&(lower.includes("recipe")||lower.includes("make")||lower.includes("cook")||lower.includes("how to")||lower.startsWith(recipeMatch[0]))){
      setIsTyping(false);
      setMessages(prev=>[...prev,{role:"ai",recipe:recipeMatch[1]}]);
      return;
    }
    if(lower.includes("show all recipes")||lower.includes("list recipes")||lower.includes("all recipes")){
      const cuisineGroups={};
      Object.values(RECIPES).forEach(r=>{ if(!cuisineGroups[r.cuisine]) cuisineGroups[r.cuisine]=[]; cuisineGroups[r.cuisine].push(r); });
      const text=Object.entries(cuisineGroups).map(([c,rs])=>`${CUISINE_EMOJI[c]||""} ${c}:\n${rs.map(r=>`  • ${r.emoji} ${r.name}`).join("\n")}`).join("\n\n");
      setIsTyping(false);
      setMessages(prev=>[...prev,{role:"ai",text:`Here are all my recipes!\n\n${text}\n\nJust say "recipe for [name]" to get full details 🍳`}]);
      return;
    }

    const systemPrompt = `You are a smart shopping assistant in a mobile app. You help users manage shopping lists, discover recipes, track budgets, and plan meals.

Current shopping list: ${buildListContext()}

AVAILABLE RECIPES: ${Object.entries(RECIPES).map(([k,r])=>`${r.emoji}${r.name}(${r.cuisine})`).join(", ")}

== HANDLING "WHAT IS X" / INGREDIENT QUESTIONS ==
When someone asks "what is X?", "tell me about X", "what does X taste like", "is X healthy?", "difference between X and Y":
- Give a SHORT, friendly answer (2-3 sentences max). No essays.
- Include 1 relevant tip (buying, storing, or cooking tip).
- End with 2–4 related items they might want to buy, as suggestions.
- Format: answer → tip → "People who buy X also get:" → include {"suggestions":["item1","item2","item3"]} in JSON
- Example for "what is milk?":
  "Milk is a nutrient-rich dairy liquid, great for drinking, cooking, and baking 🥛 It's packed with calcium and protein. Tip: Full-cream milk lasts longer and tastes richer than low-fat.
  People who buy milk often also grab:"
  + suggestions: ["Eggs","Butter","Cheese","Yogurt"]
- Example for "what is goraka?":
  "Goraka (gamboge) is a dried souring fruit used in Sri Lankan fish curries 🍋 It gives that deep tangy flavour you can't get from tamarind alone. Tip: Soak pieces in warm water before adding to curry.
  Often bought together:"
  + suggestions: ["Fish","Coconut milk","Curry powder","Chili"]
- Keep it conversational — like a knowledgeable friend at the supermarket, not a textbook.

== HANDLING UNKNOWN / UNCLEAR INPUT ==
1. TYPOS/MISSPELLINGS (e.g. "mlk", "chiken", "egss"):
   - Correct silently, add the right item, mention the correction.
   - e.g. "Got it! Added Milk 🥛 (looks like a typo — fixed it for you!)"

2. UNKNOWN INGREDIENTS (e.g. "goraka", "pandan", "jak fruit", "rampe"):
   - These are often Sri Lankan/regional ingredients. Recognize them, categorize correctly as grocery, add them.
   - Brief note on what they are if useful: "Added Goraka 🍋 — the tangy souring agent used in fish curry!"

3. AMBIGUOUS REQUESTS (e.g. "add stuff for tomorrow", "I need things for the party"):
   - Ask ONE short clarifying question with 2–3 tappable follow-up suggestions in your reply.
   - e.g. "What's the occasion? Is it: a birthday party 🎂, a BBQ 🍖, or a dinner for guests 🍽️?"
   - Include a JSON "suggestions" array: {"suggestions":["Birthday party","BBQ","Dinner for guests"]}

4. OFF-TOPIC QUESTIONS (e.g. "what's the weather?", "tell me a joke", "what time is it?"):
   - Answer very briefly and warmly, then redirect with a shopping-related suggestion.
   - e.g. "Ha, I wish I could check the weather! ☀️ But I can help you prep for a rainy day — want me to add some comfort food ingredients?"

5. COMPLETELY UNRECOGNIZED (nothing matches):
   - Never say "I don't understand" bluntly. Instead show empathy + offer 3 helpful next steps.
   - Include {"suggestions":["Show my list","Add grocery items","Browse recipes"]}

== RESPONSE FORMAT ==
- For list actions append: \`\`\`json\n{"actions":[...]}\`\`\`
- Action types: {"type":"add","category":"grocery|food|clothing|household","item":"Name","quantity":"1","priority":"medium"}
- {"type":"remove","category":"...","item":"..."} | {"type":"complete",...} | {"type":"setprice",...,"price":150} | {"type":"clear","category":"all|..."}
- For suggestions: include {"suggestions":["option1","option2","option3"]} in the JSON block alongside actions
- Keep tone warm, concise, emoji-friendly. Sri Lankan context for prices (Rs).`;

    try{
      abortRef.current=new AbortController();
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:systemPrompt,
          messages:[{role:"user",content:userText}]
        }),
        signal:abortRef.current.signal
      });
      const data=await resp.json();
      let text=data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Sorry, I couldn't process that.";
      
      // Extract & apply actions
      const jsonMatch=text.match(/```json\s*([\s\S]*?)```/);
      if(jsonMatch){
        try{
          const parsed=JSON.parse(jsonMatch[1]);
          const {actions, suggestions: sugg} = parsed;
          if(actions?.length){ applyActions(actions); const adds=actions.filter(a=>a.type==="add").length; if(adds>0) showToast(`✅ ${adds} item${adds>1?"s":""} added!`); }
          if(sugg?.length) setSuggestions(sugg); else setSuggestions(null);
        }catch{}
        text=text.replace(/```json[\s\S]*?```/,"").trim();
      } else {
        setSuggestions(null);
      }
      
      // Check for recipe mentions
      const mentionedRecipe=Object.entries(RECIPES).find(([k])=>text.toLowerCase().includes(k));
      setIsTyping(false);
      setMessages(prev=>[...prev,{role:"ai",text},{...(mentionedRecipe?{role:"ai",recipe:mentionedRecipe[1]}:{})}].filter(m=>m.role));
    }catch(err){
      if(err.name==="AbortError") return;
      // Offline fallback with fuzzy matching
      const lower=userText.toLowerCase();
      let response="";
      setSuggestions(null);
      const addMatch=userText.match(/(?:add|buy|need|get)\s+(.+)/i);
      if(addMatch){
        const rawItems=addMatch[1].split(/,|and/).map(s=>s.trim()).filter(Boolean);
        const resolved=[]; const corrected=[];
        rawItems.forEach(raw=>{
          const matches=fuzzyMatch(raw);
          const best=matches[0];
          if(best&&best!==raw.toLowerCase()){ resolved.push(best); corrected.push(`"${raw}" → ${best}`); }
          else resolved.push(raw.charAt(0).toUpperCase()+raw.slice(1));
        });
        const actions=resolved.map(item=>({type:"add",category:"grocery",item:item.charAt(0).toUpperCase()+item.slice(1),quantity:"1",priority:"medium"}));
        applyActions(actions);
        response=corrected.length
          ? `✅ Added! Fixed ${corrected.length} typo${corrected.length>1?"s":""}: ${corrected.join(", ")}`
          : `✅ Added ${resolved.length} item${resolved.length>1?"s":""}!`;
        showToast(response);
      } else {
        const words=userText.split(" ").filter(w=>w.length>2);
        const allMatches=[...new Set(words.flatMap(w=>fuzzyMatch(w)))].slice(0,4);
        if(allMatches.length){
          response="I'm offline right now, but did you mean one of these?";
          setSuggestions(allMatches.map(m=>m.charAt(0).toUpperCase()+m.slice(1)));
        } else {
          response="I'm offline 📵 — try: \"Add milk, eggs\" or \"Recipe for chicken curry\"";
          setSuggestions(["Add groceries","Show my list","Chicken curry recipe","Help"]);
        }
      }
      setIsTyping(false);
      setMessages(prev=>[...prev,{role:"ai",text:response}]);
      return;
    }
  };

  const allItems=Object.entries(lists).flatMap(([cat,items])=>(items||[]).map(i=>({...i,cat})));
  const filteredItems=allItems.filter(i=>(filterCat==="all"||i.cat===filterCat)&&i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalItems=allItems.length, doneItems=allItems.filter(i=>i.done).length;
  const totalBudget=allItems.reduce((s,i)=>s+(i.estimatedPrice||0),0);

  const toggleDone=(cat,id)=>setLists(prev=>({...prev,[cat]:(prev[cat]||[]).map(i=>i.id===id?{...i,done:!i.done}:i)}));
  const removeItem=(cat,id)=>{ setLists(prev=>({...prev,[cat]:(prev[cat]||[]).filter(i=>i.id!==id)})); showToast("🗑️ Removed","#f87171"); };
  const clearDone=(cat)=>{ setLists(prev=>({...prev,[cat]:(prev[cat]||[]).filter(i=>!i.done)})); showToast("🧹 Done items cleared!"); };
  const saveEdit=()=>{
    if(!editItem) return;
    setLists(prev=>({...prev,[editItem.cat]:(prev[editItem.cat]||[]).map(i=>i.id===editItem.id?{...i,name:editItem.name,quantity:editItem.quantity,priority:editItem.priority,estimatedPrice:editItem.estimatedPrice?parseFloat(editItem.estimatedPrice):null}:i)}));
    setEditItem(null); showToast("✏️ Updated!");
  };
  const addItem=()=>{
    if(!newItem.name.trim()) return;
    const item={id:generateId(),name:newItem.name.trim(),quantity:newItem.quantity||"1",priority:newItem.priority,estimatedPrice:newItem.estimatedPrice?parseFloat(newItem.estimatedPrice):null,done:false,createdAt:Date.now()};
    setLists(prev=>({...prev,[activeCategory]:[...(prev[activeCategory]||[]),item]}));
    setNewItem({name:"",quantity:"",priority:"medium",estimatedPrice:""});
    showToast(`✅ ${item.name} added!`);
  };
  const quickAdd=()=>{
    if(!quickInput.trim()) return;
    const items=quickInput.split(",").map(s=>s.trim()).filter(Boolean);
    setLists(prev=>({...prev,[activeCategory]:[...(prev[activeCategory]||[]),...items.map(name=>({id:generateId(),name,quantity:"1",priority:"medium",estimatedPrice:null,done:false,createdAt:Date.now()}))]}));
    setQuickInput(""); showToast(`✅ ${items.length} item${items.length>1?"s":""} added!`);
  };

  const buildShareText=()=>{
    let text="🛒 My Shopping List\n\n"; let has=false;
    for(const [cat,items] of Object.entries(lists)){
      const p=(items||[]).filter(i=>!i.done);
      if(p.length){ has=true; text+=`${CATEGORIES[cat].emoji} ${CATEGORIES[cat].label}:\n`; p.forEach(i=>{ text+=`  • ${i.name}`; if(i.quantity&&i.quantity!=="1") text+=` (${i.quantity})`; if(i.estimatedPrice) text+=` - Rs ${i.estimatedPrice}`; text+="\n"; }); text+="\n"; }
    }
    return has?text+="📱 Smart Shopper App":null;
  };
  const shareViaWhatsApp=()=>{ const t=buildShareText(); if(!t){showToast("❌ List is empty!","#f87171");return;} window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank"); };
  const copyShare=()=>{
    const t=buildShareText(); if(!t){showToast("❌ List is empty!","#f87171");return;}
    if(navigator.clipboard?.writeText){ navigator.clipboard.writeText(t).then(()=>showToast("✅ Copied to clipboard!")).catch(()=>{}); }
    else{ const ta=document.createElement("textarea"); ta.value=t; ta.style.cssText="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");showToast("✅ Copied!");}catch{} document.body.removeChild(ta); }
  };

  const TABS=[["chat","🤖","AI Chat"],["lists","📋","Lists"],["budget","💰","Budget"],["meals","📅","Meals"],["store","🏪","Store"],["add","➕","Add"]];
  const SUGGESTIONS=["Add milk, eggs, bread","Chicken curry recipe","Healthy breakfast ideas","What can I cook tonight?","Show all recipes","Budget tips"];

  return(
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:"#0a0a0f",minHeight:"100vh",color:"#f0f0f5",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#000",padding:"10px 20px",borderRadius:24,fontWeight:800,fontSize:13,zIndex:999,boxShadow:`0 4px 24px ${toast.color}66`,whiteSpace:"nowrap",animation:"slideDown 0.3s ease"}}>{toast.msg}</div>}
      {/* Header */}
      <div style={{padding:"12px 14px 0",background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#4ade80,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🛒</div>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>Smart Shopper <span style={{fontSize:11,color:"#4ade80",fontWeight:700,background:"rgba(74,222,128,0.15)",padding:"2px 7px",borderRadius:8,marginLeft:4}}>v2</span></div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>✨ Claude AI Powered</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
            <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color:"#4ade80"}}>{doneItems}/{totalItems}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>done</div></div>
            {totalBudget>0&&<div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:"#facc15"}}>Rs{totalBudget}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>budget</div></div>}
          </div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:10}}>
          {Object.entries(CATEGORIES).map(([key,val])=>(
            <div key={key} onClick={()=>{setActiveTab("lists");setFilterCat(key);}} style={{flex:1,background:val.bg,borderRadius:10,padding:"6px 4px",textAlign:"center",border:`1px solid ${val.color}22`,cursor:"pointer"}}>
              <div style={{fontSize:12}}>{val.emoji}</div>
              <div style={{fontSize:12,fontWeight:800,color:val.color}}>{(lists[key]||[]).length}</div>
              <div style={{fontSize:8,color:"rgba(255,255,255,0.35)"}}>{val.label.split(" ")[0]}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:1}}>
          {TABS.map(([tab,emoji,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:"0 0 auto",padding:"7px 10px",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,borderRadius:"8px 8px 0 0",background:activeTab===tab?"#111118":"transparent",color:activeTab===tab?"#4ade80":"rgba(255,255,255,0.35)",borderBottom:activeTab===tab?"2px solid #4ade80":"2px solid transparent",whiteSpace:"nowrap"}}>{emoji} {label}</button>
          ))}
        </div>
      </div>

      {/* ── CHAT ── */}
      {activeTab==="chat"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10,maxHeight:"calc(100vh - 310px)"}}>
            {messages.filter(m=>m.role).map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
                {msg.role==="ai"&&<div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>✨</div>}
                {msg.recipe?(
                  <RecipeCard recipe={msg.recipe} onAddToList={(actions)=>{applyActions(actions);showToast("✅ Ingredients added!");}}/>
                ):(
                  msg.text&&<div style={{maxWidth:"78%",padding:"10px 13px",fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:msg.role==="user"?"linear-gradient(135deg,#4ade80,#22c55e)":"rgba(255,255,255,0.07)",color:msg.role==="user"?"#000":"#f0f0f5",fontWeight:msg.role==="user"?700:400,border:msg.role==="ai"?"1px solid rgba(255,255,255,0.08)":"none"}}>{msg.text}</div>
                )}
              </div>
            ))}
            {isTyping&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✨</div>
                <div style={{padding:"12px 16px",background:"rgba(255,255,255,0.07)",borderRadius:"16px 16px 16px 4px",border:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:4}}>
                  {[0,1,2].map(d=><span key={d} style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"bounce 1s infinite",animationDelay:`${d*0.2}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:"6px 14px",display:"flex",gap:5,overflowX:"auto"}}>
            {suggestions?(
              <>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",alignSelf:"center",flexShrink:0}}>Did you mean:</span>
                {suggestions.map(s=>(
                  <button key={s} onClick={()=>{setChatInput(s);setSuggestions(null);}} style={{whiteSpace:"nowrap",padding:"6px 12px",borderRadius:14,border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.12)",color:"#4ade80",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>{s}</button>
                ))}
                <button onClick={()=>setSuggestions(null)} style={{whiteSpace:"nowrap",padding:"6px 10px",borderRadius:14,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.3)",fontSize:11,cursor:"pointer",flexShrink:0}}>✕</button>
              </>
            ):(
              SUGGESTIONS.map(s=><button key={s} onClick={()=>setChatInput(s)} style={{whiteSpace:"nowrap",padding:"5px 10px",borderRadius:14,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.55)",fontSize:11,cursor:"pointer"}}>{s}</button>)
            )}
          </div>
          <div style={{padding:"8px 14px 16px",display:"flex",gap:8}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask anything about shopping, recipes..." style={{flex:1,padding:"11px 14px",borderRadius:22,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.07)",color:"#f0f0f5",fontSize:13,outline:"none"}}/>
            <button onClick={sendChat} disabled={isTyping} style={{width:42,height:42,borderRadius:"50%",border:"none",cursor:"pointer",background:isTyping?"rgba(74,222,128,0.3)":"linear-gradient(135deg,#4ade80,#22c55e)",color:"#000",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,flexShrink:0}}>➤</button>
          </div>
        </div>
      )}

      {/* ── LISTS ── */}
      {activeTab==="lists"&&(
        <div style={{flex:1,padding:14,overflowY:"auto"}}>
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="🔍 Search items..." style={{width:"100%",padding:"10px 13px",borderRadius:11,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#f0f0f5",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
            {[["all","🗂️ All"],...Object.entries(CATEGORIES).map(([k,v])=>[k,`${v.emoji} ${v.label}`])].map(([key,label])=>(
              <button key={key} onClick={()=>setFilterCat(key)} style={{padding:"5px 10px",borderRadius:14,border:`1px solid ${filterCat===key?"#4ade80":"rgba(255,255,255,0.1)"}`,background:filterCat===key?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.04)",color:filterCat===key?"#4ade80":"rgba(255,255,255,0.45)",fontSize:11,fontWeight:700,cursor:"pointer"}}>{label}</button>
            ))}
          </div>
          {totalItems>0&&(
            <>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <button onClick={shareViaWhatsApp} style={{flex:1,padding:"9px 8px",borderRadius:11,border:"1px solid rgba(37,211,102,0.3)",background:"rgba(37,211,102,0.1)",color:"#25d366",fontWeight:800,fontSize:12,cursor:"pointer"}}>📲 WhatsApp</button>
                <button onClick={copyShare} style={{flex:1,padding:"9px 8px",borderRadius:11,border:"1px solid rgba(74,222,128,0.3)",background:"rgba(74,222,128,0.1)",color:"#4ade80",fontWeight:800,fontSize:12,cursor:"pointer"}}>📋 Copy</button>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4}}><span>Progress</span><span>{Math.round((doneItems/totalItems)*100)}%</span></div>
                <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",width:`${(doneItems/totalItems)*100}%`,background:"linear-gradient(90deg,#4ade80,#22c55e)",borderRadius:10,transition:"width 0.4s"}}/></div>
              </div>
            </>
          )}
          {filteredItems.length===0?(
            <div style={{textAlign:"center",padding:"50px 20px",color:"rgba(255,255,255,0.2)"}}>
              <div style={{fontSize:44,marginBottom:10}}>🛒</div>
              <div style={{fontSize:14,fontWeight:700}}>Nothing here yet!</div>
              <div style={{fontSize:12,marginTop:5}}>Use the AI Chat or ➕ Add tab</div>
            </div>
          ):(
            (filterCat==="all"?Object.keys(CATEGORIES):[filterCat]).map(cat=>{
              const items=filteredItems.filter(i=>i.cat===cat);
              if(!items.length) return null;
              const val=CATEGORIES[cat], doneCat=items.filter(i=>i.done).length;
              return(
                <div key={cat} style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                    <span>{val.emoji}</span><span style={{fontWeight:800,fontSize:12,color:val.color}}>{val.label}</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginLeft:"auto"}}>{doneCat}/{items.length}</span>
                    {doneCat>0&&<button onClick={()=>clearDone(cat)} style={{fontSize:10,padding:"2px 7px",borderRadius:7,border:"1px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.1)",color:"#f87171",cursor:"pointer"}}>Clear done</button>}
                  </div>
                  {items.map(item=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 11px",background:item.done?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.05)",borderRadius:11,marginBottom:5,border:`1px solid ${item.done?"rgba(255,255,255,0.04)":val.color+"22"}`}}>
                      <button onClick={()=>toggleDone(item.cat,item.id)} style={{width:20,height:20,borderRadius:"50%",flexShrink:0,cursor:"pointer",border:`2px solid ${item.done?"#4ade80":"rgba(255,255,255,0.25)"}`,background:item.done?"#4ade80":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000"}}>{item.done?"✓":""}</button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,textDecoration:item.done?"line-through":"none",color:item.done?"rgba(255,255,255,0.3)":"#f0f0f5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                        <div style={{display:"flex",gap:7,marginTop:2}}>
                          <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>×{item.quantity}</span>
                          {item.estimatedPrice&&<span style={{fontSize:10,color:"#facc15"}}>Rs {item.estimatedPrice}</span>}
                          <span style={{fontSize:10,color:PRIORITY_COLORS[item.priority]}}>● {item.priority}</span>
                        </div>
                      </div>
                      <button onClick={()=>setEditItem({...item,estimatedPrice:item.estimatedPrice||""})} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.5)",fontSize:12}}>✏️</button>
                      <button onClick={()=>removeItem(item.cat,item.id)} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:"rgba(248,113,113,0.1)",color:"#f87171",fontSize:14,fontWeight:800}}>×</button>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── BUDGET ── */}
      {activeTab==="budget"&&<BudgetTab lists={lists} onUpdatePrice={applyActions}/>}

      {/* ── MEALS ── */}
      {activeTab==="meals"&&<MealPlannerTab onAddToList={applyActions} showToast={showToast}/>}

      {/* ── STORE ── */}
      {activeTab==="store"&&<StoreTab lists={lists}/>}

      {/* ── ADD ── */}
      {activeTab==="add"&&(
        <div style={{flex:1,padding:14,overflowY:"auto"}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.4)",marginBottom:8,letterSpacing:1}}>CATEGORY</div>
            <div style={{display:"flex",gap:6}}>
              {Object.entries(CATEGORIES).map(([key,val])=>(
                <button key={key} onClick={()=>setActiveCategory(key)} style={{flex:1,padding:"10px 3px",borderRadius:11,border:`2px solid ${activeCategory===key?val.color:"rgba(255,255,255,0.07)"}`,background:activeCategory===key?val.bg:"rgba(255,255,255,0.03)",color:activeCategory===key?val.color:"rgba(255,255,255,0.3)",fontSize:9,fontWeight:800,cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:16,marginBottom:3}}>{val.emoji}</div>{val.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:13,marginBottom:11,border:`1px solid ${CATEGORIES[activeCategory].color}33`}}>
            <div style={{fontWeight:800,fontSize:12,marginBottom:7,color:CATEGORIES[activeCategory].color}}>⚡ Quick Add to {CATEGORIES[activeCategory].label}</div>
            <div style={{display:"flex",gap:7}}>
              <input value={quickInput} onChange={e=>setQuickInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&quickAdd()} placeholder="milk, eggs, bread (comma separated)" style={{flex:1,padding:"9px 12px",borderRadius:9,border:`1px solid ${CATEGORIES[activeCategory].color}44`,background:"rgba(255,255,255,0.06)",color:"#f0f0f5",fontSize:13,outline:"none"}}/>
              <button onClick={quickAdd} style={{padding:"9px 13px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:800,fontSize:13,background:CATEGORIES[activeCategory].color,color:"#000"}}>Add</button>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontWeight:800,fontSize:12,marginBottom:11,color:"rgba(255,255,255,0.6)"}}>🔍 Detailed Add</div>
            {[["ITEM NAME","name","e.g. Whole Milk","text"],["QUANTITY","quantity","e.g. 2 litres","text"],["PRICE (Rs)","estimatedPrice","e.g. 350","number"]].map(([label,key,ph,type])=>(
              <div key={key} style={{marginBottom:8}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{label}</div>
                <input type={type} value={newItem[key]} onChange={e=>setNewItem(prev=>({...prev,[key]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",color:"#f0f0f5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:11}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:5}}>PRIORITY</div>
              <div style={{display:"flex",gap:5}}>
                {PRIORITIES.map(p=><button key={p} onClick={()=>setNewItem(prev=>({...prev,priority:p}))} style={{flex:1,padding:7,borderRadius:8,border:`1px solid ${newItem.priority===p?PRIORITY_COLORS[p]:"rgba(255,255,255,0.1)"}`,background:newItem.priority===p?`${PRIORITY_COLORS[p]}22`:"transparent",color:newItem.priority===p?PRIORITY_COLORS[p]:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>● {p}</button>)}
              </div>
            </div>
            <button onClick={addItem} style={{width:"100%",padding:11,borderRadius:10,border:"none",cursor:"pointer",background:CATEGORIES[activeCategory].color,color:"#000",fontWeight:800,fontSize:13}}>Add to {CATEGORIES[activeCategory].label} ✓</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,padding:14}} onClick={()=>setEditItem(null)}>
          <div style={{width:"100%",maxWidth:480,background:"#111118",borderRadius:18,padding:16,border:"1px solid rgba(255,255,255,0.1)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:13}}>✏️ Edit Item</div>
            {[["Item Name","name","text"],["Quantity","quantity","text"],["Price (Rs)","estimatedPrice","number"]].map(([label,key,type])=>(
              <div key={key} style={{marginBottom:8}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{label}</div>
                <input type={type} value={editItem[key]} onChange={e=>setEditItem(prev=>({...prev,[key]:e.target.value}))} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#f0f0f5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:13}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:5}}>PRIORITY</div>
              <div style={{display:"flex",gap:5}}>
                {PRIORITIES.map(p=><button key={p} onClick={()=>setEditItem(prev=>({...prev,priority:p}))} style={{flex:1,padding:7,borderRadius:8,border:`1px solid ${editItem.priority===p?PRIORITY_COLORS[p]:"rgba(255,255,255,0.1)"}`,background:editItem.priority===p?`${PRIORITY_COLORS[p]}22`:"transparent",color:editItem.priority===p?PRIORITY_COLORS[p]:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>● {p}</button>)}
              </div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setEditItem(null)} style={{flex:1,padding:10,borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={saveEdit} style={{flex:2,padding:10,borderRadius:10,border:"none",background:"linear-gradient(135deg,#4ade80,#22c55e)",color:"#000",fontWeight:800,fontSize:13,cursor:"pointer"}}>Save Changes</button>
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