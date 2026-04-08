const { GoogleGenerativeAI } = require("@google/genai");

/**
 * AI-based product classification system
 * Uses Google Generative AI to classify products into subcategories
 */
class AIProductClassifier {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }
  
  /**
   * Classify product into appropriate subcategory using AI
   * @param {Object} productData - Product information
   * @param {Array} availableSubcategories - List of valid subcategories
   * @returns {Object} Classification result with confidence score
   */
  async classifyProduct(productData, availableSubcategories) {
    const { productName, description, category } = productData;
    
    const prompt = `
You are an agricultural product classification expert. Based on the following 
product information, select the MOST APPROPRIATE subcategory from the provided 
list.

Product Name: ${productName}
Description: ${description || 'Not provided'}
Main Category: ${category}

Available Subcategories:
${availableSubcategories.map((sub, idx) => `${idx + 1}. ${sub}`).join('\n')}

Rules:
1. Return ONLY the subcategory name, nothing else
2. Choose the most specific and relevant subcategory
3. If uncertain, choose the most general subcategory
4. Do not create new subcategories
5. Consider agricultural context and product characteristics

Your response (subcategory name only):
    `;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const subcategory = response.text().trim();
      
      // Validate that AI returned a valid subcategory
      if (availableSubcategories.includes(subcategory)) {
        return {
          subcategory,
          confidence: 'high',
          method: 'ai'
        };
      }
      
      // Fallback: Find closest match using fuzzy matching
      const closest = this.findClosestMatch(subcategory, availableSubcategories);
      return {
        subcategory: closest,
        confidence: 'medium',
        method: 'ai_fuzzy',
        originalResponse: subcategory
      };
    } catch (error) {
      console.error('AI classification failed:', error);
      // Fallback to default subcategory
      return {
        subcategory: availableSubcategories[0],
        confidence: 'low',
        method: 'fallback',
        error: error.message
      };
    }
  }
  
  /**
   * Find closest matching subcategory using string similarity
   * @param {string} text - Text to match
   * @param {Array} options - Available options
   * @returns {string} Best matching option
   */
  findClosestMatch(text, options) {
    let bestMatch = options[0];
    let bestScore = 0;
    
    for (let option of options) {
      const score = this.calculateSimilarity(
        text.toLowerCase(), 
        option.toLowerCase()
      );
      if (score > bestScore) {
        bestScore = score;
        bestMatch = option;
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Calculate similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Batch classify multiple products
   * @param {Array} products - Array of product data
   * @param {Array} availableSubcategories - List of valid subcategories
   * @returns {Array} Array of classification results
   */
  async batchClassify(products, availableSubcategories) {
    const results = [];
    
    for (let product of products) {
      const classification = await this.classifyProduct(
        product, 
        availableSubcategories
      );
      results.push({
        productName: product.productName,
        ...classification
      });
    }
    
    return results;
  }
}

module.exports = new AIProductClassifier();
