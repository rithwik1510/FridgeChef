'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pantryApi } from '@/lib/api';
import type { PantryItem, PantryItemCreate } from '@/types/api';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';
import {
  Package,
  Plus,
  MagnifyingGlass,
  Trash,
  PencilSimple,
  X,
  Camera,
  Carrot,
  Egg,
  Fish,
  Jar,
  Pepper,
  Drop,
  Grains,
  Snowflake,
  Coffee,
  DotsThree,
} from '@phosphor-icons/react';

const PANTRY_CATEGORIES = [
  'All',
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry Staples',
  'Spices & Seasonings',
  'Condiments & Sauces',
  'Grains & Pasta',
  'Frozen',
  'Beverages',
  'Other',
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Produce': <Carrot size={16} weight="duotone" />,
  'Dairy & Eggs': <Egg size={16} weight="duotone" />,
  'Meat & Seafood': <Fish size={16} weight="duotone" />,
  'Pantry Staples': <Jar size={16} weight="duotone" />,
  'Spices & Seasonings': <Pepper size={16} weight="duotone" />,
  'Condiments & Sauces': <Drop size={16} weight="duotone" />,
  'Grains & Pasta': <Grains size={16} weight="duotone" />,
  'Frozen': <Snowflake size={16} weight="duotone" />,
  'Beverages': <Coffee size={16} weight="duotone" />,
  'Other': <DotsThree size={16} weight="duotone" />,
};

export default function PantryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, hasHydrated, isLoading: authLoading } = useAuthStore();

  // ALL hooks must be declared before any conditional returns
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formCategory, setFormCategory] = useState('Other');
  const [formExpiry, setFormExpiry] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hasHydrated && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/pantry');
    }
  }, [hasHydrated, authLoading, isAuthenticated, router]);

  // Load pantry items
  useEffect(() => {
    if (isAuthenticated) {
      loadPantry();
    }
  }, [isAuthenticated]);

  // Show nothing while checking auth or if not authenticated
  if (!hasHydrated || authLoading || !isAuthenticated) {
    return null;
  }

  const loadPantry = async () => {
    try {
      const response = await pantryApi.list();
      setItems(response.items);
    } catch (error) {
      console.error('Error loading pantry:', error);
      addToast({
        type: 'error',
        title: 'Error loading pantry',
        message: 'Could not load your pantry items.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formName.trim()) {
      addToast({ type: 'warning', title: 'Please enter an ingredient name' });
      return;
    }

    try {
      const newItem: PantryItemCreate = {
        name: formName.trim(),
        quantity: formQuantity.trim() || 'some',
        category: formCategory,
        expiry_date: formExpiry || undefined,
      };

      const created = await pantryApi.add(newItem);
      setItems([...items, created]);
      resetForm();
      setShowAddModal(false);
      addToast({ type: 'success', title: 'Item added to pantry' });
    } catch (error) {
      console.error('Error adding item:', error);
      addToast({ type: 'error', title: 'Failed to add item' });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !formName.trim()) return;

    try {
      const updated = await pantryApi.update(editingItem.id, {
        name: formName.trim(),
        quantity: formQuantity.trim() || 'some',
        category: formCategory,
        expiry_date: formExpiry || undefined,
      });

      setItems(items.map(item => item.id === updated.id ? updated : item));
      resetForm();
      setEditingItem(null);
      addToast({ type: 'success', title: 'Item updated' });
    } catch (error) {
      console.error('Error updating item:', error);
      addToast({ type: 'error', title: 'Failed to update item' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await pantryApi.delete(itemId);
      setItems(items.filter(item => item.id !== itemId));
      addToast({ type: 'success', title: 'Item removed' });
    } catch (error) {
      console.error('Error deleting item:', error);
      addToast({ type: 'error', title: 'Failed to remove item' });
    }
  };

  const handleClearPantry = async () => {
    if (!confirm('Are you sure you want to clear your entire pantry?')) return;

    try {
      await pantryApi.clear();
      setItems([]);
      addToast({ type: 'success', title: 'Pantry cleared' });
    } catch (error) {
      console.error('Error clearing pantry:', error);
      addToast({ type: 'error', title: 'Failed to clear pantry' });
    }
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormQuantity(item.quantity);
    setFormCategory(item.category);
    setFormExpiry(item.expiry_date || '');
  };

  const resetForm = () => {
    setFormName('');
    setFormQuantity('');
    setFormCategory('Other');
    setFormExpiry('');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedItems: Record<string, PantryItem[]> = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl mb-1">My Pantry</h1>
          <p className="text-charcoal/70">
            {items.length} ingredient{items.length !== 1 ? 's' : ''} on hand
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push('/scan')}
            iconLeft={<Camera size={18} weight="bold" />}
          >
            Scan to Add
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            iconLeft={<Plus size={18} weight="bold" />}
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40"
          />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream-dark rounded-xl border-2 border-transparent focus:border-terracotta focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {PANTRY_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap
              transition-all duration-200 text-sm font-medium
              ${selectedCategory === category
                ? 'bg-terracotta text-cream'
                : 'bg-cream-dark text-charcoal/70 hover:bg-cream-darker'
              }
            `}
          >
            {category !== 'All' && categoryIcons[category]}
            {category}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot" />
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-1" />
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-2" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <Card variant="elevated">
          <EmptyState
            variant="no-pantry"
            onAction={() => router.push('/scan')}
          />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card variant="elevated" className="py-12 text-center">
          <p className="text-charcoal/60">No items match your search</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-sage/10 rounded-lg text-sage">
                  {categoryIcons[category] || <Package size={16} weight="duotone" />}
                </div>
                <h2 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">
                  {category}
                </h2>
                <span className="text-xs text-charcoal/40">
                  ({categoryItems.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryItems.map((item) => (
                  <Card
                    key={item.id}
                    variant="default"
                    compact
                    className="group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-charcoal truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-charcoal/60">
                          {item.quantity}
                        </p>
                        {item.expiry_date && (
                          <p className="text-xs text-charcoal/40 mt-1">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                          icon={<PencilSimple size={16} weight="bold" />}
                          label="Edit item"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="text-charcoal/40 hover:text-terracotta"
                        />
                        <IconButton
                          icon={<Trash size={16} weight="bold" />}
                          label="Delete item"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-charcoal/40 hover:text-red-500"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Clear All */}
          {items.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                onClick={handleClearPantry}
                className="text-charcoal/50 hover:text-red-500"
              >
                Clear All Items
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50">
          <Card variant="elevated" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Item' : 'Add to Pantry'}
              </h2>
              <IconButton
                icon={<X size={20} weight="bold" />}
                label="Close"
                onClick={closeModal}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Ingredient Name"
                placeholder="e.g., Chicken breast"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
              />

              <Input
                label="Quantity"
                placeholder="e.g., 2 lbs, 1 dozen"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-dark rounded-xl border-2 border-transparent focus:border-terracotta focus:outline-none transition-all duration-200"
                >
                  {PANTRY_CATEGORIES.filter(c => c !== 'All').map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Expiry Date (optional)"
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  fullWidth
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
