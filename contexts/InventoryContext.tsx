import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ItemCategory = 'Medication' | 'Equipment' | 'Supplies';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  lastScanned: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface InventoryContextType {
  items: InventoryItem[];
  checkedIn: number;
  checkedOut: number;
  lowStockCount: number;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const mockData: InventoryItem[] = [
  {
    id: 'MED001',
    name: 'Epinephrine Auto-Injector',
    category: 'Medication',
    quantity: 5,
    lastScanned: '21/10/2025',
    status: 'In Stock',
  },
  {
    id: 'MED002',
    name: 'Morphine 10mg',
    category: 'Medication',
    quantity: 10,
    lastScanned: '21/10/2025',
    status: 'In Stock',
  },
  {
    id: 'MED003',
    name: 'Aspirin 325mg',
    category: 'Medication',
    quantity: 20,
    lastScanned: '21/10/2025',
    status: 'In Stock',
  },
  {
    id: 'EQP001',
    name: 'Defibrillator AED',
    category: 'Equipment',
    quantity: 2,
    lastScanned: '21/10/2025',
    status: 'In Stock',
  },
  {
    id: 'EQP002',
    name: 'Blood Pressure Monitor',
    category: 'Equipment',
    quantity: 3,
    lastScanned: '20/10/2025',
    status: 'Low Stock',
  },
  {
    id: 'SUP001',
    name: 'Gauze Pads 4x4',
    category: 'Supplies',
    quantity: 50,
    lastScanned: '21/10/2025',
    status: 'In Stock',
  },
  {
    id: 'SUP002',
    name: 'Medical Gloves (Box)',
    category: 'Supplies',
    quantity: 1,
    lastScanned: '19/10/2025',
    status: 'Low Stock',
  },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(mockData);
  const [checkedIn] = useState(7);
  const [checkedOut] = useState(2);

  const lowStockCount = items.filter(item => item.status === 'Low Stock').length;

  const addItem = (item: InventoryItem) => {
    setItems([...items, item]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(items.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        checkedIn,
        checkedOut,
        lowStockCount,
        addItem,
        updateItem,
      }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
