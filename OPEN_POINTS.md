# Open Points & Future Features

This document tracks features and improvements that are planned but not yet implemented.

## Product-Specific Offer Targeting

**Status:** Planned for future iteration
**Priority:** Medium
**Requested:** 2026-02-26

### Current Behavior
- Widget displays the **highest priority offer** with available stock
- Same offer shown to all customers regardless of what product they purchased
- Shop owners control which offer appears via priority ranking (lower number = higher priority)

### Requested Enhancement
Enable automatic product-specific offer matching based on the purchased product:
- Shop owner maps offers to specific product IDs (e.g., "Show helmet offer only for bicycle purchases")
- Widget receives `productId` parameter from the e-commerce platform (Shopify, WooCommerce)
- System matches purchased product to relevant offers
- Falls back to priority-based selection if no product match found

### Technical Requirements

#### 1. Database Schema Change
Add product mapping to Offer model:
```prisma
model Offer {
  // ... existing fields
  triggerProductIds String[] @default([]) // Array of product IDs that trigger this offer
  matchingStrategy  String   @default("priority") // "priority" | "product_specific" | "both"
}
```

#### 2. Dashboard UI Changes
- Add "Product Targeting" section to offer creation/edit form
- Allow shop owners to:
  - Select matching strategy (Show to all / Specific products only / Priority fallback)
  - Add/remove product IDs manually
  - Import product list from platform API (future: Shopify/WooCommerce integration)

#### 3. Widget API Enhancement
Update `/api/widget/offers` endpoint:
```typescript
// If productId provided and product-specific offers exist
if (productId) {
  // 1. Try to find offer mapped to this product
  // 2. If not found, fall back to highest priority offer
  // 3. Return appropriate offer
}
```

#### 4. Embed Code Update
Improve embed code to automatically capture product ID:
- **Shopify:** `{{ checkout.line_items[0].product_id }}`
- **WooCommerce:** `<?php echo $order->get_items()[0]->get_product_id(); ?>`
- **Custom:** Shop owner provides their product ID variable

### Benefits
- ✅ More relevant offers = higher conversion rates
- ✅ Better customer experience (helmet for bike buyers, warranty for electronics)
- ✅ Shop owners can create multiple product-specific campaigns
- ✅ More advanced targeting without manual work

### Estimated Effort
- **Backend:** 4-6 hours (schema migration, API logic, tests)
- **Frontend:** 6-8 hours (dashboard UI, product selector, validation)
- **Documentation:** 2 hours (update embed code guides)
- **Total:** ~2 days

---

## Future Enhancements

### Platform Integrations
- Shopify app integration (auto-import products, auto-inject widget)
- WooCommerce plugin (auto-inject on thank-you page)
- API for custom platform integrations

### Advanced Analytics
- Conversion rates per product category
- A/B testing for offer variations
- Customer segmentation by bid behavior

### Dynamic Pricing
- Time-based pricing (early bird discounts)
- Quantity-based offers (bulk discounts)
- Customer tier-based pricing (loyalty rewards)

---

**Last Updated:** 2026-02-26
