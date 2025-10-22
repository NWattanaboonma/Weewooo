import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

export function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <IconSymbol name="cube.fill" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MediTrack Pro</Text>
          <Text style={styles.subtitle}>Paramedic Inventory</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.menuButton}>
        <IconSymbol name="line.horizontal.3" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4F7FFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  menuButton: {
    padding: 8,
  },
});
