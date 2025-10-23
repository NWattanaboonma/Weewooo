import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Notification = {
  id: number;
  itemId: string; // เพิ่ม itemId เพื่อเชื่อมกับ item
  itemName: string;
  expiry: string;
  location: string;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  loadNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  loadNotifications: () => {},
  addNotification: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // mock data (5 unread, 3 read) - เพิ่ม itemId ที่ตรงกับ InventoryContext
  const mockNotifications: Notification[] = [
    {
      id: 1,
      itemId: "MED002", // ตรงกับ Morphine 10mg
      itemName: "Morphine 10mg",
      expiry: "2025-10-25",
      location: "Ambulance 1",
      read: false,
    },
    {
      id: 2,
      itemId: "SUP001", // ตรงกับ Gauze Pads 4x4
      itemName: "Gauze Pads 4x4",
      expiry: "2025-10-28",
      location: "Ambulance 2",
      read: false,
    },
    {
      id: 3,
      itemId: "MED003", // ตรงกับ Aspirin 325mg
      itemName: "Aspirin 325mg",
      expiry: "2025-10-30",
      location: "Storage Room A",
      read: false,
    },
    {
      id: 4,
      itemId: "SUP002", // ตรงกับ Medical Gloves (Box)
      itemName: "Medical Gloves (Box)",
      expiry: "2025-10-27",
      location: "Cabinet 3",
      read: false,
    },
    {
      id: 5,
      itemId: "EQP001", // ตรงกับ Defibrillator AED
      itemName: "Defibrillator AED",
      expiry: "2025-10-26",
      location: "Ambulance 1",
      read: false,
    },
    {
      id: 6,
      itemId: "MED001", // ตรงกับ Epinephrine Auto-Injector
      itemName: "Epinephrine Auto-Injector",
      expiry: "2025-11-10",
      location: "Ambulance 1",
      read: true,
    },
    {
      id: 7,
      itemId: "EQP002", // ตรงกับ Blood Pressure Monitor
      itemName: "Blood Pressure Monitor",
      expiry: "2025-11-15",
      location: "Ambulance 2",
      read: true,
    },
    {
      id: 8,
      itemId: "SUP001", // ตรงกับ Gauze Pads 4x4
      itemName: "Gauze Pads 4x4",
      expiry: "2025-11-20",
      location: "Storage Room A",
      read: true,
    },
  ];

  // Load notifications (from storage or mock)
  const loadNotifications = async () => {
    try {
      // FORCE RELOAD: ลบข้อมูลเก่าและโหลด mock data ใหม่
      await AsyncStorage.removeItem("notifications");
      console.log('Cleared old notifications, loading new mock data...');
      
      setNotifications(mockNotifications);
      await AsyncStorage.setItem(
        "notifications",
        JSON.stringify(mockNotifications)
      );
      console.log('Mock notifications loaded:', mockNotifications);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Save to storage when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      AsyncStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // เพิ่มฟังก์ชันสำหรับเพิ่ม notification ใหม่
  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    setNotifications((prev) => {
      const newId = prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1;
      return [
        {
          ...notification,
          id: newId,
          read: false,
        },
        ...prev,
      ];
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        loadNotifications,
        addNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);