import express from 'express';
import productController from '../controllers/product.controller.js'; 
import auth from '../middlewares/auth.js';
import admin from '../middlewares/admin.js';

const productRouter = express.Router();

productRouter.post('/products', [auth, admin], productController.store);
productRouter.put('/products/:id', [auth, admin], productController.update);
productRouter.delete('/products/:id', [auth, admin], productController.destroy);
productRouter.get('/products', productController.index);
productRouter.get('/products/:id', productController.show);

export default productRouter;