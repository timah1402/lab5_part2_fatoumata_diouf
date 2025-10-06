import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useCart, Product } from '../../context/CartContext';

const PRODUCTS: Product[] = [
  { id: '1', name: 'Coffee', price: 1500, image: '☕' },
  { id: '2', name: 'Pizza', price: 4500, image: '🍕' },
  { id: '3', name: 'Burger', price: 5000, image: '🍔' },
  { id: '4', name: 'Sushi', price: 2000, image: '🍣' },
  { id: '5', name: 'Ice Cream', price: 6000, image: '🍦' },
  { id: '6', name: 'Donut', price: 1000, image: '🍩' },
];

export default function ProductsScreen() {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Text style={styles.productImage}>{item.image}</Text>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toFixed(2)} CFA</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={PRODUCTS}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    fontSize: 60,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F527C5',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#F527C5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});