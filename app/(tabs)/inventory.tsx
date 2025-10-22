import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Header } from '@/components/Header';
import { useInventory, ItemCategory } from '@/contexts/InventoryContext';

const CATEGORIES: Array<'All' | ItemCategory> = ['All', 'Medication', 'Equipment', 'Supplies'];

export default function InventoryScreen() {
  const { items, logInventoryAction } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<'All' | ItemCategory>('All');
  const [quantitiesToUse, setQuantitiesToUse] = useState<{ [itemId: string]: string }>({});

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  // Helper function to get the quantity from state, defaulting to 1 if not set or invalid
  const getQuantityForUse = (itemId: string): number => {
    const q = parseInt(quantitiesToUse[itemId] || '1', 10);
    return isNaN(q) || q < 1 ? 1 : q;
  };

  // Helper function to update the quantity for a specific item
  const handleQuantityChange = (itemId: string, value: string) => {
    setQuantitiesToUse(prev => ({
      ...prev,
      // Allow only non-zero digits. An empty string is allowed so the user can clear the input.
      // This prevents '0' from being entered.
      [itemId]: value.replace(/[^1-9]/g, ''),
    }));
  };

  return (
    <View style={styles.container}> 
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>Full Inventory</Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}>
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === category && styles.filterTextActive,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.itemList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemListContent}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleContainer}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.id} • {item.category}
                  </Text>
                </View>
                {/* Container for Status Badge and Quantity Input */}
                <View style={styles.statusAndQuantityContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'In Stock' && styles.statusInStock,
                      item.status === 'Low Stock' && styles.statusLowStock,
                    ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                  <TextInput
                    style={styles.quantityInput}
                    onChangeText={(value) => handleQuantityChange(item.id, value)}
                    value={quantitiesToUse[item.id]} // Allow empty string for deletion
                    keyboardType="numeric"
                    placeholder="Qty"
                    maxLength={3} />
                </View>
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>{item.quantity} units</Text>
                </View>
                <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.detailLabel}>Last Scanned</Text>
                  <Text style={styles.detailValue}>{item.lastScanned}</Text> 
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.itemActions}>
                {/* This empty view will push the button group to the right */}
                <View style={{ flex: 1 }} />
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.useButton,
                      (item.quantity < getQuantityForUse(item.id) || item.quantity <= 0) && styles.disabledButton,
                    ]}
                    onPress={() => logInventoryAction(item.id, 'Use', getQuantityForUse(item.id))}
                    disabled={item.quantity < getQuantityForUse(item.id) || item.quantity <= 0}>
                    <Text style={styles.actionButtonText}>Use</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.transferButton, // New style for Transfer
                      (item.quantity < getQuantityForUse(item.id) || item.quantity <= 0) && styles.disabledButton,
                    ]}
                    // Placeholder action for Transfer
                    onPress={() => logInventoryAction(item.id, 'Transfer', getQuantityForUse(item.id))}
                    disabled={item.quantity < getQuantityForUse(item.id) || item.quantity <= 0}>
                    <Text style={styles.actionButtonText}>Transfer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.removeButton,
                      item.quantity <= 0 && styles.disabledButton, // Disable if no items to remove
                    ]}
                    onPress={() => logInventoryAction(item.id, 'Remove All', item.quantity)}
                    disabled={item.quantity <= 0}>
                    <Text style={styles.actionButtonText}>Remove All</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {item.quantity < getQuantityForUse(item.id) && item.quantity > 0 && (
                <Text style={styles.notEnoughItemsText}>
                  Not enough items. Available: {item.quantity}
                </Text>
              )}
              {item.quantity <= 0 && (
                <Text style={styles.notEnoughItemsText}>
                  Out of Stock
                </Text>
              )}
            </View> 
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  filterButtonActive: {
    backgroundColor: '#4F7FFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F7FFF',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  itemList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemListContent: {
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusInStock: {
    backgroundColor: '#D1FAE5',
  },
  statusLowStock: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 40,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemActions: {
    flexDirection: 'row',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    // Removed flex: 1 to allow buttons to take only necessary space
    // and be grouped to the right by itemActions' justifyContent
    paddingHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusAndQuantityContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8, // Space between status badge and quantity input
  },
  quantityInput: {
    width: 60, // Fixed width for the input
    height: 36, // Fixed height
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  transferButton: {
    backgroundColor: '#4F7FFF', // Blue for "Transfer"
  },
  useButton: {
    backgroundColor: '#FB923C', // Orange for "Use"
  },
  removeButton: {
    backgroundColor: '#EF4444', // Red for "Remove"
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB', // Gray when disabled
  },
  notEnoughItemsText: {
    color: '#EF4444', // Red text for warning
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
