// src/utils/categoryIcons.ts
import { Ionicons } from '@expo/vector-icons';

export type IoniconsName = keyof typeof Ionicons.glyphMap;

// Legacy to Ionicons mapping for backward compatibility with stored local data
const LEGACY_ICON_MAP: Record<string, IoniconsName> = {
  'dots-horizontal-circle-outline': 'ellipsis-horizontal-circle-outline',
  'dots-horizontal': 'ellipsis-horizontal-circle-outline',
  'silverware-fork-knife': 'restaurant-outline',
  'food-fork-drink': 'restaurant-outline',
  'cart-outline': 'cart-outline',
  'lightning-bolt': 'flash-outline',
  'bus': 'bus-outline',
  'car': 'car-outline',
  'school-outline': 'school-outline',
  'hospital-box-outline': 'medkit-outline',
  'medical-bag': 'medkit-outline',
  'shopping-outline': 'pricetag-outline',
  'shopping': 'pricetag-outline',
  'face-man-profile': 'person-outline',
  'person': 'person-outline',
  'wallet-bifold': 'wallet-outline',
  'gas-station': 'car-outline',
  'receipt': 'receipt-outline',
  'cash-multiple': 'cash-outline',
  'storefront-outline': 'business-outline',
  'hand-coin-outline': 'wallet-outline',
  'laptop': 'laptop-outline',
  'gamepad-variant-outline': 'game-controller-outline',
};

// Canonical Category Icon Mapping
export const CATEGORY_ICONS: Record<string, IoniconsName> = {
  'Food & Dining': 'restaurant-outline',
  'Groceries': 'cart-outline',
  'Utilities': 'flash-outline',
  'Bills & Utilities': 'flash-outline',
  'Healthcare': 'medkit-outline',
  'Transportation': 'bus-outline',
  'Education': 'school-outline',
  'Shopping': 'pricetag-outline',
  'Personal Care': 'person-outline',
  'Entertainment': 'game-controller-outline',
  'Salary': 'cash-outline',
  'Business': 'business-outline',
  'Allowance': 'wallet-outline',
  'Freelance': 'laptop-outline',
  'Other': 'ellipsis-horizontal-circle-outline',
};

/**
 * Normalizes any category icon name or category title to a 100% valid Ionicons glyph name.
 * Prevents question mark glyphs ('?') and console warnings.
 */
export function normalizeCategoryIcon(iconName?: string, categoryName?: string): IoniconsName {
  // 1. Check direct category mapping
  if (categoryName && CATEGORY_ICONS[categoryName]) {
    return CATEGORY_ICONS[categoryName];
  }

  // 2. Check category name keywords
  if (categoryName) {
    const cat = categoryName.toLowerCase();
    if (cat.includes('food') || cat.includes('dining')) return 'restaurant-outline';
    if (cat.includes('grocery') || cat.includes('supermarket')) return 'cart-outline';
    if (cat.includes('util') || cat.includes('electric') || cat.includes('water') || cat.includes('bill')) return 'flash-outline';
    if (cat.includes('petrol') || cat.includes('transport') || cat.includes('bus') || cat.includes('car') || cat.includes('gas')) return 'car-outline';
    if (cat.includes('educat') || cat.includes('school')) return 'school-outline';
    if (cat.includes('health') || cat.includes('med') || cat.includes('doctor')) return 'medkit-outline';
    if (cat.includes('shop')) return 'pricetag-outline';
    if (cat.includes('personal')) return 'person-outline';
    if (cat.includes('entertain') || cat.includes('game')) return 'game-controller-outline';
    if (cat.includes('salary') || cat.includes('income') || cat.includes('wage')) return 'cash-outline';
    if (cat.includes('business')) return 'business-outline';
    if (cat.includes('allowance')) return 'wallet-outline';
    if (cat.includes('freelance')) return 'laptop-outline';
  }

  // 3. Check legacy icon translation map
  if (iconName && LEGACY_ICON_MAP[iconName]) {
    return LEGACY_ICON_MAP[iconName];
  }

  // 4. Default fallback: clean 3-dots circle outline
  return 'ellipsis-horizontal-circle-outline';
}
