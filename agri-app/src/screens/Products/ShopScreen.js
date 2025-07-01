import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    SafeAreaView,
    Dimensions,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/product/ProductCardMini';
import SearchTopBar from '../../components/topBar/SearchTopBar';
import customFetch from '../../utils/axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const ShopScreen = ({ navigation, route }) => {
    // State variables
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState(route.params?.search || '');
    const [subCategory, setSubCategory] = useState('');

    // Filter and sort state
    const [showSortModal, setShowSortModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortOption, setSortOption] = useState('newest');
    const [filterOptions, setFilterOptions] = useState({
        priceRange: null,
        minPrice: 0,
        maxPrice: 50000,
        discountRange: null,
        minDiscount: 0,
        minRating: 0,
        categories: [], // Will store parent categories
        expandedCategories: new Set(), // Track which parent categories are expanded
        selectedSubcategories: new Set(), // Store selected subcategory IDs
    });
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // Animation refs
    const sortModalAnimation = useRef(new Animated.Value(0)).current;
    const filterModalAnimation = useRef(new Animated.Value(0)).current;
    const inputRef = useRef(null);
    const flatListRef = useRef(null);
    const insets = useSafeAreaInsets();

    // Initial data fetch
    useEffect(() => {
        fetchInitialData();
    }, [search, sortOption, subCategory]);

    // Update category when route params change
    useEffect(() => {
        if (route.params?.search) {
            setSearch(route.params.search);
            setPage(1);
            setProducts([]);
        }
    }, [route.params?.search]);

    useEffect(() => {
        if (route.params?.subcategory) {
            setFilterOptions(prevOptions => ({
                ...prevOptions,
                selectedSubcategories: new Set(prevOptions.selectedSubcategories).add(route.params.subcategory)
            }));
            setPage(1);
            setProducts([]);
            setTimeout(() => {
                setSubCategory(route.params.subcategory);
            }, 100);
        }
    }, [route.params?.subcategory]);


    // Focus input if requested
    useEffect(() => {
        if (route.params?.focusInput && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [route.params?.focusInput]);

    // Count active filters
    useEffect(() => {
        let count = 0;

        if (filterOptions.minPrice > 0) count++;
        if (filterOptions.maxPrice < 50000) count++;
        if (filterOptions.minDiscount > 0) count++;
        if (filterOptions.minRating > 0) count++;
        if (filterOptions.selectedSubcategories.size > 0) count++;

        setActiveFiltersCount(count);
    }, [filterOptions]);

    // Calculate filter query params
    const getFilterQueryParams = useCallback(() => {
        const params = new URLSearchParams();

        // Add sort option
        params.append('sort', sortOption);

        // Add search if selected
        if (search) params.append('search', search);

        // Add price range
        if (filterOptions.minPrice > 0) params.append('minPrice', filterOptions.minPrice);
        if (filterOptions.maxPrice < 50000) params.append('maxPrice', filterOptions.maxPrice);
        if (filterOptions.minDiscount > 0) params.append('minDiscount', filterOptions.minDiscount);

        // Add rating filter
        if (filterOptions.minRating > 0) params.append('minRating', filterOptions.minRating);

        // Add selected categories (if no main category is selected)
        if (!search && filterOptions.selectedSubcategories.size > 0) {
            params.append('category', Array.from(filterOptions.selectedSubcategories).join(','));
            console.log(Array.from(filterOptions.selectedSubcategories).join(','));
        }

        params.append('page', page);
        params.append('limit', 10);

        return params.toString();
    }, [search, filterOptions, sortOption, page]);

    // Fetch initial data (first page)
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            setPage(1);
            setHasMore(true);

            // Reset products when changing filters/sort
            setProducts([]);

            const queryParams = getFilterQueryParams();
            // console.log(queryParams)
            const response = await customFetch.get(`/products/filteredProducts?${queryParams}`);

            setProducts(response.data.data.products);
            setHasMore(response.data.data.pagination.page < response.data.data.pagination.totalPages);

            // Fetch categories for filter modal if needed
            if (filterOptions.categories.length === 0) {
                fetchCategories();
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch next page of products (infinite scroll)
    const fetchMoreProducts = async () => {
        if (!hasMore || loading) return;

        try {
            const nextPage = page + 1;
            setPage(nextPage);

            const queryParams = new URLSearchParams(getFilterQueryParams());
            queryParams.set('page', nextPage);

            const response = await customFetch.get(`/products/filteredProducts?${queryParams.toString()}`);

            if (response.data.data.products.length > 0) {
                setProducts(prev => [...prev, ...response.data.data.products]);
                setHasMore(response.data.data.pagination.page < response.data.data.pagination.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error fetching more products:', err);
            // Don't show error for pagination issues, just stop loading more
            setHasMore(false);
        }
    };

    // Fetch categories for filter modal
    const fetchCategories = async () => {
        try {
            const [categoriesResponse] = await Promise.all([
                customFetch.get('/products/getcategorylist'),
            ]);

            setFilterOptions(prev => ({
                ...prev,
                categories: categoriesResponse.data.data || [],
            }));
        } catch (err) {
            console.error('Error fetching filter options:', err);
            // Non-critical error, don't show to user
        }
    };

    // Refresh products
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchInitialData();
        setRefreshing(false);
    };


    // Animation helpers for modals
    const animateModal = (animationRef, toValue) => {
        Animated.spring(animationRef, {
            toValue,
            useNativeDriver: true,
            friction: 8,
            tension: 40
        }).start();
    };

    // Open sort modal
    const openSortModal = () => {
        setShowSortModal(true);
        animateModal(sortModalAnimation, 1);
    };

    // Close sort modal
    const closeSortModal = () => {
        animateModal(sortModalAnimation, 0);
        setTimeout(() => setShowSortModal(false), 300);
    };

    // Open filter modal
    const openFilterModal = () => {
        setShowFilterModal(true);
        animateModal(filterModalAnimation, 1);
    };

    // Close filter modal
    const closeFilterModal = () => {
        animateModal(filterModalAnimation, 0);
        setTimeout(() => setShowFilterModal(false), 300);
    };

    // Apply filters and close modal
    const applyFilters = () => {
        closeFilterModal();
        fetchInitialData();
    };

    // Reset filters to default
    const resetFilters = () => {
        setFilterOptions((prev) => ({
            ...prev,
            priceRange: null,
            minPrice: 0,
            maxPrice: 50000,
            minRating: 0,
            discountRange: null,
            minDiscount: 0,
            selectedSubcategories: new Set(),
        }));
    };


    // Toggle category expansion to show/hide subcategories

    const toggleCategoryExpansion = (categoryId) => {
        const newExpandedCategories = new Set(filterOptions.expandedCategories);

        if (newExpandedCategories.has(categoryId)) {
            newExpandedCategories.delete(categoryId);
        } else {
            newExpandedCategories.add(categoryId);
        }

        setFilterOptions(prev => ({
            ...prev,
            expandedCategories: newExpandedCategories
        }));
    };

    // Toggle subcategory selection
    const toggleSubcategory = (subcategoryId) => {
        const newSelectedSubcategories = new Set(filterOptions.selectedSubcategories);

        if (newSelectedSubcategories.has(subcategoryId)) {
            newSelectedSubcategories.delete(subcategoryId);
        } else {
            newSelectedSubcategories.add(subcategoryId);
        }

        setFilterOptions(prev => ({
            ...prev,
            selectedSubcategories: newSelectedSubcategories
        }));
    };

    // Render loading indicator at bottom when fetching more products
    const renderFooter = () => {
        if (!hasMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.footerText}>Loading more products...</Text>
            </View>
        );
    };

    // Render empty state when no products
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptyText}>
                    Try adjusting your filters or search different product
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={async () => {
                        resetFilters();
                        setSearch('');
                        try {
                            setLoading(true);
                            setError(null);
                            setPage(1);
                            setHasMore(true);
                            setProducts([]);

                            const response = await customFetch.get('/products/filteredProducts');

                            setProducts(response.data.data.products);
                            setHasMore(response.data.data.pagination.page < response.data.data.pagination.totalPages);

                            if (filterOptions.categories.length === 0) {
                                fetchCategories();
                            }
                        } catch (err) {
                            console.error('Error fetching products:', err);
                            setError('Failed to load products. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <Text style={styles.emptyButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render star rating filter
    const renderStarRating = (count, selected) => {
        return (
            <TouchableOpacity
                style={[styles.ratingButton, selected && styles.ratingButtonSelected]}
                onPress={() => setFilterOptions(prev => ({ ...prev, minRating: selected ? 0 : count }))}
            >
                <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                        <Ionicons
                            key={i}
                            name={i < count ? "star" : "star-outline"}
                            size={16}
                            color={selected ? "#fff" : "#FBBC04"}
                        />
                    ))}
                    <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>& above</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render product card
    const renderProductItem = ({ item }) => (
        <ProductCard
            product={item}
            navigation={navigation}
        />
    );

    // Main render
    return (
        <><SearchTopBar
            navigation={navigation}
            setSearch={setSearch}
            inputRef={inputRef}
        />
            <SafeAreaView style={[styles.container]}>
                {/* Search Header */}


                {/* Main Content */}
                <View style={styles.content}>
                    {/* Sort and Filter Buttons */}
                    <View style={styles.sortFilterContainer}>
                        <TouchableOpacity
                            style={styles.sortButton}
                            onPress={openSortModal}
                        >
                            <Ionicons name="swap-vertical" size={18} color="#333" />
                            <Text style={styles.sortButtonText}>
                                Sort{sortOption !== 'newest' ? `: ${getSortLabel(sortOption)}` : ''}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={openFilterModal}
                        >
                            <Ionicons name="filter" size={18} color="#333" />
                            <Text style={styles.filterButtonText}>Filter</Text>
                            {activeFiltersCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Category Title */}
                    {search && (
                        <View style={styles.categoryTitleContainer}>
                            <Text style={styles.categoryTitle}>
                                {search.charAt(0).toUpperCase() + search.slice(1)}
                            </Text>
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={20} color="#777" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Loading State */}
                    {loading && !refreshing && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                            <Text style={styles.loadingText}>Loading products...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={fetchInitialData}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Product List */}
                    {!loading && !error && (
                        <FlatList
                            ref={flatListRef}
                            data={products}
                            keyExtractor={item => item._id}
                            renderItem={renderProductItem}
                            numColumns={2}
                            contentContainerStyle={styles.productList}
                            columnWrapperStyle={styles.productRow}
                            onEndReached={fetchMoreProducts}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                            ListEmptyComponent={renderEmpty}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            initialNumToRender={6}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                            removeClippedSubviews={Platform.OS === 'android'}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>

                {/* Sort Modal */}
                <Modal
                    visible={showSortModal}
                    transparent
                    animationType="none"
                    onRequestClose={closeSortModal}
                >
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 60 : 100}
                        tint="dark"
                        style={styles.modalOverlay}
                    >
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={closeSortModal}
                        >
                            <Animated.View
                                style={[
                                    styles.sortModalContainer,
                                    {
                                        transform: [
                                            {
                                                translateY: sortModalAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [600, 0]
                                                })
                                            }
                                        ]
                                    }
                                ]}
                            >
                                <View style={styles.sortModalHeader}>
                                    <Text style={styles.sortModalTitle}>Sort By</Text>
                                    <TouchableOpacity onPress={closeSortModal}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.sortOptionsList}>
                                    {sortOptions.map(option => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.sortOption,
                                                sortOption === option.value && styles.sortOptionSelected
                                            ]}
                                            onPress={() => {
                                                setSortOption(option.value);
                                                closeSortModal();
                                            }}
                                        >
                                            <Text style={[
                                                styles.sortOptionText,
                                                sortOption === option.value && styles.sortOptionTextSelected
                                            ]}>
                                                {option.label}
                                            </Text>
                                            {sortOption === option.value && (
                                                <Ionicons name="checkmark" size={22} color="#4CAF50" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>
                        </TouchableOpacity>
                    </BlurView>
                </Modal>

                {/* Filter Modal */}
                <Modal
                    visible={showFilterModal}
                    transparent
                    animationType="none"
                    onRequestClose={closeFilterModal}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View
                            style={[
                                styles.filterModalContainer,
                                {
                                    transform: [
                                        {
                                            translateX: filterModalAnimation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [300, 0]
                                            })
                                        }
                                    ]
                                }
                            ]}
                        >
                            <View style={styles.filterModalHeader}>
                                <Text style={styles.filterModalTitle}>Filters</Text>
                                <TouchableOpacity onPress={closeFilterModal}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <ScrollableContent>
                                {/* Price Range Filter */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Price Range</Text>
                                    <View style={styles.priceRangeContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.priceRangeButton,
                                                filterOptions.priceRange === 'below-500' && styles.priceRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                priceRange: 'below-500',
                                                minPrice: 0,
                                                maxPrice: 500
                                            }))}
                                        >
                                            <Text style={[
                                                styles.priceRangeText,
                                                filterOptions.priceRange === 'below-500' && styles.priceRangeTextActive
                                            ]}>Below ₹500</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.priceRangeButton,
                                                filterOptions.priceRange === '500-1000' && styles.priceRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                priceRange: '500-1000',
                                                minPrice: 500,
                                                maxPrice: 1000
                                            }))}
                                        >
                                            <Text style={[
                                                styles.priceRangeText,
                                                filterOptions.priceRange === '500-1000' && styles.priceRangeTextActive
                                            ]}>₹500 - ₹1,000</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.priceRangeButton,
                                                filterOptions.priceRange === '1000-2000' && styles.priceRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                priceRange: '1000-2000',
                                                minPrice: 1000,
                                                maxPrice: 2000
                                            }))}
                                        >
                                            <Text style={[
                                                styles.priceRangeText,
                                                filterOptions.priceRange === '1000-2000' && styles.priceRangeTextActive
                                            ]}>₹1,000 - ₹2,000</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.priceRangeButton,
                                                filterOptions.priceRange === '2000-5000' && styles.priceRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                priceRange: '2000-5000',
                                                minPrice: 2000,
                                                maxPrice: 5000
                                            }))}
                                        >
                                            <Text style={[
                                                styles.priceRangeText,
                                                filterOptions.priceRange === '2000-5000' && styles.priceRangeTextActive
                                            ]}>₹2,000 - ₹5,000</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.priceRangeButton,
                                                filterOptions.priceRange === '5000-10000' && styles.priceRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                priceRange: '5000-10000',
                                                minPrice: 5000,
                                                maxPrice: 10000
                                            }))}
                                        >
                                            <Text style={[
                                                styles.priceRangeText,
                                                filterOptions.priceRange === '5000-10000' && styles.priceRangeTextActive
                                            ]}>₹5,000 - ₹10,000</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.priceRangeButton,
                                                filterOptions.priceRange === 'above-10000' && styles.priceRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                priceRange: 'above-10000',
                                                minPrice: 10000,
                                                maxPrice: 50000
                                            }))}
                                        >
                                            <Text style={[
                                                styles.priceRangeText,
                                                filterOptions.priceRange === 'above-10000' && styles.priceRangeTextActive
                                            ]}>Above ₹10,000</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Discount Range Filter */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Discount</Text>
                                    <View style={styles.discountRangeContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.discountRangeButton,
                                                filterOptions.discountRange === '10-plus' && styles.discountRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                discountRange: '10-plus',
                                                minDiscount: 10
                                            }))}
                                        >
                                            <Text style={[
                                                styles.discountRangeText,
                                                filterOptions.discountRange === '10-plus' && styles.discountRangeTextActive
                                            ]}>10% & Above</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.discountRangeButton,
                                                filterOptions.discountRange === '20-plus' && styles.discountRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                discountRange: '20-plus',
                                                minDiscount: 20
                                            }))}
                                        >
                                            <Text style={[
                                                styles.discountRangeText,
                                                filterOptions.discountRange === '20-plus' && styles.discountRangeTextActive
                                            ]}>20% & Above</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.discountRangeButton,
                                                filterOptions.discountRange === '30-plus' && styles.discountRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                discountRange: '30-plus',
                                                minDiscount: 30
                                            }))}
                                        >
                                            <Text style={[
                                                styles.discountRangeText,
                                                filterOptions.discountRange === '30-plus' && styles.discountRangeTextActive
                                            ]}>30% & Above</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.discountRangeButton,
                                                filterOptions.discountRange === '40-plus' && styles.discountRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                discountRange: '40-plus',
                                                minDiscount: 40
                                            }))}
                                        >
                                            <Text style={[
                                                styles.discountRangeText,
                                                filterOptions.discountRange === '40-plus' && styles.discountRangeTextActive
                                            ]}>40% & Above</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.discountRangeButton,
                                                filterOptions.discountRange === '50-plus' && styles.discountRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                discountRange: '50-plus',
                                                minDiscount: 50
                                            }))}
                                        >
                                            <Text style={[
                                                styles.discountRangeText,
                                                filterOptions.discountRange === '50-plus' && styles.discountRangeTextActive
                                            ]}>50% & Above</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.discountRangeButton,
                                                filterOptions.discountRange === '60-plus' && styles.discountRangeButtonActive
                                            ]}
                                            onPress={() => setFilterOptions(prev => ({
                                                ...prev,
                                                discountRange: '60-plus',
                                                minDiscount: 60
                                            }))}
                                        >
                                            <Text style={[
                                                styles.discountRangeText,
                                                filterOptions.discountRange === '60-plus' && styles.discountRangeTextActive
                                            ]}>60% & Above</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Rating Filter */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Rating</Text>
                                    <View style={styles.ratingOptions}>
                                        {[4, 3, 2, 1].map(rating => (
                                            <View key={rating.toString()}>
                                                {renderStarRating(rating, filterOptions.minRating === rating)}
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Categories Filter */}
                                {!search && filterOptions.categories.length > 0 && (
                                    <View style={styles.filterSection}>
                                        <Text style={styles.filterSectionTitle}>Categories</Text>
                                        <View style={styles.categoriesContainer}>
                                            {filterOptions.categories.map(category => (
                                                <View key={category._id} style={styles.categoryGroup}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.parentCategoryChip,
                                                            filterOptions.expandedCategories.has(category._id) && styles.expandedCategoryChip
                                                        ]}
                                                        onPress={() => toggleCategoryExpansion(category._id)}
                                                    >
                                                        <Text style={styles.parentCategoryText}>
                                                            {category.name}
                                                        </Text>
                                                        <Text style={styles.expandIcon}>
                                                            {filterOptions.expandedCategories.has(category._id) ? '▼' : '►'}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    {/* Subcategories */}
                                                    {filterOptions.expandedCategories.has(category._id) && (
                                                        <View style={styles.subcategoriesContainer}>
                                                            {category.subcategories && category.subcategories.length > 0 ? (
                                                                category.subcategories.map(subcat => (
                                                                    <TouchableOpacity
                                                                        key={subcat._id}
                                                                        style={[
                                                                            styles.subcategoryChip,
                                                                            filterOptions.selectedSubcategories.has(subcat._id) && styles.subcategoryChipSelected
                                                                        ]}
                                                                        onPress={() => toggleSubcategory(subcat._id)}
                                                                    >
                                                                        <Text style={[
                                                                            styles.subcategoryChipText,
                                                                            filterOptions.selectedSubcategories.has(subcat._id) && styles.subcategoryChipTextSelected
                                                                        ]}>
                                                                            {subcat.name}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                ))
                                                            ) : (
                                                                <Text style={styles.noSubcategoriesText}>No subcategories available</Text>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                            </ScrollableContent>

                            <View style={styles.filterActions}>
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={resetFilters}
                                >
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={applyFilters}
                                >
                                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
};

// Helper component for scrollable content
const ScrollableContent = ({ children }) => (
    <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => <View>{children}</View>}
        keyExtractor={item => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
    />
);

// Sort options array
const sortOptions = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'Biggest Discount', value: 'discount' },
];

// Helper function to get readable sort label
const getSortLabel = (value) => {
    const option = sortOptions.find(opt => opt.value === value);
    return option ? option.label : '';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },

    // Sort and Filter Bar
    sortFilterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    sortButtonText: {
        marginLeft: 5,
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    filterButtonText: {
        marginLeft: 5,
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    filterBadge: {
        marginLeft: 5,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Category Title
    categoryTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },

    // Product List
    productList: {
        padding: 8,
    },
    productRow: {
        justifyContent: 'space-between',
    },

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#777',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    footerText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#777',
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Empty State
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    // Sort Modal
    sortModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        paddingBottom: 30,
    },
    sortModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sortModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    sortOptionsList: {
        marginTop: 10,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sortOptionSelected: {
        backgroundColor: '#f0f7f0',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#333',
    },
    sortOptionTextSelected: {
        color: '#4CAF50',
        fontWeight: '500',
    },

    // Filter Modal
    filterModalContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '80%',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    filterModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    filterSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    //Price Filter
    priceRangeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    priceRangeButton: {
        width: '45%',
        paddingVertical: 7,
        paddingHorizontal: 7,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    priceRangeButtonActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4CAF50',
    },
    priceRangeText: {
        fontSize: 13,
        textAlign: 'center',
        color: '#555',
    },
    priceRangeTextActive: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    // Discount Filter
    discountRangeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    discountRangeButton: {
        width: '45%',
        paddingVertical: 7,
        paddingHorizontal: 7,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    discountRangeButtonActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4CAF50',
    },
    discountRangeText: {
        fontSize: 13,
        textAlign: 'center',
        color: '#555',
    },
    discountRangeTextActive: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    // Rating Filter
    ratingOptions: {
        marginTop: -4,
    },
    ratingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 6
    },
    ratingButtonSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#333',
    },
    ratingTextSelected: {
        color: '#fff',
    },

    // Categories Filter
    parentCategoryChip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        marginBottom: 5,
    },
    expandedCategoryChip: {
        backgroundColor: '#e0e0e0',
    },
    parentCategoryText: {
        fontWeight: '600',
    },
    expandIcon: {
        fontSize: 10,
    },
    subcategoriesContainer: {
        marginLeft: 15,
        marginBottom: 10,
    },
    subcategoryChip: {
        padding: 8,
        borderRadius: 5,
        backgroundColor: '#f8f8f8',
        marginVertical: 3,
        marginRight: 5,
    },
    subcategoryChipSelected: {
        backgroundColor: '#4CAF50',
    },
    subcategoryChipText: {
        fontSize: 12,
    },
    subcategoryChipTextSelected: {
        color: 'white',
    },
    categoryGroup: {
        marginBottom: 5,
    },
    noSubcategoriesText: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#999',
        paddingLeft: 5,
    },

    // Filter Actions
    filterActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    resetButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#777',
        fontSize: 16,
        fontWeight: '500',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        marginLeft: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    }
});

export default ShopScreen;