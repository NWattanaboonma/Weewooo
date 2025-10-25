import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export type ItemCategory = "Medication" | "Equipment" | "Supplies";
export type HistoryAction =
  | "Check In"
  | "Use"
  | "Transfer"
  | "Remove All"
  | "Check Out";

export interface HistoryItem {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  caseId: string;
  user: string;
  quantity: number;
  action: HistoryAction;
  category: ItemCategory;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  lastScanned: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  expiryDate: string;
  location: string;
}

interface InventoryContextType {
  items: InventoryItem[];
  history: HistoryItem[]; // Add history to context type
  checkedIn: number;
  checkedOut: number;
  lowStockCount: number;
  recentSearches: string[];
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  addRecentSearch: (search: string) => void;
  logInventoryAction: (
    itemId: string,
    action: HistoryAction,
    quantity: number
  ) => void; // New function to log actions
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

const mockData: InventoryItem[] = [
  {
    id: "MED001",
    name: "Epinephrine Auto-Injector",
    category: "Medication",
    quantity: 5,
    lastScanned: "21/10/2025",
    status: "In Stock",
    expiryDate: "2024-10-21",
    location: "Ambulance 1",
  },
  {
    id: "MED002",
    name: "Morphine 10mg",
    category: "Medication",
    quantity: 10,
    lastScanned: "21/10/2025",
    status: "In Stock",
    expiryDate: "2027-01-07",
    location: "Ambulance 1",
  },
  {
    id: "MED003",
    name: "Aspirin 325mg",
    category: "Medication",
    quantity: 20,
    lastScanned: "21/10/2025",
    status: "In Stock",
    expiryDate: "2025-11-11",
    location: "Ambulance 2",
  },
  {
    id: "EQP001",
    name: "Defibrillator AED",
    category: "Equipment",
    quantity: 2,
    lastScanned: "21/10/2025",
    status: "In Stock",
    expiryDate: "2026-02-03",
    location: "Ambulance Storage Room A",
  },
  {
    id: "EQP002",
    name: "Blood Pressure Monitor",
    category: "Equipment",
    quantity: 3,
    lastScanned: "20/10/2025",
    status: "Low Stock",
    expiryDate: "2023-04-20",
    location: "Storage Room A",
  },
  {
    id: "SUP001",
    name: "Gauze Pads 4x4",
    category: "Supplies",
    quantity: 50,
    lastScanned: "21/10/2025",
    status: "In Stock",
    expiryDate: "2026-10-21",
    location: "Cabinet 3",
  },
  {
    id: "SUP002",
    name: "Medical Gloves (Box)",
    category: "Supplies",
    quantity: 1,
    lastScanned: "19/10/2025",
    status: "Low Stock",
    expiryDate: "2025-11-20",
    location: "Cabinet 3",
  },
];

// Initial dummy history data
const dummyHistory: HistoryItem[] = [
  {
    id: "1",
    itemId: "MED001",
    itemName: "Epinephrine Auto-Injector",
    date: "2023-10-26 10:30 AM",
    caseId: "C12345",
    user: "John Doe",
    quantity: 5,
    action: "Check Out",
    category: "Medication",
  },
  {
    id: "2",
    itemId: "EQP001",
    itemName: "Defibrillator AED",
    date: "2023-10-26 09:15 AM",
    caseId: "C12344",
    user: "Jane Smith",
    quantity: 1,
    action: "Check In",
    category: "Equipment",
  },
  {
    id: "3",
    itemId: "SUP001",
    itemName: "Gauze Pads 4x4",
    date: "2023-10-25 04:00 PM",
    caseId: "C12343",
    user: "John Doe",
    quantity: 10,
    action: "Check Out",
    category: "Supplies",
  },
  {
    id: "4",
    itemId: "MED002",
    itemName: "Morphine 10mg",
    date: "2023-10-25 02:00 PM",
    caseId: "C12342",
    user: "Jane Smith",
    quantity: 2,
    action: "Check In",
    category: "Medication",
  },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(mockData);
  const [history, setHistory] = useState<HistoryItem[]>(dummyHistory); // New state for history
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // State for recent searches

  const lowStockCount = items.filter(
    (item) => item.status === "Low Stock"
  ).length;

  // Derive checkedIn and checkedOut from history using useMemo for performance
  const { checkedIn, checkedOut } = useMemo(() => {
    return history.reduce(
      (acc, record) => {
        if (record.action === "Check In") {
          acc.checkedIn += record.quantity;
        } else {
          // Any other action is a form of check-out
          acc.checkedOut += record.quantity;
        }
        return acc;
      },
      { checkedIn: 0, checkedOut: 0 }
    );
  }, [history]);

  const addItem = (item: InventoryItem) => {
    setItems([...items, item]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // New function to log inventory actions and update item quantity
  const addRecentSearch = (search: string) => {
    // Don't add empty searches
    if (!search.trim()) return;

    setRecentSearches((prevSearches) => {
      // Remove the search if it already exists (to move it to the front)
      const filteredSearches = prevSearches.filter((s) => s !== search);
      // Add the new search to the beginning and limit to 5 recent searches
      return [search, ...filteredSearches].slice(0, 5);
    });
  };

  const logInventoryAction = (
    itemId: string,
    action: HistoryAction,
    quantity: number
  ) => {
    const itemToUpdate = items.find((item) => item.id === itemId);
    if (!itemToUpdate) {
      console.warn(`Item with ID ${itemId} not found for logging action.`);
      return;
    }

    // 1. Create a new history record
    const newHistoryItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
      itemId: itemToUpdate.id,
      itemName: itemToUpdate.name,
      date: new Date().toLocaleString(), // Current date and time
      caseId: `C${Math.floor(Math.random() * 90000) + 10000}`, // Dummy case ID
      user: "Current User", // Placeholder for actual user
      quantity,
      action,
      category: itemToUpdate.category,
    };
    setHistory((prevHistory) => [newHistoryItem, ...prevHistory]); // Add new record to the beginning

    // 2. Update the item's quantity and status
    const currentQuantity = itemToUpdate.quantity;
    let updatedQuantity =
      action === "Check In"
        ? currentQuantity + quantity
        : currentQuantity - quantity; // All non-'Check In' actions reduce quantity
    updatedQuantity = Math.max(0, updatedQuantity); // Ensure quantity doesn't go below zero

    let newStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (updatedQuantity <= 0) newStatus = "Out of Stock";
    else if (updatedQuantity < 5) newStatus = "Low Stock"; // Example threshold

    updateItem(itemId, {
      quantity: updatedQuantity,
      status: newStatus,
      lastScanned: new Date().toLocaleDateString(),
    });
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        history, // Provide history state
        checkedIn,
        checkedOut,
        lowStockCount,
        recentSearches,
        addItem,
        updateItem,
        addRecentSearch,
        logInventoryAction, // Provide the new function
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
