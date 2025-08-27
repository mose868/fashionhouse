// Simple shared in-memory stores
// NOTE: These are temporary until a real database is wired.
export const productsStore = { 
  items: [
    {
      _id: '1',
      name: 'Classic Tee',
      description: 'A comfortable and stylish classic t-shirt made from premium cotton.',
      category: 'Casual African Fashion',
      price: 1999,
      stockQuantity: 50,
      featured: true,
      images: [
        { url: 'http://localhost:5010/uploads/1756214408463-988801659.png' },
        { url: 'http://localhost:5010/uploads/1756208338727-734079063.png' },
        { url: 'http://localhost:5010/uploads/1756208337304-109224064.png' }
      ],
      videoUrl: 'http://localhost:5010/uploads/MVI_0416.MOV',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Ankara Dress',
      description: 'Beautiful Ankara print dress perfect for special occasions.',
      category: 'Ankara Dress',
      price: 2000,
      stockQuantity: 25,
      featured: false,
      images: [
        { url: 'http://localhost:5010/uploads/1756208141015-129652253.png' },
        { url: 'http://localhost:5010/uploads/1756207900955-876558893.png' },
        { url: 'http://localhost:5010/uploads/1756207900889-174799143.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Traditional Kente Shirt',
      description: 'Elegant Kente print shirt for formal occasions.',
      category: 'Traditional Wear',
      price: 3500,
      stockQuantity: 15,
      featured: true,
      images: [
        { url: 'http://localhost:5010/uploads/1756214408463-988801659.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: '4',
      name: 'African Print Skirt',
      description: 'Vibrant African print skirt perfect for casual wear.',
      category: 'Women',
      price: 1800,
      stockQuantity: 30,
      featured: false,
      images: [
        { url: 'http://localhost:5010/uploads/1756208141015-129652253.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: '5',
      name: 'Beaded Necklace',
      description: 'Handcrafted beaded necklace with traditional African patterns.',
      category: 'Accessories',
      price: 800,
      stockQuantity: 40,
      featured: false,
      images: [
        { url: 'http://localhost:5010/uploads/1756207900955-876558893.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: '6',
      name: 'Leather Sandals',
      description: 'Comfortable leather sandals with African-inspired design.',
      category: 'Shoes',
      price: 2500,
      stockQuantity: 20,
      featured: true,
      images: [
        { url: 'http://localhost:5010/uploads/1756207900889-174799143.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: '7',
      name: 'Men\'s Dashiki',
      description: 'Traditional men\'s dashiki with modern styling.',
      category: 'Men',
      price: 2800,
      stockQuantity: 18,
      featured: false,
      images: [
        { url: 'http://localhost:5010/uploads/1756214408463-988801659.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: '8',
      name: 'Kids Ankara Set',
      description: 'Adorable Ankara print outfit for children.',
      category: 'Kids',
      price: 1200,
      stockQuantity: 25,
      featured: false,
      images: [
        { url: 'http://localhost:5010/uploads/1756208141015-129652253.png' }
      ],
      videoUrl: null,
      createdAt: new Date().toISOString()
    }
  ] 
};
export const ordersStore = { items: [] };
export const promoCodesStore = { items: [] };
// Reviews keyed by productId: string -> Review[]
export const reviewsStore = { byProductId: {} };


