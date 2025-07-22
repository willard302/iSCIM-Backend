const express = require('express');
const router = express.Router();

// 模擬商品資料
const products = [
  { id: 1, name: '商品A', price: 100 },
  { id: 2, name: '商品B', price: 200 },
  { id: 3, name: '商品C', price: 300 }
];

// 取得所有商品
router.get('/products', (req, res) => {
  res.json(products);
});

// 取得單一商品
router.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: '商品不存在' });
  }
  res.json(product);
});

// 模擬購物車
let cart = [];

// 加入購物車
router.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: '商品不存在' });
  }
  const cartItem = cart.find(item => item.product.id === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  res.json(cart);
});

// 查看購物車
router.get('/cart', (req, res) => {
  res.json(cart);
});

// 清空購物車
router.delete('/cart', (req, res) => {
  cart = [];
  res.json({ message: '購物車已清空' });
});

module.exports = router;