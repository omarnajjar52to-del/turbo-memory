/* ============================================================
   NAAR: menu
   price = price of the default choices (e.g. a medium pizza).
   options = option sets from `optionSets`, shown in the item sheet.
   tags: best | hot | new | veg
   img = file name in assets/img (without .webp)
   ============================================================ */
window.NAAR_MENU = {
  categories: [
    { id: 'pizza', icon: 'i-pizza', name: { ar: 'بيتزا', en: 'Pizza' } },
    { id: 'sandwiches', icon: 'i-sandwich', name: { ar: 'سندويشات', en: 'Sandwiches' } },
    { id: 'snacks', icon: 'i-fries', name: { ar: 'سناكات', en: 'Snacks' } },
    { id: 'drinks', icon: 'i-cup', name: { ar: 'مشروبات', en: 'Drinks' } },
    { id: 'deals', icon: 'i-flame', name: { ar: 'عروض', en: 'Deals' } }
  ],

  optionSets: {
    pizzaSize: {
      type: 'single',
      alwaysShow: true, // the kitchen always needs the size, even the default one
      name: { ar: 'الحجم', en: 'Size' },
      choices: [
        { id: 's', name: { ar: 'صغير', en: 'Small' }, meta: { ar: '22 سم', en: '22 cm' }, delta: -3000 },
        { id: 'm', name: { ar: 'وسط', en: 'Medium' }, meta: { ar: '28 سم', en: '28 cm' }, delta: 0, default: true },
        { id: 'l', name: { ar: 'كبير', en: 'Large' }, meta: { ar: '34 سم', en: '34 cm' }, delta: 4000 }
      ]
    },
    pizzaExtras: {
      type: 'multi',
      name: { ar: 'إضافات', en: 'Extras' },
      choices: [
        { id: 'cheese', name: { ar: 'جبنة إضافية', en: 'Extra cheese' }, delta: 1500 },
        { id: 'crust', name: { ar: 'أطراف محشية جبنة', en: 'Cheese-stuffed crust' }, delta: 2500 },
        { id: 'jalapeno', name: { ar: 'هالبينو', en: 'Jalapeño' }, delta: 750 },
        { id: 'olives', name: { ar: 'زيتون أسود', en: 'Black olives' }, delta: 750 },
        { id: 'mushroom', name: { ar: 'فطر', en: 'Mushrooms' }, delta: 1000 }
      ]
    },
    heat: {
      type: 'single',
      name: { ar: 'درجة الحرارة', en: 'Heat level' },
      choices: [
        { id: 'mild', name: { ar: 'عادي', en: 'Mild' }, delta: 0, default: true },
        { id: 'hot', name: { ar: 'حار', en: 'Hot' }, delta: 0 },
        { id: 'fire', name: { ar: 'نار', en: 'Fire' }, delta: 0 }
      ]
    },
    burgerExtras: {
      type: 'multi',
      name: { ar: 'إضافات وتعديلات', en: 'Extras and changes' },
      choices: [
        { id: 'cheddar', name: { ar: 'شريحة شيدر', en: 'Cheddar slice' }, delta: 750 },
        { id: 'patty', name: { ar: 'قطعة لحم إضافية', en: 'Extra patty' }, delta: 3000 },
        { id: 'jalapeno', name: { ar: 'هالبينو', en: 'Jalapeño' }, delta: 500 },
        { id: 'no-onion', name: { ar: 'بدون بصل', en: 'No onion' }, delta: 0 },
        { id: 'no-pickles', name: { ar: 'بدون مخلل', en: 'No pickles' }, delta: 0 }
      ]
    },
    zingerExtras: {
      type: 'multi',
      name: { ar: 'إضافات وتعديلات', en: 'Extras and changes' },
      choices: [
        { id: 'fillet', name: { ar: 'قطعة دجاج إضافية', en: 'Extra fillet' }, delta: 2500 },
        { id: 'cheddar', name: { ar: 'شريحة شيدر', en: 'Cheddar slice' }, delta: 750 },
        { id: 'jalapeno', name: { ar: 'هالبينو', en: 'Jalapeño' }, delta: 500 },
        { id: 'no-slaw', name: { ar: 'بدون كول سلو', en: 'No coleslaw' }, delta: 0 }
      ]
    },
    sandwichExtras: {
      type: 'multi',
      name: { ar: 'إضافات وتعديلات', en: 'Extras and changes' },
      choices: [
        { id: 'garlic', name: { ar: 'ثومية إضافية', en: 'Extra garlic sauce' }, delta: 500 },
        { id: 'fries', name: { ar: 'بطاطا داخل السندويش', en: 'Fries inside' }, delta: 500 },
        { id: 'cheese', name: { ar: 'جبنة', en: 'Cheese' }, delta: 750 },
        { id: 'no-pickles', name: { ar: 'بدون مخلل', en: 'No pickles' }, delta: 0 }
      ]
    },
    sideSize: {
      type: 'single',
      name: { ar: 'الحجم', en: 'Size' },
      choices: [
        { id: 'reg', name: { ar: 'عادي', en: 'Regular' }, delta: 0, default: true },
        { id: 'large', name: { ar: 'كبير', en: 'Large' }, delta: 1500 }
      ]
    },
    dips: {
      type: 'multi',
      name: { ar: 'صوصات جانبية', en: 'Dips' },
      choices: [
        { id: 'ranch', name: { ar: 'رانش', en: 'Ranch' }, delta: 500 },
        { id: 'bbq', name: { ar: 'باربكيو', en: 'Barbecue' }, delta: 500 },
        { id: 'garlic', name: { ar: 'ثومية', en: 'Garlic' }, delta: 500 },
        { id: 'cheese', name: { ar: 'صوص جبنة', en: 'Cheese sauce' }, delta: 750 }
      ]
    },
    drinkSize: {
      type: 'single',
      name: { ar: 'الحجم', en: 'Size' },
      choices: [
        { id: 'reg', name: { ar: 'وسط', en: 'Regular' }, delta: 0, default: true },
        { id: 'large', name: { ar: 'كبير', en: 'Large' }, delta: 1000 }
      ]
    }
  },

  items: [
    /* ---------- Pizza ---------- */
    {
      id: 'pz-pepperoni', cat: 'pizza', img: 'pz-pepperoni', price: 12000, tags: ['best', 'hot'],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'بيتزا بيبروني', en: 'Pepperoni Pizza' },
      desc: { ar: 'بيبروني بقري مقرمش، موزاريلا تمطّ، وصلصة طماطم مطبوخة على مهل.', en: 'Crispy beef pepperoni, stretchy mozzarella and slow-cooked tomato sauce.' }
    },
    {
      id: 'pz-margherita', cat: 'pizza', img: 'pz-margherita', price: 9000, tags: ['veg'],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'مارغريتا', en: 'Margherita' },
      desc: { ar: 'صلصة طماطم، موزاريلا طازجة وريحان أخضر. البساطة بأحلى صورها.', en: 'Tomato sauce, fresh mozzarella and basil. Simple, done right.' }
    },
    {
      id: 'pz-bbq', cat: 'pizza', img: 'pz-bbq', price: 13000, tags: [],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'دجاج باربكيو', en: 'BBQ Chicken' },
      desc: { ar: 'دجاج مشوي، صوص باربكيو مدخّن، بصل أحمر وفلفل ملوّن.', en: 'Grilled chicken, smoky barbecue sauce, red onion and peppers.' }
    },
    {
      id: 'pz-veggie', cat: 'pizza', img: 'pz-veggie', price: 10000, tags: ['veg', 'new'],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'سبانخ وريكوتا', en: 'Spinach Ricotta' },
      desc: { ar: 'سبانخ طازجة، جبنة ريكوتا، موزاريلا ورشّة زيت زيتون.', en: 'Fresh spinach, ricotta, mozzarella and a drizzle of olive oil.' }
    },
    {
      id: 'pz-supreme', cat: 'pizza', img: 'pz-supreme', price: 14000, tags: [],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'سوبريم', en: 'Supreme' },
      desc: { ar: 'لحوم مشكّلة، فطر، زيتون، فلفل وبصل. كل شي بقطعة وحدة.', en: 'Mixed meats, mushrooms, olives, peppers and onion. Everything in one slice.' }
    },
    {
      id: 'pz-cheese', cat: 'pizza', img: 'pz-cheese', price: 13000, tags: ['veg'],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'أربع أجبان', en: 'Four Cheese' },
      desc: { ar: 'موزاريلا، شيدر، بارميزان وجبنة زرقاء تمطّ لآخر لقمة.', en: 'Mozzarella, cheddar, parmesan and blue cheese, stretching to the last bite.' }
    },
    {
      id: 'pz-meat', cat: 'pizza', img: 'pz-meat', price: 15000, tags: ['hot'],
      options: ['pizzaSize', 'pizzaExtras'],
      name: { ar: 'محبّي اللحم', en: 'Meat Lovers' },
      desc: { ar: 'لحم مفروم متبّل، سجق، بيبروني وفلفل حار.', en: 'Seasoned minced beef, sausage, pepperoni and hot peppers.' }
    },

    /* ---------- Sandwiches ---------- */
    {
      id: 'sw-zinger', cat: 'sandwiches', img: 'sw-zinger', price: 6500, tags: ['best', 'hot'],
      options: ['heat', 'zingerExtras'],
      name: { ar: 'زنجر نار', en: 'Naar Zinger' },
      desc: { ar: 'صدر دجاج مقرمش وحار، كول سلو وصوص نار الخاص.', en: 'Spicy crispy chicken breast, coleslaw and our house fire sauce.' }
    },
    {
      id: 'sw-shawarma', cat: 'sandwiches', img: 'sw-shawarma', price: 4000, tags: ['best'],
      options: ['sandwichExtras'],
      name: { ar: 'شاورما دجاج', en: 'Chicken Shawarma' },
      desc: { ar: 'شاورما دجاج، ثومية، مخلل وبطاطا بخبز صاج.', en: 'Chicken shawarma, garlic sauce, pickles and fries in saj bread.' }
    },
    {
      id: 'sw-arabi', cat: 'sandwiches', img: 'sw-arabi', price: 7000, tags: [],
      options: ['sandwichExtras'],
      name: { ar: 'شاورما عربي', en: 'Shawarma Arabi' },
      desc: { ar: 'شاورما مقطّعة مع بطاطا وثومية ومخلل. وجبة كاملة.', en: 'Sliced shawarma with fries, garlic dip and pickles. A full meal.' }
    },
    {
      id: 'sw-tawook', cat: 'sandwiches', img: 'sw-tawook', price: 5500, tags: ['new'],
      options: ['sandwichExtras'],
      name: { ar: 'راب طاووق', en: 'Tawook Wrap' },
      desc: { ar: 'دجاج طاووق متبّل، خس، طماطم وصوص ثوم بخبز تورتيلا.', en: 'Marinated tawook chicken, lettuce, tomato and garlic sauce in a tortilla.' }
    },
    {
      id: 'sw-burger', cat: 'sandwiches', img: 'sw-burger', price: 7500, tags: [],
      options: ['burgerExtras'],
      name: { ar: 'برغر كلاسيك', en: 'Classic Burger' },
      desc: { ar: 'لحم بقري مشوي، شيدر ذايب، خس، طماطم وصوص البيت.', en: 'Grilled beef patty, melted cheddar, lettuce, tomato and house sauce.' }
    },
    {
      id: 'sw-double', cat: 'sandwiches', img: 'sw-double', price: 10500, tags: ['hot'],
      options: ['heat', 'burgerExtras'],
      name: { ar: 'دبل سماش', en: 'Double Smash' },
      desc: { ar: 'قطعتين لحم سماش، شيدر مضاعف، بصل مكرمل وهالبينو.', en: 'Two smashed patties, double cheddar, caramelized onion and jalapeño.' }
    },
    {
      id: 'sw-club', cat: 'sandwiches', img: 'sw-club', price: 7000, tags: [],
      options: ['sandwichExtras'],
      name: { ar: 'كلوب سندويش', en: 'Club Sandwich' },
      desc: { ar: 'توست محمّص، دجاج، جبنة، خس وطماطم بثلاث طبقات.', en: 'Toasted bread, chicken, cheese, lettuce and tomato in three layers.' }
    },
    {
      id: 'sw-panini', cat: 'sandwiches', img: 'sw-panini', price: 5000, tags: ['veg'],
      options: ['dips'],
      name: { ar: 'توست مشوي بالجبنة', en: 'Grilled Cheese Toast' },
      desc: { ar: 'توست مكبوس على الصاج ومحشي جبنة ذايبة، مع صوصات جانبية.', en: 'Pressed toast filled with melted cheese, served with dips.' }
    },

    /* ---------- Snacks ---------- */
    {
      id: 'sn-loaded-fries', cat: 'snacks', img: 'sn-loaded-fries', price: 5500, tags: ['best'],
      options: ['sideSize', 'dips'],
      name: { ar: 'بطاطا لودد', en: 'Loaded Fries' },
      desc: { ar: 'بطاطا مقرمشة، صوص جبنة، بارميزان وأعشاب.', en: 'Crispy fries, cheese sauce, parmesan and herbs.' }
    },
    {
      id: 'sn-fries', cat: 'snacks', img: 'sn-fries', price: 2500, tags: ['veg'],
      options: ['sideSize', 'dips'],
      name: { ar: 'بطاطا كلاسيك', en: 'Classic Fries' },
      desc: { ar: 'بطاطا ذهبية مقرمشة مع ملح البحر.', en: 'Golden crispy fries with sea salt.' }
    },
    {
      id: 'sn-wings', cat: 'snacks', img: 'sn-wings', price: 8500, tags: ['best', 'hot'],
      options: ['heat', 'dips'],
      name: { ar: 'أجنحة بافلو', en: 'Buffalo Wings' },
      desc: { ar: '8 قطع أجنحة بصوص بافلو حار مع رانش.', en: '8 wings tossed in hot buffalo sauce, with ranch.' }
    },
    {
      id: 'sn-strips', cat: 'snacks', img: 'sn-strips', price: 7000, tags: [],
      options: ['dips'],
      name: { ar: 'ستربس دجاج', en: 'Chicken Strips' },
      desc: { ar: '5 قطع ستربس مقرمشة مع صوص عسل وخردل.', en: '5 crispy strips with honey mustard.' }
    },
    {
      id: 'sn-mozzarella', cat: 'snacks', img: 'sn-mozzarella', price: 5000, tags: ['veg'],
      options: ['dips'],
      name: { ar: 'أصابع موزاريلا', en: 'Mozzarella Sticks' },
      desc: { ar: '6 أصابع موزاريلا مقرمشة مع صوص مارينارا.', en: '6 crispy mozzarella sticks with marinara.' }
    },
    {
      id: 'sn-broasted', cat: 'snacks', img: 'sn-broasted', price: 9500, tags: ['new'],
      options: ['heat', 'dips'],
      name: { ar: 'بروستد', en: 'Broasted Chicken' },
      desc: { ar: '4 قطع دجاج بروستد مقرمش مع ثومية وبطاطا.', en: '4 pieces of crispy broasted chicken with garlic dip and fries.' }
    },

    /* ---------- Drinks ---------- */
    {
      id: 'dr-lemon-mint', cat: 'drinks', img: 'dr-lemon-mint', price: 3000, tags: [],
      options: ['drinkSize'],
      name: { ar: 'ليمون ونعناع', en: 'Lemon Mint' },
      desc: { ar: 'ليمون طازج مع نعناع وثلج مجروش.', en: 'Fresh lemon with mint and crushed ice.' }
    },
    {
      id: 'dr-iced-tea', cat: 'drinks', img: 'dr-iced-tea', price: 2500, tags: [],
      options: ['drinkSize'],
      name: { ar: 'شاي مثلّج', en: 'Iced Tea' },
      desc: { ar: 'شاي بارد بالليمون.', en: 'Chilled tea with lemon.' }
    },
    {
      id: 'dr-mojito', cat: 'drinks', img: 'dr-mojito', price: 3500, tags: ['new'],
      options: ['drinkSize'],
      name: { ar: 'موهيتو نعناع', en: 'Mint Mojito' },
      desc: { ar: 'صودا، ليمون، نعناع وسكر قصب.', en: 'Soda, lime, mint and cane sugar.' }
    },

    /* ---------- Deals ---------- */
    {
      id: 'of-burger-combo', cat: 'deals', img: 'of-burger-combo', price: 9500, was: 12500, tags: [], dealOfDay: true,
      options: [],
      name: { ar: 'وجبة برغر نار', en: 'Naar Burger Meal' },
      desc: { ar: 'برغر كلاسيك + بطاطا كلاسيك + شاي مثلّج.', en: 'Classic burger + classic fries + iced tea.' }
    },
    {
      id: 'of-family', cat: 'deals', img: 'of-family', price: 33000, was: 40500, tags: [],
      options: [],
      name: { ar: 'بوكس العائلة', en: 'Family Box' },
      desc: { ar: 'بيبروني كبيرة + مارغريتا كبيرة + بطاطا لودد + 2 ليمون ونعناع.', en: 'Large pepperoni + large margherita + loaded fries + 2 lemon mints.' }
    },
    {
      id: 'of-zinger-duo', cat: 'deals', img: 'of-zinger-duo', price: 12500, was: 15500, tags: ['hot'],
      options: [],
      name: { ar: 'دبل زنجر', en: 'Zinger Duo' },
      desc: { ar: '2 زنجر نار + بطاطا كلاسيك.', en: '2 Naar Zingers + classic fries.' }
    }
  ]
};
