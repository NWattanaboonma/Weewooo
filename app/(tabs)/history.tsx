import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Header } from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date'); // 'Date', 'Item Name', 'Case ID', etc.
  const [filterAction, setFilterAction] = useState('All'); // 'All', 'Check In', 'Check Out'
  const [filterCategory, setFilterCategory] = useState('All'); // 'All', 'Medication', 'Equipment', 'Supplies'

  // Placeholder for actual history data
  // Data in the histroy 
  const dummyHistory = [
    { id: '1', itemName: 'Anphetamines', date: '2023-10-26 10:30 AM', caseId: 'C12345', user: 'John Doe', quantity: 5, action: 'Check Out', category: 'Medication' },
    { id: '2', itemName: 'Defibrillator', date: '2023-10-26 09:15 AM', caseId: 'C12344', user: 'Jane Smith', quantity: 1, action: 'Check In', category: 'Equipment' },
    { id: '3', itemName: 'Bandages', date: '2023-10-25 04:00 PM', caseId: 'C12343', user: 'John Doe', quantity: 10, action: 'Check Out', category: 'Supplies' },
    { id: '4', itemName: 'Morphine', date: '2023-10-25 02:00 PM', caseId: 'C12342', user: 'Jane Smith', quantity: 2, action: 'Check In', category: 'Medication' },
  ];

  // Simple filtering and sorting logic for demonstration
  const filteredAndSortedHistory = dummyHistory
    .filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = filterAction === 'All' || item.action === filterAction;
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesAction && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'Date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newest first
      }
      // Add other sort criteria here if needed
      return 0;
    });

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.pageTitle}>History & Report</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by date, case, or item..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort, Filter, Customize */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => setSortBy('Date')}>
            <IconSymbol name="arrow.up.arrow.down" size={16} color="#4F7FFF" />
            <Text style={styles.controlButtonText}>Sort by: {sortBy}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => setFilterAction(filterAction === 'All' ? 'Check In' : 'All')}>
            <IconSymbol name="line.horizontal.3.decrease.circle" size={16} color="#4F7FFF" />
            <Text style={styles.controlButtonText}>Action: {filterAction}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => setFilterCategory(filterCategory === 'All' ? 'Medication' : 'All')}>
            <IconSymbol name="tag.fill" size={16} color="#4F7FFF" />
            <Text style={styles.controlButtonText}>Category: {filterCategory}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol name="gearshape.fill" size={16} color="#4F7FFF" />
            <Text style={styles.controlButtonText}>Customize</Text>
          </TouchableOpacity>
        </View>

        {/* Record Count */}
        <Text style={styles.recordCount}>{filteredAndSortedHistory.length} records found</Text>

        {/* History Log */}
        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyListContent}>
          {filteredAndSortedHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="clock.fill" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No activity found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredAndSortedHistory.map((item) => (
              <View key={item.id} style={styles.historyItemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.itemQuantity}>{item.action === 'Check In' ? '+' : '-'}{item.quantity}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetailText}>Date: {item.date}</Text>
                  <Text style={styles.itemDetailText}>Case ID: {item.caseId}</Text>
                  <Text style={styles.itemDetailText}>User: {item.user}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light background
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center', // Center the title
  },
  // Search Bar Styles (reused from inventory.tsx)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  clearButton: {
    padding: 8,
  },
  // Controls Row (Sort, Filter, Customize)
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows buttons to wrap to next line if space is tight
    justifyContent: 'flex-start', // Align buttons to the left
    marginBottom: 16,
    gap: 8, // Space between buttons
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  controlButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#4F7FFF',
  },
  // Record Count
  recordCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  // History List
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: 20, // Ensure last item isn't cut off by tab bar
  },
  historyItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1, // Allow name to take up space
  },
  itemQuantity: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4F7FFF', // Example color for quantity
  },
  itemDetails: {
    // Style for detail lines
  },
  itemDetailText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  // Empty State (reused from index.tsx)
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});