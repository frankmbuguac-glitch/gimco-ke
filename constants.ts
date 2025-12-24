import { CatalogItem, ItemType, Order, PaymentStatus, ProductLogisticsStage, ServiceStage, User } from "./types";

export const MOCK_USER: User = {
  id: 'u-101',
  name: 'Kevin Kamau',
  email: 'kevin.kamau@example.co.ke',
  phone: '0712345678',
  measurements: {
    chest: 42,
    waist: 34,
    inseam: 32,
    shoulders: 18,
    sleeve: 25
  }
};

export const MOCK_CUSTOMERS: User[] = [
  MOCK_USER,
  {
    id: 'u-102',
    name: 'Sarah Njeri',
    email: 'sarah.njeri@example.co.ke',
    phone: '0722123456',
    measurements: {
      chest: 36,
      waist: 28,
      inseam: 30,
      shoulders: 16,
      sleeve: 23
    }
  },
  {
    id: 'u-103',
    name: 'David Ochieng',
    email: 'david.o@example.co.ke',
    phone: '0733987654',
    measurements: {
      chest: 44,
      waist: 36,
      inseam: 34,
      shoulders: 19,
      sleeve: 26
    }
  },
  {
    id: 'u-104',
    name: 'Amina Abdi',
    email: 'amina.abdi@example.co.ke',
    phone: '0711555555',
    measurements: {
      chest: 34,
      waist: 26,
      inseam: 29,
      shoulders: 15,
      sleeve: 22
    }
  }
];

export const CATALOG: CatalogItem[] = [
  // ------------------------------------------------------------------
  // MEN'S CATEGORY (Services & Products)
  // ------------------------------------------------------------------
  {
    id: 'm-1',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Bespoke Executive Suit',
    description: 'Premium wool blend, perfect for Nairobi business meetings. Includes jacket and trousers.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
    history: [{ date: '2023-01-01T00:00:00Z', change: 'Item created' }],
    occasions: ['Business Formal', 'Burial', 'Wedding']
  },
  {
    id: 'm-2',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Custom Kitenge Shirt',
    description: 'Tailored fit using high-quality Kitenge fabric. Vibrant African prints available.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1571216682285-b17b6a12dfd8?q=80&w=800&auto=format&fit=crop',
    occasions: ['Traditional Wear', 'Smart Casual', 'Wedding']
  },
  {
    id: 'm-3',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Traditional Agbada Set',
    description: 'Flowing ceremonial robe with intricate embroidery. Ideal for weddings and Ruracios.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1530058287515-51d2f70b777a?q=80&w=800&auto=format&fit=crop',
    occasions: ['Traditional Wear', 'Wedding']
  },
  {
    id: 'm-4',
    type: ItemType.PRODUCT,
    category: 'MEN',
    name: 'Leather Safari Boots',
    description: 'Handcrafted durable leather boots, perfect for the outdoors.',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual']
  },
  {
    id: 'm-5',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Crisp White Poplin Shirt',
    description: 'Essential business wear. 100% Egyptian cotton, tailored to your precise measurements.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Burial']
  },
  {
    id: 'm-6',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Charcoal Three-Piece Suit',
    description: 'Distinguished tailored suit including jacket, waistcoat, and trousers. Pure wool.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding', 'Burial']
  },
  {
    id: 'm-7',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Midnight Blue Tuxedo',
    description: 'For black-tie events. Satin lapels and side stripes on trousers. Perfect for evening galas.',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1555069519-127a4643f303?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding']
  },
  {
    id: 'm-8',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Smart Casual Blazer',
    description: 'Unstructured blazer in breathable linen or cotton blend. Great for weekend socials.',
    price: 11000,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'm-9',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Tailored Wool Slacks',
    description: 'Classic fit dress trousers available in Grey, Black, or Navy. Perfect drape.',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1473966968600-1a2b356b56a9?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Burial']
  },
  {
    id: 'm-10',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Custom Chinos',
    description: 'Versatile cotton chinos, fitted to your leg shape. Available in Khaki, Olive, and Navy.',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'm-11',
    type: ItemType.PRODUCT,
    category: 'MEN',
    name: 'Classic Black Oxfords',
    description: 'Formal leather lace-up shoes for business and events. High-shine finish.',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding', 'Burial']
  },
  {
    id: 'm-12',
    type: ItemType.PRODUCT,
    category: 'MEN',
    name: 'Suede Penny Loafers',
    description: 'Comfortable slip-on shoes for a smart casual look.',
    price: 6800,
    image: 'https://images.unsplash.com/photo-1610484726590-449e7b264188?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'm-13',
    type: ItemType.PRODUCT,
    category: 'MEN',
    name: 'Beige Trench Coat',
    description: 'Classic double-breasted coat. Water-resistant for the rainy season.',
    price: 10500,
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Burial']
  },
  {
    id: 'm-14',
    type: ItemType.PRODUCT,
    category: 'MEN',
    name: 'Merino Wool Cardigan',
    description: 'Soft, lightweight knitwear for layering. V-neck button down.',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1624456728087-c93d489b0b41?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'm-15',
    type: ItemType.SERVICE,
    category: 'MEN',
    name: 'Corporate Branded Polo (Bulk)',
    description: 'High-quality cotton polo shirts with custom embroidery for company branding. Min order 10.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800&auto=format&fit=crop',
    occasions: ['Corporate Branding']
  },

  // ------------------------------------------------------------------
  // WOMEN'S CATEGORY (Services & Products)
  // ------------------------------------------------------------------
  {
    id: 'w-1',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Tailored Ankara Peplum Top',
    description: 'Custom-fitted peplum top in bold Ankara prints. Stylish and versatile.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1565535800049-4ad369269550?q=80&w=800&auto=format&fit=crop',
    occasions: ['Traditional Wear', 'Smart Casual', 'Wedding']
  },
  {
    id: 'w-2',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Modern Office Dress',
    description: 'Professional bespoke dress tailored to your measurements. Choice of premium fabrics.',
    price: 7000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual']
  },
  {
    id: 'w-3',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Evening Silk Gown',
    description: 'Elegant floor-length gown for galas and evening events. Custom embroidery options.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
    occasions: ['Wedding', 'Business Formal']
  },
  {
    id: 'w-4',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Silk Chiffon Blouse',
    description: 'Elegant blouse with a bow tie neck. Available in various pastel shades.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1604514813560-1e4d5886b856?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'w-5',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Tailored Fitted Blazer',
    description: 'Sharp silhouette blazer, essential for the boardroom. Premium wool blend.',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1548624149-f32d32389620?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual']
  },
  {
    id: 'w-6',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'High-Waist Pencil Skirt',
    description: 'Classic knee-length pencil skirt. Perfect fit guaranteed.',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1582142327550-98d600d8324a?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal']
  },
  {
    id: 'w-7',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Formal Dress Trousers',
    description: 'Straight-leg trousers with a comfortable waistband. Professional and chic.',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual']
  },
  {
    id: 'w-8',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Executive Business Dress',
    description: 'A sophisticated dress designed for office wear. Modest yet stylish.',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Burial']
  },
  {
    id: 'w-9',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Power Pantsuit',
    description: 'Complete two-piece suit. Jacket and trousers tailored to perfection.',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1552873820-2c7004b341f9?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding']
  },
  {
    id: 'w-10',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Classic Sheath Dress',
    description: 'Timeless sheath silhouette that flatters every figure.',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Burial']
  },
  {
    id: 'w-11',
    type: ItemType.PRODUCT,
    category: 'WOMEN',
    name: 'Leather Court Heels',
    description: 'Comfortable black leather pumps, ideal for all-day wear.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding', 'Burial']
  },
  {
    id: 'w-12',
    type: ItemType.PRODUCT,
    category: 'WOMEN',
    name: 'Suede Loafers',
    description: 'Chic flat loafers in tan or black suede.',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1559828852-c827c10b784a?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'w-13',
    type: ItemType.PRODUCT,
    category: 'WOMEN',
    name: 'Knit Cardigan',
    description: 'Soft button-down cardigan for layering.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1582210609341-b684666f7764?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'w-14',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Winter Wool Coat',
    description: 'Long tailored coat to keep you warm and stylish during the cold season.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1596706240228-348df803277e?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Burial']
  },
  {
    id: 'w-15',
    type: ItemType.PRODUCT,
    category: 'WOMEN',
    name: 'Sheer Tights (3-Pack)',
    description: 'Durable sheer tights in various skin tones.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1549445946-b60389622df1?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal']
  },
  {
    id: 'w-16',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Midi Wrap Dress',
    description: 'Versatile midi length dress with a flattering wrap design.',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'w-17',
    type: ItemType.SERVICE,
    category: 'WOMEN',
    name: 'Corporate Branded Blouse (Bulk)',
    description: 'Professional branded blouses with company logo embroidery. Minimum order 10 units.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1577900232427-18219b9115a3?q=80&w=800&auto=format&fit=crop',
    occasions: ['Corporate Branding']
  },

  // ------------------------------------------------------------------
  // ACCESSORIES (Mixed Men & Women)
  // ------------------------------------------------------------------
  
  // -- Common Men's Accessories --
  {
    id: 'a-m-1',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Mara Chronograph Watch',
    description: 'Rugged stainless steel watch with a leather strap inspired by the Maasai Mara.',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Smart Casual']
  },
  {
    id: 'a-m-2',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Narok Leather Belt',
    description: 'Full-grain leather belt hand-stitched by artisans in Narok.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual']
  },
  {
    id: 'a-m-3',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Executive Slim Wallet',
    description: 'Minimalist leather cardholder, perfect for M-PESA users carrying cashlite.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual', 'Smart Casual']
  },
  {
    id: 'a-m-4',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Silk Tie - Maasai Red',
    description: '100% Silk tie featuring subtle Maasai-inspired geometric patterns.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding']
  },
  {
    id: 'a-m-5',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Kenya Shield Cufflinks',
    description: 'Gold-plated cufflinks featuring the iconic Kenya shield design.',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1596568359253-1c5db617d092?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding']
  },
  {
    id: 'a-m-6',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Nairobi Aviator Sunglasses',
    description: 'Classic aviator style with polarized lenses for the tropical sun.',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-m-7',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Safari Fedora Hat',
    description: 'Wool felt fedora, stylish protection against the elements.',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-m-8',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Leather Messenger Bag',
    description: 'Durable leather laptop bag suitable for the Nairobi CBD commute.',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Business Casual']
  },
  {
    id: 'a-m-9',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Silver Signet Ring',
    description: 'Hand-forged silver ring with custom engraving options.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual']
  },
  {
    id: 'a-m-12',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Kitenge Pocket Square',
    description: 'Add a pop of African print to your suit jacket.',
    price: 800,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Formal', 'Wedding']
  },
  
  // -- Common Women's Accessories --
  {
    id: 'a-w-1',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Kazuri Bead Earrings',
    description: 'Hand-painted ceramic beads from the famous Kazuri workshop.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-w-2',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Brass Choker Necklace',
    description: 'Contemporary hammered brass choker, crafted in Kibera.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-w-3',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Bone & Brass Bangles',
    description: 'Set of 3 stackable bangles made from recycled materials.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-w-4',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Turquoise Statement Ring',
    description: 'Bold turquoise stone set in recycled sterling silver.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Wedding']
  },
  {
    id: 'a-w-6',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Sisal Kiondo Tote',
    description: 'Traditional handwoven Kiondo bag with leather straps. Spacious and durable.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-w-7',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Mombasa Cat-Eye Sunglasses',
    description: 'Retro-inspired frames perfect for the coast.',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual']
  },
  {
    id: 'a-w-8',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Silk Pashmina Scarf',
    description: 'Soft and luxurious scarf, ideal for cool Nairobi evenings.',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1586078130702-d208859b6223?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'a-w-9',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Wide Waist Cinch Belt',
    description: 'Elasticated belt with a bold brass buckle to accentuate the waist.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1618335359787-8c5dfd4f2913?q=80&w=800&auto=format&fit=crop',
    occasions: ['Business Casual', 'Smart Casual']
  },
  {
    id: 'a-w-10',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Beaded Headband',
    description: 'Intricate beadwork on a comfortable headband.',
    price: 900,
    image: 'https://images.unsplash.com/photo-1596205762024-e91b00e3187c?q=80&w=800&auto=format&fit=crop',
    occasions: ['Traditional Wear', 'Wedding']
  },
  {
    id: 'a-w-12',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Diani Shell Anklet',
    description: 'Delicate anklet featuring cowrie shells.',
    price: 600,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual', 'Traditional Wear']
  },
  {
    id: 'a-w-13',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Lamu Sun Hat',
    description: 'Wide-brimmed straw hat woven in Lamu.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1565799515560-643c16223595?q=80&w=800&auto=format&fit=crop',
    occasions: ['Smart Casual']
  },
  {
    id: 'a-w-14',
    type: ItemType.PRODUCT,
    category: 'ACCESSORIES',
    name: 'Maasai Shuka Shawl',
    description: 'Authentic acrylic shuka in red and black plaid. Multipurpose.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1582298533857-4187f59d57a4?q=80&w=800&auto=format&fit=crop',
    occasions: ['Traditional Wear', 'Smart Casual']
  }
];

// Initial Order History to demonstrate Dual Tracking
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-5501',
    userId: 'u-101',
    customerName: 'Kevin Kamau',
    customerPhone: '0712345678',
    date: '2023-10-15T10:00:00Z',
    totalAmount: 16500,
    paymentStatus: PaymentStatus.PAID,
    items: [
      {
        id: 'oi-1',
        orderId: 'ord-5501',
        catalogItem: CATALOG[0], // Bespoke Suit
        quantity: 1,
        status: ServiceStage.FITTING, // It's in the fitting stage
        customMeasurements: MOCK_USER.measurements
      },
      {
        id: 'oi-2',
        orderId: 'ord-5501',
        catalogItem: CATALOG[26], // Safari Fedora
        quantity: 1,
        status: ProductLogisticsStage.DELIVERED, // Already delivered
        estimatedDelivery: '2023-10-18'
      }
    ]
  },
  {
    id: 'ord-5502',
    userId: 'u-101',
    customerName: 'Kevin Kamau',
    customerPhone: '0712345678',
    date: '2023-10-20T14:30:00Z',
    totalAmount: 6500,
    paymentStatus: PaymentStatus.PAID,
    items: [
      {
        id: 'oi-3',
        orderId: 'ord-5502',
        catalogItem: CATALOG[3], // Leather Boots
        quantity: 1,
        status: ProductLogisticsStage.SHIPPED, // En route
        estimatedDelivery: '2023-10-25'
      }
    ]
  },
  // Added order for Sarah Njeri
  {
    id: 'ord-5503',
    userId: 'u-102',
    customerName: 'Sarah Njeri',
    customerPhone: '0722123456',
    date: '2023-10-25T09:15:00Z',
    totalAmount: 11500,
    paymentStatus: PaymentStatus.PAID,
    items: [
      {
        id: 'oi-4',
        orderId: 'ord-5503',
        catalogItem: CATALOG[15], // Tailored Ankara Peplum Top
        quantity: 1,
        status: ServiceStage.READY,
        customMeasurements: MOCK_CUSTOMERS[1].measurements
      },
      {
        id: 'oi-5',
        orderId: 'ord-5503',
        catalogItem: CATALOG[17], // Modern Office Dress
        quantity: 1,
        status: ServiceStage.STITCHING,
        customMeasurements: MOCK_CUSTOMERS[1].measurements
      }
    ]
  },
  // Added order for David Ochieng
  {
    id: 'ord-5504',
    userId: 'u-103',
    customerName: 'David Ochieng',
    customerPhone: '0733987654',
    date: '2023-10-28T16:45:00Z',
    totalAmount: 8500,
    paymentStatus: PaymentStatus.PENDING,
    items: [
      {
        id: 'oi-6',
        orderId: 'ord-5504',
        catalogItem: CATALOG[34], // Mara Chronograph Watch
        quantity: 1,
        status: ProductLogisticsStage.ORDER_PLACED
      }
    ]
  }
];