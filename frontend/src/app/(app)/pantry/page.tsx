'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  usePantry,
  useAddPantryItem,
  useUpdatePantryItem,
  useDeletePantryItem,
  useClearPantry
} from '@/hooks/usePantry';
import type { PantryItem } from '@/types/api';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';
import { demoPantryItems } from '@/lib/demoData';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';
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
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !authLoading && !isAuthenticated;

  // ALL hooks must be declared before any conditional returns
  const { data: pantryData, isLoading } = usePantry(hasHydrated && isAuthenticated && !isGuestDemo);
  const addMutation = useAddPantryItem();
  const updateMutation = useUpdatePantryItem();
  const deleteMutation = useDeletePantryItem();
  const clearMutation = useClearPantry();

  const items = useMemo(() => (
    isGuestDemo ? demoPantryItems : (pantryData?.items ?? [])
  ), [isGuestDemo, pantryData?.items]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formCategory, setFormCategory] = useState('Other');
  const [formExpiry, setFormExpiry] = useState('');

  const promptGuestSignIn = (feature: string) => {
    addToast({
      type: 'info',
      title: `Sign in to ${feature}`,
      message: 'You are currently viewing a read-only guest demo.',
    });
    router.push('/login?redirect=/pantry');
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hasHydrated && !authLoading && !isAuthenticated && !isGuestDemo) {
      router.push('/login?redirect=/pantry');
    }
  }, [hasHydrated, authLoading, isAuthenticated, isGuestDemo, router]);

  const handleAddItem = async () => {
    if (isGuestDemo) {
      promptGuestSignIn('add pantry items');
      return;
    }

    if (!formName.trim()) {
      addToast({ type: 'warning', title: 'Please enter an ingredient name' });
      return;
    }

    try {
      await addMutation.mutateAsync({
        name: formName.trim(),
        quantity: formQuantity.trim() || 'some',
        category: formCategory,
        expiry_date: formExpiry || undefined,
      });
      resetForm();
      setShowAddModal(false);
      addToast({ type: 'success', title: 'Item added to pantry' });
    } catch {
      addToast({ type: 'error', title: 'Failed to add item' });
    }
  };

  const handleUpdateItem = async () => {
    if (isGuestDemo) {
      promptGuestSignIn('update pantry items');
      return;
    }

    if (!editingItem || !formName.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        updates: {
          name: formName.trim(),
          quantity: formQuantity.trim() || 'some',
          category: formCategory,
          expiry_date: formExpiry || undefined,
        }
      });
      resetForm();
      setEditingItem(null);
      addToast({ type: 'success', title: 'Item updated' });
    } catch {
      addToast({ type: 'error', title: 'Failed to update item' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (isGuestDemo) {
      promptGuestSignIn('remove pantry items');
      return;
    }

    try {
      await deleteMutation.mutateAsync(itemId);
      addToast({ type: 'success', title: 'Item removed' });
    } catch {
      addToast({ type: 'error', title: 'Failed to remove item' });
    }
  };

  const handleClearPantry = () => {
    if (isGuestDemo) {
      promptGuestSignIn('clear pantry');
      return;
    }

    setShowClearConfirm(true);
  };

  const executeClearPantry = async () => {
    if (isGuestDemo) {
      promptGuestSignIn('clear pantry');
      return;
    }

    try {
      await clearMutation.mutateAsync();
      setShowClearConfirm(false);
      addToast({ type: 'success', title: 'Pantry cleared' });
    } catch {
      addToast({ type: 'error', title: 'Failed to clear pantry' });
    }
  };

  const openEditModal = (item: PantryItem) => {
    if (isGuestDemo) {
      promptGuestSignIn('edit pantry items');
      return;
    }

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

  // Filter & Group items (Memoized)
  const { filteredItems, groupedItems } = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const grouped: Record<string, PantryItem[]> = {};
    filtered.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return { filteredItems: filtered, groupedItems: grouped };
  }, [items, searchQuery, selectedCategory]);

  const compactGroups = useMemo(() => {
    if (selectedCategory === 'All') {
      return { 'All Items': filteredItems };
    }
    return groupedItems;
  }, [selectedCategory, filteredItems, groupedItems]);

  // Show nothing while checking auth or if not authenticated
  if (!hasHydrated || authLoading || (!isAuthenticated && !isGuestDemo)) {
    return null;
  }

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
            onClick={() => router.push(isGuestDemo ? '/login?redirect=/scan' : '/scan')}
            iconLeft={<Camera size={18} weight="bold" />}
          >
            Scan to Add
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (isGuestDemo) {
                promptGuestSignIn('add pantry items');
                return;
              }
              setShowAddModal(true);
            }}
            iconLeft={<Plus size={18} weight="bold" />}
          >
            Add Item
          </Button>
        </div>
      </div>

      {isGuestDemo && (
        <Card variant="glass" className="border border-terracotta/20">
          <p className="text-sm text-charcoal/80 text-center mb-0">
            Guest demo mode: pantry data is sample inventory for preview only.
          </p>
        </Card>
      )}

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
            onAction={() => router.push(isGuestDemo ? '/login?redirect=/scan' : '/scan')}
          />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card variant="elevated" className="py-12 text-center">
          <p className="text-charcoal/60">No items match your search</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(compactGroups).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              {selectedCategory !== 'All' && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sage/10 rounded-lg text-sage">
                    {categoryIcons[category] || <Package size={14} weight="duotone" />}
                  </div>
                  <h2 className="text-xs font-semibold text-charcoal/60 uppercase tracking-wide">
                    {category}
                  </h2>
                  <span className="text-xs text-charcoal/40">
                    ({categoryItems.length})
                  </span>
                </div>
              )}

              <Card variant="default" compact className="p-0 overflow-hidden border border-charcoal/10">
                {categoryItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`
                      grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-2.5
                      ${index !== categoryItems.length - 1 ? 'border-b border-charcoal/10' : ''}
                    `}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {item.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-charcoal/60">
                        <span className="font-medium text-charcoal/75">{item.quantity}</span>

                        {selectedCategory === 'All' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-sage">
                            {categoryIcons[item.category] || <Package size={12} weight="duotone" />}
                            {item.category}
                          </span>
                        )}

                        {item.expiry_date && (
                          <span className="inline-flex items-center rounded-full bg-butter/15 px-2 py-0.5 text-charcoal/70">
                            Expires {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openEditModal(item)}
                      className="rounded-md p-1.5 text-charcoal/45 transition-all duration-200 hover:bg-terracotta/10 hover:text-terracotta"
                    >
                      <PencilSimple size={15} weight="bold" />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => handleDeleteItem(item.id)}
                      className="rounded-md p-1.5 text-charcoal/45 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  </div>
                ))}
              </Card>
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50">
          <Card variant="elevated" className="w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-2">Clear Pantry?</h2>
            <p className="text-charcoal/70 mb-6">
              Are you sure you want to remove all items? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={executeClearPantry}
                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
              >
                Yes, Clear All
              </Button>
            </div>
          </Card>
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
