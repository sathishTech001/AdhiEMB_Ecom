import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CartItem, AddToCartData, Cart } from '../types/cart.types';
import { cartApi } from '../api/cart.api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Product, MachineFormat, ProductFile } from '@/features/products/types/product.types';

interface CartContextType {
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  toggleCartDrawer: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (product: Product | AddToCartData, selectedFormat?: MachineFormat, quantity?: number, file?: ProductFile) => Promise<void>;
  addFilesToCart: (product: Product, files: ProductFile[]) => Promise<void>;
  removeFromCart: (itemId: string | number) => Promise<void>;
  updateQuantity: (itemId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string | number) => boolean;
}

const LOCAL_STORAGE_KEY = 'adhiemb_cart_items';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Fetch cart from backend if authenticated
  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      // Backend cart endpoint may return 404 or empty if no cart yet, ignore silently
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCart();
    }
  }, [isAuthenticated, fetchBackendCart]);

  const toggleCartDrawer = () => setIsOpen((prev) => !prev);
  const openCartDrawer = () => setIsOpen(true);
  const closeCartDrawer = () => setIsOpen(false);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cart: Cart = {
    items,
    itemCount,
    subtotal,
    grandTotal: subtotal,
  };

  const isInCart = (productId: string | number) => {
    return items.some((item) => String(item.productId) === String(productId));
  };

  const addToCart = async (
    target: Product | AddToCartData,
    selectedFormat?: MachineFormat,
    quantity: number = 1,
    file?: ProductFile
  ) => {
    try {
      let productId: string | number;
      let productFileId: string | number | undefined = file?.id;
      let title = 'Embroidery Design';
      let slug = '';
      let price = file?.price !== undefined ? file.price : 0;
      let image: string | undefined = undefined;
      let format: MachineFormat | undefined = (file?.fileFormat || file?.format || selectedFormat) as any;
      let machineInfo: string | undefined = file?.machineInfo;
      let originalFileName: string | undefined = file?.originalFileName || file?.fileName;

      if ('title' in target) {
        // Product object passed
        productId = target.id;
        title = target.title;
        slug = target.slug;
        if (!price) {
          price = file?.price || 0;
        }
        image = target.primaryImage || (target.images && target.images[0]?.url);
        if (!format && target.formats && target.formats.length > 0) {
          format = target.formats[0];
        }
      } else {
        // AddToCartData passed
        productId = target.productId;
        productFileId = target.productFileId || productFileId;
        format = target.selectedFormat || format;
        quantity = target.quantity || quantity;
      }

      if (isAuthenticated) {
        try {
          const res = await cartApi.addToCart({
            productId,
            productFileId,
            quantity,
            selectedFormat: format,
          });
          if (res.success && res.data) {
            setItems(res.data.items || []);
          }
        } catch {
          // Local fallback
          updateLocalCartAdd(productId, productFileId, title, slug, price, image, format, machineInfo, originalFileName, quantity);
        }
      } else {
        updateLocalCartAdd(productId, productFileId, title, slug, price, image, format, machineInfo, originalFileName, quantity);
      }

      toast.success(`Added ${machineInfo ? `(${machineInfo} - .${format})` : `"${title}"`} to cart!`);
      openCartDrawer();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const addFilesToCart = async (product: Product, filesToAdd: ProductFile[]) => {
    if (!filesToAdd || filesToAdd.length === 0) {
      toast.error('Please select at least one machine file');
      return;
    }
    for (const f of filesToAdd) {
      await addToCart(
        {
          productId: product.id,
          productFileId: f.id,
          selectedFormat: (f.fileFormat || f.format) as any,
          quantity: 1,
        },
        (f.fileFormat || f.format) as any,
        1,
        f
      );
    }
  };

  const updateLocalCartAdd = (
    productId: string | number,
    productFileId: string | number | undefined,
    title: string,
    slug: string,
    price: number,
    image?: string,
    format?: MachineFormat,
    machineInfo?: string,
    originalFileName?: string,
    quantity: number = 1
  ) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => String(i.productId) === String(productId) &&
               String(i.productFileId || '') === String(productFileId || '') &&
               i.selectedFormat === format
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: 1,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId,
          productFileId,
          productTitle: title,
          productSlug: slug,
          productImage: image,
          price,
          quantity,
          selectedFormat: format,
          fileFormat: format,
          machineInfo,
          originalFileName,
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = async (itemId: string | number) => {
    try {
      if (isAuthenticated) {
        try {
          await cartApi.removeItem(itemId);
        } catch {
          // ignore API error fallback
        }
      }
      setItems((prev) => prev.filter((item) => String(item.id) !== String(itemId)));
      toast.success('Item removed from cart');
    } catch (err: any) {
      toast.error('Could not remove item');
    }
  };

  const updateQuantity = async (itemId: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      if (isAuthenticated) {
        try {
          await cartApi.updateQuantity(itemId, quantity);
        } catch {
          // ignore API error fallback
        }
      }
      setItems((prev) =>
        prev.map((item) => (String(item.id) === String(itemId) ? { ...item, quantity } : item))
      );
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        try {
          await cartApi.clearCart();
        } catch {
          // ignore fallback
        }
      }
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        isOpen,
        isLoading,
        toggleCartDrawer,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        addFilesToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
