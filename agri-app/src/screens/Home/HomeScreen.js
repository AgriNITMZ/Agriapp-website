import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import TopBar from '../../components/topBar/HomeTopBar';
import FooterNavigation from '../../components/FooterNavigation';
import Banner from '../../components/home/Banner';
import Categories from '../../components/home/Categories';
import Services from '../../components/home/Services';
import ProductList from '../../components/product/ProductList';
import customFetch from '../../utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = ({ navigation }) => {
    const [productSections, setProductSections] = useState({
        featured: [],
        mostSelling: [],
        newArrival: [],
        deals: [],
        searched: []
    });

    // Optimized fetching function using Promise.all
    const fetchProducts = useCallback(async () => {
        try {
            const lastSearched = await AsyncStorage.getItem("lastSearch");
            const urls = {
                featured: '/products/filteredproducts?sort=rating',
                mostSelling: '/products/filteredproducts?sort=popularity',
                newArrival: '/products/filteredproducts?sort=newest',
                deals: '/products/filteredproducts?sort=discount',
                searched: lastSearched ? `/products/filteredproducts?search=${lastSearched}` : null
            };

            const requests = Object.entries(urls)
                .filter(([, url]) => url !== null)
                .map(async ([key, url]) => {
                    const response = await customFetch.get(url);
                    return { key, products: response.data.data.products || [] };
                });

            const results = await Promise.all(requests);
            const updatedSections = results.reduce((acc, { key, products }) => {
                acc[key] = products;
                return acc;
            }, {});

            if (!updatedSections.searched) updatedSections.searched = [];

            setProductSections(updatedSections);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <>
            <TopBar navigation={navigation} />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Banner />
                    <Categories navigation={navigation} />
                    <Services navigation={navigation} />

                    {/* Render sections only if they have products */}
                    {productSections.featured.length > 0 && (
                        <ProductList title="📌 Featured Products" products={productSections.featured} navigation={navigation} />
                    )}
                    {productSections.mostSelling.length > 0 && (
                        <ProductList title="🔥 Most Selling Products" products={productSections.mostSelling} navigation={navigation} />
                    )}
                    {productSections.newArrival.length > 0 && (
                        <ProductList title="🆕 New Arrivals" products={productSections.newArrival} navigation={navigation} />
                    )}
                    {productSections.deals.length > 0 && (
                        <ProductList title="🎯 Deals & Discounts" products={productSections.deals} navigation={navigation} />
                    )}
                    {productSections.searched.length > 0 && (
                        <ProductList title="🔄 Continue Your Search.." products={productSections.searched} navigation={navigation} />
                    )}
                </ScrollView>
                <FooterNavigation navigation={navigation} activePage="Home" />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default React.memo(HomePage);
