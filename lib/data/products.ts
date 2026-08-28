import { Product } from "@/types/product";

let nextSizeId = 10000;
let nextVariantId = 20000;

const sizes = (...labels: string[]) =>
    labels.map((label) => ({
        id: nextSizeId++,
        label,
    }));

const productWithVariants = (
    id: number,
    name: string,
    category: string,
    variantNames: string[],
    sizeLabels: string[] = ["1 count"]
): Product => ({
    id,
    name,
    category,
    variants: variantNames.map((name) => ({
        id: nextVariantId++,
        name,
        sizes: sizes(...sizeLabels),
    })),
});

export const products: Product[] = [
    // =========================
    // DAIRY & EGGS
    // =========================

    productWithVariants(
        1,
        "Milk",
        "Dairy",
        [
            "Whole Milk",
            "2% Milk",
            "1% Milk",
            "Skim Milk",
            "Lactose-Free Milk",
            "Chocolate Milk",
        ],
        ["1 quart", "1 gallon"]
    ),

    productWithVariants(
        2,
        "Eggs",
        "Dairy",
        [
            "Large White Eggs",
            "Large Brown Eggs",
            "Organic Eggs",
            "Free Range Eggs",
            "Cage Free Eggs",
        ],
        ["6 count", "12 count", "18 count"]
    ),

    productWithVariants(
        3,
        "Cheese",
        "Dairy",
        [
            "Cheddar",
            "Mozzarella",
            "Colby Jack",
            "Pepper Jack",
            "Swiss",
            "Provolone",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        4,
        "Yogurt",
        "Dairy",
        [
            "Vanilla",
            "Strawberry",
            "Blueberry",
            "Greek",
            "Plain",
            "Peach",
        ],
        ["5.3 oz", "32 oz"]
    ),

    productWithVariants(
        5,
        "Butter",
        "Dairy",
        [
            "Salted",
            "Unsalted",
            "Organic",
        ],
        ["4 sticks", "1 lb"]
    ),

    productWithVariants(
        6,
        "Cream Cheese",
        "Dairy",
        [
            "Original",
            "Reduced Fat",
            "Whipped",
            "Strawberry",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        7,
        "Sour Cream",
        "Dairy",
        [
            "Original",
            "Light",
            "Fat Free",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        8,
        "Cottage Cheese",
        "Dairy",
        [
            "Small Curd",
            "Large Curd",
            "Low Fat",
            "Fat Free",
        ],
        ["16 oz", "24 oz"]
    ),

    productWithVariants(
        9,
        "Heavy Cream",
        "Dairy",
        [
            "Heavy Whipping Cream",
            "Whipping Cream",
        ],
        ["1 pint", "1 quart"]
    ),

    productWithVariants(
        10,
        "Half and Half",
        "Dairy",
        [
            "Original",
            "Fat Free",
        ],
        ["1 pint", "1 quart"]
    ),

    productWithVariants(
        11,
        "Creamer",
        "Dairy",
        [
            "Original",
            "Vanilla",
            "Hazelnut",
            "Caramel",
            "French Vanilla",
        ],
        ["32 oz", "64 oz"]
    ),

    productWithVariants(
        12,
        "Parmesan Cheese",
        "Dairy",
        [
            "Grated",
            "Shredded",
            "Fresh",
        ],
        ["5 oz", "8 oz", "16 oz"]
    ),

    productWithVariants(
        13,
        "Feta Cheese",
        "Dairy",
        [
            "Traditional",
            "Reduced Fat",
            "Crumbled",
        ],
        ["4 oz", "8 oz"]
    ),

    productWithVariants(
        14,
        "String Cheese",
        "Dairy",
        [
            "Mozzarella",
            "Colby Jack",
            "Cheddar",
        ],
        ["8 count", "12 count"]
    ),

    productWithVariants(
        15,
        "Shredded Cheese",
        "Dairy",
        [
            "Cheddar",
            "Mexican Blend",
            "Italian Blend",
            "Mozzarella",
            "Colby Jack",
        ],
        ["8 oz", "16 oz"]
    ),

    // =========================
    // MEAT & SEAFOOD
    // =========================

    productWithVariants(
        16,
        "Chicken Breast",
        "Meat",
        [
            "Boneless Skinless",
            "Bone-In",
            "Thin Sliced",
            "Organic",
        ],
        ["1 lb", "2 lb", "3 lb"]
    ),

    productWithVariants(
        17,
        "Chicken Thighs",
        "Meat",
        [
            "Boneless Skinless",
            "Bone-In",
        ],
        ["1 lb", "2 lb", "3 lb"]
    ),

    productWithVariants(
        18,
        "Chicken Wings",
        "Meat",
        [
            "Whole Wings",
            "Party Wings",
            "Drumettes",
        ],
        ["1 lb", "2 lb", "3 lb"]
    ),

    productWithVariants(
        19,
        "Chicken Drumsticks",
        "Meat",
        [
            "Regular",
            "Organic",
        ],
        ["1 lb", "2 lb", "3 lb"]
    ),

    productWithVariants(
        20,
        "Ground Beef",
        "Meat",
        [
            "80/20",
            "85/15",
            "90/10",
            "93/7",
            "Grass Fed",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        21,
        "Steak",
        "Meat",
        [
            "Ribeye",
            "New York Strip",
            "Sirloin",
            "T-Bone",
            "Filet Mignon",
        ],
        ["8 oz", "12 oz", "16 oz"]
    ),

    productWithVariants(
        22,
        "Pork Chops",
        "Meat",
        [
            "Boneless",
            "Bone-In",
            "Center Cut",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        23,
        "Pork Tenderloin",
        "Meat",
        [
            "Original",
            "Seasoned",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        24,
        "Bacon",
        "Meat",
        [
            "Original",
            "Thick Cut",
            "Applewood Smoked",
            "Turkey Bacon",
        ],
        ["12 oz", "16 oz"]
    ),

    productWithVariants(
        25,
        "Sausage",
        "Meat",
        [
            "Italian",
            "Breakfast",
            "Bratwurst",
            "Andouille",
            "Turkey",
        ],
        ["12 oz", "16 oz"]
    ),

    productWithVariants(
        26,
        "Hot Dogs",
        "Meat",
        [
            "Beef",
            "Classic",
            "Jumbo",
            "Turkey",
            "Chicken",
        ],
        ["8 count", "10 count", "16 count"]
    ),

    productWithVariants(
        27,
        "Deli Ham",
        "Meat",
        [
            "Honey Ham",
            "Black Forest Ham",
            "Smoked Ham",
        ],
        ["8 oz", "1 lb"]
    ),

    productWithVariants(
        28,
        "Deli Turkey",
        "Meat",
        [
            "Oven Roasted",
            "Smoked",
            "Honey Roasted",
            "Pepper Turkey",
        ],
        ["8 oz", "1 lb"]
    ),

    productWithVariants(
        29,
        "Salami",
        "Meat",
        [
            "Genoa",
            "Hard Salami",
            "Pepperoni",
        ],
        ["8 oz", "1 lb"]
    ),

    productWithVariants(
        30,
        "Ground Turkey",
        "Meat",
        [
            "93/7",
            "85/15",
            "99% Lean",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        31,
        "Salmon",
        "Seafood",
        [
            "Atlantic",
            "Sockeye",
            "Wild Caught",
            "Farm Raised",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        32,
        "Shrimp",
        "Seafood",
        [
            "Small",
            "Medium",
            "Large",
            "Jumbo",
        ],
        ["12 oz", "1 lb", "2 lb"]
    ),

    productWithVariants(
        33,
        "Tuna",
        "Seafood",
        [
            "Yellowfin",
            "Albacore",
            "Ahi",
        ],
        ["8 oz", "1 lb"]
    ),

    productWithVariants(
        34,
        "Tilapia",
        "Seafood",
        [
            "Fresh",
            "Frozen",
            "Wild Caught",
        ],
        ["1 lb", "2 lb"]
    ),

    // =========================
    // BAKERY & BREAD
    // =========================

    productWithVariants(
        35,
        "Bread",
        "Bakery",
        [
            "White Bread",
            "Wheat Bread",
            "Honey Wheat",
            "Whole Grain",
            "Multigrain",
            "Sourdough",
            "Rye",
        ],
        ["20 oz", "24 oz"]
    ),

    productWithVariants(
        36,
        "Hamburger Buns",
        "Bakery",
        [
            "Regular",
            "Brioche",
            "Whole Wheat",
            "Sesame",
        ],
        ["8 count", "12 count"]
    ),

    productWithVariants(
        37,
        "Hot Dog Buns",
        "Bakery",
        [
            "Regular",
            "New England",
            "Whole Wheat",
        ],
        ["8 count", "12 count"]
    ),

    productWithVariants(
        38,
        "Tortillas",
        "Bakery",
        [
            "Flour",
            "Whole Wheat",
            "Corn",
            "Low Carb",
            "Spinach",
        ],
        ["8 count", "10 count", "20 count"]
    ),

    productWithVariants(
        39,
        "Bagels",
        "Bakery",
        [
            "Plain",
            "Everything",
            "Cinnamon Raisin",
            "Blueberry",
            "Sesame",
            "Whole Wheat",
        ],
        ["6 count", "12 count"]
    ),

    productWithVariants(
        40,
        "English Muffins",
        "Bakery",
        [
            "Original",
            "Whole Wheat",
            "Sourdough",
        ],
        ["6 count", "12 count"]
    ),

    productWithVariants(
        41,
        "Croissants",
        "Bakery",
        [
            "Butter",
            "Chocolate",
            "Almond",
        ],
        ["4 count", "6 count"]
    ),

    productWithVariants(
        42,
        "Dinner Rolls",
        "Bakery",
        [
            "Original",
            "Hawaiian",
            "Whole Wheat",
        ],
        ["12 count", "24 count"]
    ),

    productWithVariants(
        43,
        "Muffins",
        "Bakery",
        [
            "Blueberry",
            "Chocolate Chip",
            "Banana Nut",
            "Bran",
        ],
        ["4 count", "6 count"]
    ),

    productWithVariants(
        44,
        "Donuts",
        "Bakery",
        [
            "Glazed",
            "Chocolate",
            "Powdered",
            "Assorted",
        ],
        ["6 count", "12 count"]
    ),

    productWithVariants(
        45,
        "Cake",
        "Bakery",
        [
            "Chocolate",
            "Vanilla",
            "Red Velvet",
            "Carrot",
        ],
        ["8 inch", "10 inch"]
    ),

    productWithVariants(
        46,
        "Cookies",
        "Bakery",
        [
            "Chocolate Chip",
            "Sugar",
            "Oatmeal Raisin",
            "Peanut Butter",
        ],
        ["12 oz", "24 oz"]
    ),

    // =========================
    // GRAINS & RICE
    // =========================

    productWithVariants(
        47,
        "Rice",
        "Grains",
        [
            "Long Grain White Rice",
            "Long Grain Brown Rice",
            "Jasmine Rice",
            "Basmati Rice",
            "Arborio Rice",
            "Wild Rice",
        ],
        ["2 lb", "5 lb", "10 lb"]
    ),

    productWithVariants(
        48,
        "Pasta",
        "Grains",
        [
            "Spaghetti",
            "Penne",
            "Rotini",
            "Fettuccine",
            "Elbow Macaroni",
            "Angel Hair",
        ],
        ["12 oz", "16 oz"]
    ),

    productWithVariants(
        49,
        "Macaroni and Cheese",
        "Grains",
        [
            "Original",
            "White Cheddar",
            "Shells and Cheese",
            "Deluxe",
        ],
        ["7.25 oz", "14 oz"]
    ),

    productWithVariants(
        50,
        "Rice-A-Roni",
        "Grains",
        [
            "Chicken Flavor",
            "Beef Flavor",
            "Spanish Rice",
            "Creamy Four Cheese",
            "Rice Pilaf",
        ],
        ["6.9 oz", "12.6 oz"]
    ),

    productWithVariants(
        51,
        "Couscous",
        "Grains",
        [
            "Original",
            "Pearl",
            "Whole Wheat",
        ],
        ["10 oz", "16 oz"]
    ),

    productWithVariants(
        52,
        "Quinoa",
        "Grains",
        [
            "White",
            "Red",
            "Tri Color",
        ],
        ["12 oz", "24 oz"]
    ),

    productWithVariants(
        53,
        "Oatmeal",
        "Breakfast",
        [
            "Original",
            "Maple Brown Sugar",
            "Apple Cinnamon",
            "Blueberry",
            "Variety Pack",
        ],
        ["10 count", "18 count", "42 oz"]
    ),

    productWithVariants(
        54,
        "Cereal",
        "Breakfast",
        [
            "Corn Flakes",
            "Cheerios",
            "Frosted Flakes",
            "Raisin Bran",
            "Rice Krispies",
            "Cinnamon Cereal",
        ],
        ["12 oz", "18 oz", "24 oz"]
    ),

    productWithVariants(
        55,
        "Granola",
        "Breakfast",
        [
            "Honey",
            "Oats and Honey",
            "Chocolate",
            "Almond",
            "Fruit and Nut",
        ],
        ["11 oz", "24 oz"]
    ),

    productWithVariants(
        56,
        "Pancake Mix",
        "Breakfast",
        [
            "Original",
            "Buttermilk",
            "Complete",
            "Protein",
        ],
        ["32 oz", "40 oz"]
    ),

    productWithVariants(
        57,
        "Waffle Mix",
        "Breakfast",
        [
            "Original",
            "Buttermilk",
            "Belgian",
        ],
        ["24 oz", "32 oz"]
    ),

    // =========================
    // CANNED & JARRED FOODS
    // =========================

    productWithVariants(
        58,
        "Tomato Sauce",
        "Canned Goods",
        [
            "Traditional",
            "Marinara",
            "Roasted Garlic",
            "Basil",
        ],
        ["15 oz", "24 oz"]
    ),

    productWithVariants(
        59,
        "Diced Tomatoes",
        "Canned Goods",
        [
            "Original",
            "Fire Roasted",
            "Italian Style",
            "No Salt Added",
        ],
        ["14.5 oz", "28 oz"]
    ),

    productWithVariants(
        60,
        "Tomato Paste",
        "Canned Goods",
        [
            "Original",
            "No Salt Added",
        ],
        ["6 oz", "12 oz"]
    ),

    productWithVariants(
        61,
        "Crushed Tomatoes",
        "Canned Goods",
        [
            "Original",
            "Italian Style",
        ],
        ["14.5 oz", "28 oz"]
    ),

    productWithVariants(
        62,
        "Black Beans",
        "Canned Goods",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["15 oz", "29 oz"]
    ),

    productWithVariants(
        63,
        "Kidney Beans",
        "Canned Goods",
        [
            "Light Red",
            "Dark Red",
            "Low Sodium",
        ],
        ["15 oz", "29 oz"]
    ),

    productWithVariants(
        64,
        "Pinto Beans",
        "Canned Goods",
        [
            "Original",
            "Low Sodium",
            "Refried",
        ],
        ["15 oz", "29 oz"]
    ),

    productWithVariants(
        65,
        "Chickpeas",
        "Canned Goods",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["15 oz", "29 oz"]
    ),

    productWithVariants(
        66,
        "Corn",
        "Canned Goods",
        [
            "Whole Kernel",
            "Cream Style",
            "No Salt Added",
        ],
        ["15 oz", "29 oz"]
    ),

    productWithVariants(
        67,
        "Green Beans",
        "Canned Goods",
        [
            "Cut",
            "French Style",
            "No Salt Added",
        ],
        ["14.5 oz", "29 oz"]
    ),

    productWithVariants(
        68,
        "Peas",
        "Canned Goods",
        [
            "Sweet Peas",
            "No Salt Added",
            "Peas and Carrots",
        ],
        ["15 oz", "29 oz"]
    ),

    productWithVariants(
        69,
        "Mushrooms",
        "Canned Goods",
        [
            "White",
            "Baby Bella",
            "Portobello",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        70,
        "Canned Tuna",
        "Canned Goods",
        [
            "Chunk Light",
            "Solid White Albacore",
            "Yellowfin",
        ],
        ["5 oz", "12 oz"]
    ),

    productWithVariants(
        71,
        "Chicken Soup",
        "Canned Goods",
        [
            "Chicken Noodle",
            "Cream of Chicken",
            "Chicken and Rice",
        ],
        ["10.5 oz", "22 oz"]
    ),

    productWithVariants(
        72,
        "Tomato Soup",
        "Canned Goods",
        [
            "Original",
            "Creamy",
            "Roasted Tomato",
        ],
        ["10.75 oz", "22 oz"]
    ),

    productWithVariants(
        73,
        "Vegetable Soup",
        "Canned Goods",
        [
            "Classic",
            "Hearty",
            "Low Sodium",
        ],
        ["15 oz", "22 oz"]
    ),

    // =========================
    // FRUITS
    // =========================

    productWithVariants(
        74,
        "Apples",
        "Produce",
        [
            "Gala",
            "Fuji",
            "Honeycrisp",
            "Granny Smith",
            "Red Delicious",
            "Pink Lady",
        ],
        ["1 lb", "3 lb", "5 lb"]
    ),

    productWithVariants(
        75,
        "Bananas",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["1 lb", "3 lb"]
    ),

    productWithVariants(
        76,
        "Oranges",
        "Produce",
        [
            "Navel",
            "Valencia",
            "Cara Cara",
        ],
        ["3 count", "4 lb"]
    ),

    productWithVariants(
        77,
        "Mandarins",
        "Produce",
        [
            "Clementines",
            "Cuties",
            "Mandarins",
        ],
        ["2 lb", "3 lb"]
    ),

    productWithVariants(
        78,
        "Lemons",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["3 count", "6 count"]
    ),

    productWithVariants(
        79,
        "Limes",
        "Produce",
        [
            "Regular",
            "Key Limes",
        ],
        ["4 count", "8 count"]
    ),

    productWithVariants(
        80,
        "Strawberries",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        81,
        "Blueberries",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["6 oz", "1 pint"]
    ),

    productWithVariants(
        82,
        "Raspberries",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["6 oz", "12 oz"]
    ),

    productWithVariants(
        83,
        "Blackberries",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["6 oz", "12 oz"]
    ),

    productWithVariants(
        84,
        "Grapes",
        "Produce",
        [
            "Green",
            "Red",
            "Black",
            "Cotton Candy",
        ],
        ["1 lb", "2 lb", "3 lb"]
    ),

    productWithVariants(
        85,
        "Pineapple",
        "Produce",
        [
            "Whole",
            "Pre Cut",
        ],
        ["1 count", "16 oz"]
    ),

    productWithVariants(
        86,
        "Watermelon",
        "Produce",
        [
            "Whole",
            "Mini",
            "Pre Cut",
        ],
        ["1 count", "16 oz"]
    ),

    productWithVariants(
        87,
        "Mango",
        "Produce",
        [
            "Regular",
            "Organic",
            "Pre Cut",
        ],
        ["1 count", "16 oz"]
    ),

    productWithVariants(
        88,
        "Peaches",
        "Produce",
        [
            "Yellow",
            "White",
            "Organic",
        ],
        ["2 lb", "4 lb"]
    ),

    productWithVariants(
        89,
        "Pears",
        "Produce",
        [
            "Bartlett",
            "Anjou",
            "Bosc",
            "Asian",
        ],
        ["2 lb", "4 lb"]
    ),

    productWithVariants(
        90,
        "Avocado",
        "Produce",
        [
            "Hass",
            "Large Hass",
            "Organic",
        ],
        ["1 count", "4 count"]
    ),

    // =========================
    // VEGETABLES
    // =========================

    productWithVariants(
        91,
        "Potatoes",
        "Produce",
        [
            "Russet",
            "Red",
            "Yukon Gold",
            "Yellow",
            "Fingerling",
        ],
        ["3 lb", "5 lb", "10 lb"]
    ),

    productWithVariants(
        92,
        "Sweet Potatoes",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["2 lb", "3 lb"]
    ),

    productWithVariants(
        93,
        "Onions",
        "Produce",
        [
            "Yellow",
            "White",
            "Red",
            "Sweet",
        ],
        ["1 lb", "3 lb", "5 lb"]
    ),

    productWithVariants(
        94,
        "Garlic",
        "Produce",
        [
            "Whole Bulb",
            "Peeled",
            "Minced",
        ],
        ["1 count", "3 count", "8 oz"]
    ),

    productWithVariants(
        95,
        "Tomatoes",
        "Produce",
        [
            "Roma",
            "Vine",
            "Beefsteak",
            "Cherry",
            "Grape",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        96,
        "Bell Peppers",
        "Produce",
        [
            "Green",
            "Red",
            "Yellow",
            "Orange",
            "Mixed",
        ],
        ["1 count", "3 count", "6 count"]
    ),

    productWithVariants(
        97,
        "Jalapenos",
        "Produce",
        [
            "Fresh",
            "Sliced",
            "Pickled",
        ],
        ["4 oz", "8 oz", "16 oz"]
    ),

    productWithVariants(
        98,
        "Broccoli",
        "Produce",
        [
            "Crowns",
            "Florets",
            "Organic",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        99,
        "Cauliflower",
        "Produce",
        [
            "Whole",
            "Florets",
            "Organic",
        ],
        ["1 count", "16 oz"]
    ),

    productWithVariants(
        100,
        "Carrots",
        "Produce",
        [
            "Whole",
            "Baby",
            "Organic",
            "Shredded",
        ],
        ["1 lb", "2 lb", "5 lb"]
    ),

    productWithVariants(
        101,
        "Celery",
        "Produce",
        [
            "Whole",
            "Hearts",
            "Organic",
        ],
        ["1 count", "2 count"]
    ),

    productWithVariants(
        102,
        "Spinach",
        "Produce",
        [
            "Baby Spinach",
            "Regular",
            "Organic",
        ],
        ["5 oz", "10 oz", "16 oz"]
    ),

    productWithVariants(
        103,
        "Lettuce",
        "Produce",
        [
            "Iceberg",
            "Romaine",
            "Green Leaf",
            "Butter Lettuce",
        ],
        ["1 head", "2 count"]
    ),

    productWithVariants(
        104,
        "Salad Mix",
        "Produce",
        [
            "Spring Mix",
            "Caesar",
            "Garden",
            "Baby Greens",
        ],
        ["5 oz", "10 oz"]
    ),

    productWithVariants(
        105,
        "Cucumber",
        "Produce",
        [
            "Regular",
            "English",
            "Mini",
        ],
        ["1 count", "3 count"]
    ),

    productWithVariants(
        106,
        "Zucchini",
        "Produce",
        [
            "Regular",
            "Organic",
        ],
        ["1 lb", "2 lb"]
    ),

    // Renamed to avoid duplicate "Mushrooms" product
    productWithVariants(
        107,
        "Fresh Mushrooms",
        "Produce",
        [
            "White",
            "Baby Bella",
            "Portobello",
            "Shiitake",
        ],
        ["8 oz", "16 oz"]
    ),

    // Renamed to avoid duplicate "Corn" product
    productWithVariants(
        108,
        "Fresh Corn",
        "Produce",
        [
            "Fresh",
            "White",
            "Bi Color",
        ],
        ["4 count", "6 count"]
    ),

    // Renamed to avoid duplicate "Green Beans" product
    productWithVariants(
        109,
        "Fresh Green Beans",
        "Produce",
        [
            "Regular",
            "Organic",
            "French Style",
        ],
        ["1 lb", "2 lb"]
    ),

    productWithVariants(
        110,
        "Asparagus",
        "Produce",
        [
            "Regular",
            "Organic",
            "Thin",
        ],
        ["1 lb", "2 lb"]
    ),

    // =========================
    // FROZEN FOODS
    // =========================

    productWithVariants(
        111,
        "Frozen Pizza",
        "Frozen",
        [
            "Pepperoni",
            "Cheese",
            "Supreme",
            "Four Cheese",
            "Margherita",
        ],
        ["12 oz", "18 oz", "30 oz"]
    ),

    productWithVariants(
        112,
        "Frozen Vegetables",
        "Frozen",
        [
            "Mixed Vegetables",
            "Broccoli",
            "Green Beans",
            "Corn",
            "Peas",
            "California Blend",
        ],
        ["12 oz", "16 oz", "24 oz"]
    ),

    productWithVariants(
        113,
        "Frozen Fruit",
        "Frozen",
        [
            "Strawberries",
            "Blueberries",
            "Mango",
            "Mixed Berries",
            "Tropical Blend",
        ],
        ["12 oz", "24 oz", "32 oz"]
    ),

    productWithVariants(
        114,
        "French Fries",
        "Frozen",
        [
            "Straight Cut",
            "Crinkle Cut",
            "Shoestring",
            "Waffle Fries",
            "Seasoned",
        ],
        ["26 oz", "32 oz"]
    ),

    productWithVariants(
        115,
        "Tater Tots",
        "Frozen",
        [
            "Original",
            "Seasoned",
            "Mini",
        ],
        ["28 oz", "32 oz"]
    ),

    productWithVariants(
        116,
        "Chicken Nuggets",
        "Frozen",
        [
            "Original",
            "Breaded",
            "Grilled",
            "Dino Nuggets",
        ],
        ["12 oz", "24 oz", "32 oz"]
    ),

    productWithVariants(
        117,
        "Chicken Tenders",
        "Frozen",
        [
            "Breaded",
            "Crispy",
            "Grilled",
        ],
        ["12 oz", "24 oz"]
    ),

    productWithVariants(
        118,
        "Frozen Burritos",
        "Frozen",
        [
            "Bean and Cheese",
            "Beef",
            "Chicken",
            "Breakfast",
        ],
        ["5 count", "8 count"]
    ),

    productWithVariants(
        119,
        "Frozen Waffles",
        "Frozen",
        [
            "Original",
            "Blueberry",
            "Belgian",
            "Protein",
        ],
        ["8 count", "10 count"]
    ),

    productWithVariants(
        120,
        "Frozen Pancakes",
        "Frozen",
        [
            "Original",
            "Buttermilk",
            "Blueberry",
        ],
        ["8 count", "24 count"]
    ),

    productWithVariants(
        121,
        "Ice Cream",
        "Frozen",
        [
            "Vanilla",
            "Chocolate",
            "Strawberry",
            "Cookies and Cream",
            "Mint Chocolate Chip",
            "Rocky Road",
        ],
        ["48 oz", "64 oz"]
    ),

    productWithVariants(
        122,
        "Frozen Yogurt",
        "Frozen",
        [
            "Vanilla",
            "Strawberry",
            "Chocolate",
        ],
        ["32 oz", "48 oz"]
    ),

    productWithVariants(
        123,
        "Popsicles",
        "Frozen",
        [
            "Fruit",
            "Cream",
            "Assorted",
        ],
        ["12 count", "18 count"]
    ),

    // =========================
    // SNACKS
    // =========================

    productWithVariants(
        124,
        "Potato Chips",
        "Snacks",
        [
            "Original",
            "Sour Cream and Onion",
            "BBQ",
            "Salt and Vinegar",
            "Jalapeno",
            "Kettle",
        ],
        ["7.75 oz", "13 oz"]
    ),

    productWithVariants(
        125,
        "Tortilla Chips",
        "Snacks",
        [
            "Restaurant Style",
            "Yellow Corn",
            "White Corn",
            "Nacho Cheese",
            "Hint of Lime",
        ],
        ["9 oz", "13 oz", "18 oz"]
    ),

    productWithVariants(
        126,
        "Doritos",
        "Snacks",
        [
            "Nacho Cheese",
            "Cool Ranch",
            "Spicy Sweet Chili",
            "Flamin Hot",
        ],
        ["9.25 oz", "14.5 oz"]
    ),

    productWithVariants(
        127,
        "Cheetos",
        "Snacks",
        [
            "Crunchy",
            "Puffs",
            "Flamin Hot",
            "White Cheddar",
        ],
        ["8.5 oz", "13 oz"]
    ),

    productWithVariants(
        128,
        "Pretzels",
        "Snacks",
        [
            "Original",
            "Mini",
            "Sticks",
            "Butter",
        ],
        ["12 oz", "16 oz"]
    ),

    productWithVariants(
        129,
        "Popcorn",
        "Snacks",
        [
            "Butter",
            "Movie Theater",
            "Kettle Corn",
            "Light",
        ],
        ["3 count", "6 count", "12 count"]
    ),

    productWithVariants(
        130,
        "Crackers",
        "Snacks",
        [
            "Saltines",
            "Ritz Style",
            "Cheese",
            "Whole Wheat",
            "Club",
        ],
        ["9 oz", "13 oz", "16 oz"]
    ),

    productWithVariants(
        131,
        "Granola Bars",
        "Snacks",
        [
            "Oats and Honey",
            "Chocolate Chip",
            "Peanut Butter",
            "Chewy",
            "Protein",
        ],
        ["6 count", "12 count", "18 count"]
    ),

    productWithVariants(
        132,
        "Protein Bars",
        "Snacks",
        [
            "Chocolate",
            "Peanut Butter",
            "Cookies and Cream",
            "Caramel",
        ],
        ["4 count", "6 count", "12 count"]
    ),

    productWithVariants(
        133,
        "Trail Mix",
        "Snacks",
        [
            "Classic",
            "Peanut Raisin",
            "Mountain Trail",
            "Tropical",
        ],
        ["6 oz", "12 oz", "26 oz"]
    ),

    productWithVariants(
        134,
        "Nuts",
        "Snacks",
        [
            "Almonds",
            "Cashews",
            "Peanuts",
            "Pistachios",
            "Mixed Nuts",
            "Walnuts",
        ],
        ["8 oz", "16 oz"]
    ),

    // =========================
    // PANTRY / NUT BUTTERS
    // =========================

    productWithVariants(
        135,
        "Peanut Butter",
        "Pantry",
        [
            "Creamy",
            "Crunchy",
            "Natural",
            "Honey",
        ],
        ["16 oz", "28 oz", "40 oz"]
    ),

    productWithVariants(
        136,
        "Almond Butter",
        "Pantry",
        [
            "Creamy",
            "Crunchy",
            "Organic",
        ],
        ["12 oz", "16 oz"]
    ),

    // =========================
    // CONDIMENTS & SAUCES
    // =========================

    productWithVariants(
        137,
        "Ketchup",
        "Condiments",
        [
            "Original",
            "No Sugar Added",
            "Organic",
            "Spicy",
        ],
        ["14 oz", "20 oz", "32 oz"]
    ),

    productWithVariants(
        138,
        "Mustard",
        "Condiments",
        [
            "Yellow",
            "Dijon",
            "Honey Mustard",
            "Spicy Brown",
        ],
        ["8 oz", "12 oz", "20 oz"]
    ),

    productWithVariants(
        139,
        "Mayonnaise",
        "Condiments",
        [
            "Original",
            "Light",
            "Avocado Oil",
            "Olive Oil",
        ],
        ["15 oz", "30 oz"]
    ),

    productWithVariants(
        140,
        "Hot Sauce",
        "Condiments",
        [
            "Original",
            "Buffalo",
            "Extra Hot",
            "Chipotle",
        ],
        ["5 oz", "12 oz"]
    ),

    productWithVariants(
        141,
        "Soy Sauce",
        "Condiments",
        [
            "Regular",
            "Low Sodium",
            "Light Soy Sauce",
            "Dark Soy Sauce",
            "Gluten Free",
        ],
        ["10 oz", "15 oz", "30 oz"]
    ),

    productWithVariants(
        142,
        "Teriyaki Sauce",
        "Condiments",
        [
            "Original",
            "Less Sodium",
            "Garlic",
            "Gluten Free",
        ],
        ["10 oz", "15 oz"]
    ),

    productWithVariants(
        143,
        "BBQ Sauce",
        "Condiments",
        [
            "Original",
            "Honey",
            "Hickory",
            "Spicy",
            "Sweet and Smoky",
        ],
        ["18 oz", "28 oz"]
    ),

    productWithVariants(
        144,
        "Ranch Dressing",
        "Condiments",
        [
            "Original",
            "Light",
            "Homestyle",
            "Spicy",
        ],
        ["16 oz", "24 oz"]
    ),

    productWithVariants(
        145,
        "Italian Dressing",
        "Condiments",
        [
            "Original",
            "Creamy Italian",
            "Light",
            "Zesty",
        ],
        ["16 oz", "24 oz"]
    ),

    productWithVariants(
        146,
        "Caesar Dressing",
        "Condiments",
        [
            "Original",
            "Creamy",
            "Light",
        ],
        ["16 oz", "24 oz"]
    ),

    productWithVariants(
        147,
        "Salsa",
        "Condiments",
        [
            "Mild",
            "Medium",
            "Hot",
            "Restaurant Style",
            "Chunky",
        ],
        ["16 oz", "24 oz"]
    ),

    productWithVariants(
        148,
        "Guacamole",
        "Condiments",
        [
            "Classic",
            "Spicy",
            "Chunky",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        149,
        "Pasta Sauce",
        "Condiments",
        [
            "Marinara",
            "Traditional",
            "Meat Sauce",
            "Roasted Garlic",
            "Four Cheese",
        ],
        ["24 oz", "45 oz"]
    ),

    // =========================
    // BAKING
    // =========================

    productWithVariants(
        150,
        "Flour",
        "Baking",
        [
            "All Purpose",
            "Bread Flour",
            "Whole Wheat",
            "Self Rising",
            "Cake Flour",
        ],
        ["2 lb", "5 lb", "10 lb"]
    ),

    productWithVariants(
        151,
        "Sugar",
        "Baking",
        [
            "Granulated",
            "Powdered",
            "Brown Sugar",
            "Light Brown Sugar",
            "Dark Brown Sugar",
        ],
        ["2 lb", "4 lb"]
    ),

    productWithVariants(
        152,
        "Baking Soda",
        "Baking",
        [
            "Original",
        ],
        ["4 oz", "16 oz"]
    ),

    productWithVariants(
        153,
        "Baking Powder",
        "Baking",
        [
            "Original",
            "Double Acting",
        ],
        ["4 oz", "8 oz"]
    ),

    productWithVariants(
        154,
        "Chocolate Chips",
        "Baking",
        [
            "Semi Sweet",
            "Milk Chocolate",
            "Dark Chocolate",
            "White Chocolate",
        ],
        ["10 oz", "12 oz", "24 oz"]
    ),

    productWithVariants(
        155,
        "Cocoa Powder",
        "Baking",
        [
            "Unsweetened",
            "Dutch Process",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        156,
        "Vanilla Extract",
        "Baking",
        [
            "Pure Vanilla",
            "Imitation Vanilla",
        ],
        ["1 oz", "2 oz", "4 oz"]
    ),

    productWithVariants(
        157,
        "Yeast",
        "Baking",
        [
            "Active Dry",
            "Instant",
            "Rapid Rise",
        ],
        ["3 count", "4 oz"]
    ),

    // =========================
    // PANTRY
    // =========================

    productWithVariants(
        158,
        "Olive Oil",
        "Pantry",
        [
            "Extra Virgin",
            "Pure Olive Oil",
            "Light",
        ],
        ["16 oz", "25 oz", "51 oz"]
    ),

    productWithVariants(
        159,
        "Vegetable Oil",
        "Pantry",
        [
            "Original",
            "Canola",
            "Avocado",
        ],
        ["32 oz", "48 oz", "64 oz"]
    ),

    productWithVariants(
        160,
        "Coconut Oil",
        "Pantry",
        [
            "Refined",
            "Unrefined",
            "Organic",
        ],
        ["14 oz", "28 oz"]
    ),

    productWithVariants(
        161,
        "Vinegar",
        "Pantry",
        [
            "White",
            "Apple Cider",
            "Red Wine",
            "Balsamic",
            "Rice Vinegar",
        ],
        ["16 oz", "32 oz"]
    ),

    productWithVariants(
        162,
        "Salt",
        "Pantry",
        [
            "Table Salt",
            "Sea Salt",
            "Kosher Salt",
            "Himalayan Pink",
        ],
        ["26 oz", "48 oz"]
    ),

    productWithVariants(
        163,
        "Black Pepper",
        "Pantry",
        [
            "Ground",
            "Whole Peppercorns",
            "Cracked",
        ],
        ["2 oz", "4 oz"]
    ),

    productWithVariants(
        164,
        "Garlic Powder",
        "Pantry",
        [
            "Original",
            "Roasted Garlic",
        ],
        ["3 oz", "5 oz"]
    ),

    productWithVariants(
        165,
        "Onion Powder",
        "Pantry",
        [
            "Original",
        ],
        ["3 oz", "5 oz"]
    ),

    productWithVariants(
        166,
        "Paprika",
        "Pantry",
        [
            "Regular",
            "Smoked",
            "Hot",
        ],
        ["2 oz", "4 oz"]
    ),

    productWithVariants(
        167,
        "Cinnamon",
        "Pantry",
        [
            "Ground",
            "Cinnamon Sticks",
        ],
        ["2 oz", "4 oz"]
    ),

    productWithVariants(
        168,
        "Chili Powder",
        "Pantry",
        [
            "Original",
            "Hot",
            "Mexican Style",
        ],
        ["2 oz", "4 oz"]
    ),

    productWithVariants(
        169,
        "Taco Seasoning",
        "Pantry",
        [
            "Original",
            "Mild",
            "Hot",
            "Low Sodium",
        ],
        ["1 oz", "4 oz"]
    ),

    productWithVariants(
        170,
        "Ramen Noodles",
        "Pantry",
        [
            "Chicken",
            "Beef",
            "Shrimp",
            "Pork",
            "Spicy",
        ],
        ["5 count", "12 count"]
    ),

    productWithVariants(
        171,
        "Instant Noodles",
        "Pantry",
        [
            "Chicken",
            "Beef",
            "Vegetable",
            "Spicy",
        ],
        ["5 count", "12 count"]
    ),

    productWithVariants(
        172,
        "Breadcrumbs",
        "Pantry",
        [
            "Plain",
            "Italian",
            "Panko",
            "Seasoned",
        ],
        ["8 oz", "15 oz"]
    ),

    productWithVariants(
        173,
        "Croutons",
        "Pantry",
        [
            "Original",
            "Garlic",
            "Caesar",
            "Italian",
        ],
        ["5 oz", "8 oz"]
    ),

    // =========================
    // BREAKFAST
    // =========================

    // Removed duplicate "Breakfast Cereal" entry.
    // Product 54 already represents cereal.

    productWithVariants(
        175,
        "Pancake Syrup",
        "Breakfast",
        [
            "Original",
            "Butter Rich",
            "Sugar Free",
            "Organic",
        ],
        ["12 oz", "24 oz", "32 oz"]
    ),

    productWithVariants(
        176,
        "Jam",
        "Breakfast",
        [
            "Strawberry",
            "Grape",
            "Raspberry",
            "Apricot",
        ],
        ["18 oz", "32 oz"]
    ),

    productWithVariants(
        177,
        "Jelly",
        "Breakfast",
        [
            "Grape",
            "Strawberry",
            "Apple",
            "Mixed Fruit",
        ],
        ["18 oz", "32 oz"]
    ),

    productWithVariants(
        178,
        "Honey",
        "Breakfast",
        [
            "Clover",
            "Raw",
            "Organic",
            "Wildflower",
        ],
        ["12 oz", "24 oz"]
    ),

    productWithVariants(
        179,
        "Breakfast Sausage",
        "Breakfast",
        [
            "Pork",
            "Turkey",
            "Maple",
            "Spicy",
        ],
        ["12 oz", "16 oz"]
    ),

    // =========================
    // BEVERAGES
    // =========================

    productWithVariants(
        180,
        "Bottled Water",
        "Beverages",
        [
            "Purified",
            "Spring",
            "Mineral",
            "Alkaline",
        ],
        ["6 pack", "12 pack", "24 pack", "32 pack"]
    ),

    productWithVariants(
        181,
        "Sparkling Water",
        "Beverages",
        [
            "Lime",
            "Berry",
            "Lemon",
            "Plain",
            "Grapefruit",
        ],
        ["6 pack", "12 pack"]
    ),

    productWithVariants(
        182,
        "Soda",
        "Beverages",
        [
            "Cola",
            "Diet Cola",
            "Lemon Lime",
            "Root Beer",
            "Orange",
            "Ginger Ale",
        ],
        ["6 pack", "12 pack", "24 pack"]
    ),

    productWithVariants(
        183,
        "Sports Drink",
        "Beverages",
        [
            "Fruit Punch",
            "Lemon Lime",
            "Orange",
            "Berry",
            "Zero Sugar",
        ],
        ["6 pack", "8 pack", "12 pack"]
    ),

    productWithVariants(
        184,
        "Energy Drink",
        "Beverages",
        [
            "Original",
            "Sugar Free",
            "Tropical",
            "Berry",
        ],
        ["4 pack", "12 pack"]
    ),

    productWithVariants(
        185,
        "Orange Juice",
        "Beverages",
        [
            "Original",
            "Pulp Free",
            "Some Pulp",
            "No Sugar Added",
        ],
        ["52 oz", "89 oz"]
    ),

    productWithVariants(
        186,
        "Apple Juice",
        "Beverages",
        [
            "Original",
            "Organic",
            "No Sugar Added",
        ],
        ["64 oz", "128 oz"]
    ),

    productWithVariants(
        187,
        "Lemonade",
        "Beverages",
        [
            "Original",
            "Pink Lemonade",
            "Zero Sugar",
        ],
        ["52 oz", "89 oz"]
    ),

    productWithVariants(
        188,
        "Iced Tea",
        "Beverages",
        [
            "Sweet Tea",
            "Unsweet Tea",
            "Peach",
            "Lemon",
        ],
        ["1 gallon", "2 liter"]
    ),

    productWithVariants(
        189,
        "Coffee",
        "Beverages",
        [
            "Medium Roast",
            "Dark Roast",
            "Light Roast",
            "French Roast",
            "Decaf",
        ],
        ["12 oz", "24 oz", "30 oz"]
    ),

    productWithVariants(
        190,
        "Ground Coffee",
        "Beverages",
        [
            "Medium Roast",
            "Dark Roast",
            "Breakfast Blend",
            "French Roast",
            "Decaf",
        ],
        ["12 oz", "24 oz", "30 oz"]
    ),

    productWithVariants(
        191,
        "Tea",
        "Beverages",
        [
            "Black Tea",
            "Green Tea",
            "Earl Grey",
            "Chamomile",
            "Peppermint",
        ],
        ["20 count", "40 count"]
    ),

    productWithVariants(
        192,
        "Hot Chocolate",
        "Beverages",
        [
            "Original",
            "Dark Chocolate",
            "Marshmallow",
            "Sugar Free",
        ],
        ["8 count", "12 count", "20 oz"]
    ),

    // =========================
    // BABY
    // =========================

    productWithVariants(
        193,
        "Baby Food",
        "Baby",
        [
            "Fruits",
            "Vegetables",
            "Meat",
            "Mixed",
        ],
        ["4 oz", "6 oz"]
    ),

    productWithVariants(
        194,
        "Baby Cereal",
        "Baby",
        [
            "Rice",
            "Oatmeal",
            "Multigrain",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        195,
        "Diapers",
        "Baby",
        [
            "Newborn",
            "Size 1",
            "Size 2",
            "Size 3",
            "Size 4",
            "Size 5",
            "Size 6",
        ],
        ["20 count", "40 count", "80 count"]
    ),

    productWithVariants(
        196,
        "Baby Wipes",
        "Baby",
        [
            "Sensitive",
            "Fragrance Free",
            "Aloe",
            "Unscented",
        ],
        ["56 count", "72 count", "168 count"]
    ),

    // =========================
    // PERSONAL CARE
    // =========================

    productWithVariants(
        197,
        "Shampoo",
        "Personal Care",
        [
            "Daily",
            "Moisturizing",
            "Anti Dandruff",
            "Volumizing",
            "2 in 1",
        ],
        ["12 oz", "25 oz"]
    ),

    productWithVariants(
        198,
        "Conditioner",
        "Personal Care",
        [
            "Daily",
            "Moisturizing",
            "Repair",
            "Volumizing",
        ],
        ["12 oz", "25 oz"]
    ),

    productWithVariants(
        199,
        "Body Wash",
        "Personal Care",
        [
            "Original",
            "Moisturizing",
            "Sensitive",
            "Coconut",
            "Citrus",
        ],
        ["12 oz", "18 oz"]
    ),

    productWithVariants(
        200,
        "Bar Soap",
        "Personal Care",
        [
            "Original",
            "Sensitive",
            "Moisturizing",
            "Antibacterial",
        ],
        ["3 count", "6 count"]
    ),

    productWithVariants(
        201,
        "Toothpaste",
        "Personal Care",
        [
            "Whitening",
            "Cavity Protection",
            "Sensitivity",
            "Tartar Control",
            "Gum Protection",
        ],
        ["4 oz", "6 oz"]
    ),

    productWithVariants(
        202,
        "Toothbrush",
        "Personal Care",
        [
            "Soft",
            "Medium",
            "Electric",
        ],
        ["1 count", "2 count", "4 count"]
    ),

    productWithVariants(
        203,
        "Deodorant",
        "Personal Care",
        [
            "Original",
            "Sport",
            "Sensitive",
            "Fresh",
        ],
        ["2.6 oz", "3 oz"]
    ),

    productWithVariants(
        204,
        "Shaving Cream",
        "Personal Care",
        [
            "Sensitive",
            "Moisturizing",
            "Original",
        ],
        ["7 oz", "10 oz"]
    ),

    productWithVariants(
        205,
        "Razors",
        "Personal Care",
        [
            "Disposable",
            "Cartridge",
            "Sensitive",
        ],
        ["3 count", "6 count", "10 count"]
    ),

    // =========================
    // HOUSEHOLD
    // =========================

    productWithVariants(
        206,
        "Paper Towels",
        "Household",
        [
            "Regular",
            "Ultra Strong",
            "Select a Size",
        ],
        ["2 rolls", "6 rolls", "12 rolls"]
    ),

    productWithVariants(
        207,
        "Toilet Paper",
        "Household",
        [
            "Regular",
            "Ultra Soft",
            "Ultra Strong",
            "Mega Rolls",
        ],
        ["4 rolls", "8 rolls", "12 rolls", "24 rolls"]
    ),

    productWithVariants(
        208,
        "Tissues",
        "Household",
        [
            "Regular",
            "Ultra Soft",
            "Lotion",
        ],
        ["1 box", "3 boxes", "6 boxes"]
    ),

    productWithVariants(
        209,
        "Trash Bags",
        "Household",
        [
            "Small",
            "Kitchen",
            "Tall Kitchen",
            "Large",
            "Contractor",
        ],
        ["20 count", "40 count", "80 count"]
    ),

    productWithVariants(
        210,
        "Dish Soap",
        "Household",
        [
            "Original",
            "Lemon",
            "Free and Clear",
            "Antibacterial",
        ],
        ["16 oz", "24 oz", "32 oz"]
    ),

    productWithVariants(
        211,
        "Dishwasher Detergent",
        "Household",
        [
            "Pods",
            "Liquid",
            "Powder",
        ],
        ["20 count", "40 count", "75 count"]
    ),

    productWithVariants(
        212,
        "Laundry Detergent",
        "Household",
        [
            "Original",
            "Free and Clear",
            "Lavender",
            "Sport",
            "Pods",
        ],
        ["46 oz", "92 oz", "100 count"]
    ),

    productWithVariants(
        213,
        "Fabric Softener",
        "Household",
        [
            "Original",
            "Lavender",
            "Fresh",
        ],
        ["46 oz", "100 oz"]
    ),

    productWithVariants(
        214,
        "All Purpose Cleaner",
        "Household",
        [
            "Original",
            "Lemon",
            "Disinfecting",
            "Multi Surface",
        ],
        ["16 oz", "32 oz"]
    ),

    productWithVariants(
        215,
        "Glass Cleaner",
        "Household",
        [
            "Original",
            "Ammonia Free",
        ],
        ["16 oz", "32 oz"]
    ),

    productWithVariants(
        216,
        "Sponges",
        "Household",
        [
            "Scrub",
            "Heavy Duty",
            "Non Scratch",
        ],
        ["3 count", "6 count", "10 count"]
    ),

    productWithVariants(
        217,
        "Aluminum Foil",
        "Household",
        [
            "Regular",
            "Heavy Duty",
            "Non Stick",
        ],
        ["25 ft", "50 ft", "100 ft"]
    ),

    productWithVariants(
        218,
        "Plastic Wrap",
        "Household",
        [
            "Regular",
            "Press and Seal",
        ],
        ["50 ft", "100 ft", "200 ft"]
    ),

    productWithVariants(
        219,
        "Storage Bags",
        "Household",
        [
            "Snack",
            "Sandwich",
            "Quart",
            "Gallon",
        ],
        ["40 count", "75 count", "100 count"]
    ),

    // =========================
    // MORE PANTRY / GROCERIES
    // =========================

    productWithVariants(
        220,
        "Pickles",
        "Pantry",
        [
            "Dill",
            "Kosher Dill",
            "Bread and Butter",
            "Sweet",
            "Spicy",
        ],
        ["16 oz", "24 oz", "32 oz"]
    ),

    productWithVariants(
        221,
        "Olives",
        "Pantry",
        [
            "Black",
            "Green",
            "Kalamata",
            "Stuffed",
        ],
        ["5 oz", "10 oz", "20 oz"]
    ),

    productWithVariants(
        222,
        "Coconut Milk",
        "Pantry",
        [
            "Original",
            "Light",
            "Unsweetened",
        ],
        ["13.5 oz", "32 oz"]
    ),

    productWithVariants(
        223,
        "Chicken Broth",
        "Pantry",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["14.5 oz", "32 oz", "48 oz"]
    ),

    productWithVariants(
        224,
        "Beef Broth",
        "Pantry",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["14.5 oz", "32 oz", "48 oz"]
    ),

    productWithVariants(
        225,
        "Vegetable Broth",
        "Pantry",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["14.5 oz", "32 oz", "48 oz"]
    ),

    productWithVariants(
        226,
        "Chicken Stock",
        "Pantry",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["32 oz", "48 oz"]
    ),

    productWithVariants(
        227,
        "Beef Stock",
        "Pantry",
        [
            "Original",
            "Low Sodium",
            "Organic",
        ],
        ["32 oz", "48 oz"]
    ),

    productWithVariants(
        228,
        "Hummus",
        "Deli",
        [
            "Classic",
            "Roasted Garlic",
            "Red Pepper",
            "Everything",
            "Spinach",
        ],
        ["8 oz", "16 oz"]
    ),

    productWithVariants(
        229,
        "Coleslaw",
        "Deli",
        [
            "Classic",
            "Creamy",
            "Vinegar",
        ],
        ["16 oz", "32 oz"]
    ),

    productWithVariants(
        230,
        "Potato Salad",
        "Deli",
        [
            "Classic",
            "Mustard",
            "Loaded",
        ],
        ["16 oz", "32 oz"]
    ),

    productWithVariants(
        231,
        "Pasta Salad",
        "Deli",
        [
            "Classic",
            "Italian",
            "Three Cheese",
        ],
        ["16 oz", "32 oz"]
    ),

    productWithVariants(
        232,
        "Rotisserie Chicken",
        "Deli",
        [
            "Original",
            "BBQ",
            "Lemon Pepper",
            "Herb Roasted",
        ],
        ["1 count"]
    ),

    productWithVariants(
        233,
        "Pizza",
        "Deli",
        [
            "Cheese",
            "Pepperoni",
            "Supreme",
            "Vegetable",
        ],
        ["1 count", "2 count"]
    ),
];