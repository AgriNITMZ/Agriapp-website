const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function testSimpleGrouping() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');
        
        // Fetch all products
        const products = await Product.find().populate('category');
        console.log(`\n=== ORIGINAL PRODUCTS ===`);
        console.log(`Total products: ${products.length}`);
        
        // Show some examples
        products.slice(0, 5).forEach((product, index) => {
            console.log(`${index + 1}. "${product.name}" - ${product.sellers.length} sellers`);
        });
        
        // Group products by exact name match
        const groupedProducts = {};
        
        products.forEach(product => {
            const groupKey = product.name.toLowerCase().trim();
            
            if (!groupedProducts[groupKey]) {
                groupedProducts[groupKey] = {
                    name: product.name,
                    products: [product],
                    totalSellers: product.sellers.length
                };
            } else {
                groupedProducts[groupKey].products.push(product);
                groupedProducts[groupKey].totalSellers += product.sellers.length;
            }
        });
        
        console.log(`\n=== AFTER GROUPING ===`);
        console.log(`Grouped products: ${Object.keys(groupedProducts).length}`);
        console.log(`Reduction: ${products.length - Object.keys(groupedProducts).length} products`);
        
        // Show products that got grouped (multiple products with same name)
        console.log(`\n=== PRODUCTS THAT GOT GROUPED ===`);
        let groupedCount = 0;
        Object.entries(groupedProducts).forEach(([key, group]) => {
            if (group.products.length > 1 || group.totalSellers > 1) {
                console.log(`"${group.name}": ${group.products.length} products, ${group.totalSellers} total sellers`);
                groupedCount++;
            }
        });
        
        if (groupedCount === 0) {
            console.log('No products were grouped (no products with same names found)');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testSimpleGrouping();