/**
 * Map product categories to relevant placeholder images
 * Uses Unsplash and Picsum placeholder APIs for high-quality images
 */

const categoryImageMap = {
  Clothing: [
    "https://images.unsplash.com/photo-1506629082632-8a26a91ce88b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1505298346881-b72b27e84530?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
  ],
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1498049794561-7780e6b1b330?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  ],
  Grocery: [
    "https://images.unsplash.com/photo-1488459716781-6db19b7a4480?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1585518419759-64b12e2f8dea?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
  ],
  Appliances: [
    "https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1543163521-cdcdb51b3fe8?w=400&h=300&fit=crop",
  ],
  "Personal Care": [
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1611357846506-ce21e63a1667?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop",
  ],
  "Home & Kitchen": [
    "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1556227528-8c89e6adf883?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1505521585350-ffda33fcc435?w=400&h=300&fit=crop",
  ],
  Health: [
    "https://images.unsplash.com/photo-1576091160550-112173fba4ee?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1579154204601-01d5b6c3cbf7?w=400&h=300&fit=crop",
  ],
  Books: [
    "https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
  ],
  Stationery: [
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1450778869180-41d20a25dc26?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
  ],
  "Baby Care": [
    "https://images.unsplash.com/photo-1605146769289-440d6dd60fb0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1581620701022-70ec6dc608d3?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  ],
};

/**
 * Get a relevant product image based on category
 * @param {string} category - Product category
 * @param {number} productId - Product ID for pseudo-random selection
 * @returns {string} Image URL
 */
export const getProductImage = (category, productId) => {
  const images = categoryImageMap[category] || categoryImageMap.Electronics;
  const index = (productId % images.length);
  return images[index];
};

/**
 * Get all image URLs for a category
 * @param {string} category - Product category
 * @returns {string[]} Array of image URLs
 */
export const getCategoryImages = (category) => {
  return categoryImageMap[category] || categoryImageMap.Electronics;
};

/**
 * Get a fallback placeholder image
 * @param {string} text - Text to display on placeholder
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (text = "Image") => {
  return `https://via.placeholder.com/400x300?text=${encodeURIComponent(text)}`;
};
