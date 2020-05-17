import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem(
        'GoMarketPlace:localProducts',
      );
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
      // await AsyncStorage.removeItem('GoMarketPlace:localProducts');
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    // TODO ADD A NEW ITEM TO THE CART
    // adiciona quantidade ao produto
    const addProductQuantity: Product = product;
    addProductQuantity.quantity = 1;

    const storageProducts = await AsyncStorage.getItem(
      'GoMarketPlace:localProducts',
    );
    const storageProductsParsed: Product[] =
      storageProducts !== null ? JSON.parse(storageProducts) : null;

    let allProducts: Product[] = [];

    if (storageProductsParsed) {
      const productIndex = storageProductsParsed.findIndex(
        Index => Index.id === addProductQuantity.id,
      );
      if (productIndex !== -1) {
        const { quantity } = storageProductsParsed[productIndex];
        storageProductsParsed[productIndex].quantity = quantity + 1;
        await AsyncStorage.setItem(
          'GoMarketPlace:localProducts',
          JSON.stringify(storageProductsParsed),
        );
        setProducts(storageProductsParsed);
      } else {
        allProducts = [...storageProductsParsed, addProductQuantity];
        await AsyncStorage.setItem(
          'GoMarketPlace:localProducts',
          JSON.stringify(allProducts),
        );
        setProducts(allProducts);
      }
    } else {
      await AsyncStorage.setItem(
        'GoMarketPlace:localProducts',
        JSON.stringify([addProductQuantity]),
      );
      setProducts([addProductQuantity]);
    }
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);
      const { quantity } = products[productIndex];

      const newProducts = products;
      newProducts[productIndex].quantity = quantity + 1;
      await AsyncStorage.setItem(
        'GoMarketPlace:localProducts',
        JSON.stringify(newProducts),
      );

      console.log(newProducts);
      setProducts(newProducts);
    },

    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);
      const { quantity } = products[productIndex];

      if (quantity === 1) {
        const newProducts = products;
        newProducts.splice(productIndex, 1);
        setProducts(newProducts);
      } else {
        const newProducts = products;
        newProducts[productIndex].quantity = quantity - 1;
        await AsyncStorage.setItem(
          'GoMarketPlace:localProducts',
          JSON.stringify(newProducts),
        );
        setProducts(newProducts);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
