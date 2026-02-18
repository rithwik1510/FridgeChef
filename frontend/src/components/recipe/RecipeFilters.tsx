'use client';

import { useState } from 'react';
import { MagnifyingGlass, Funnel, SortAscending, X } from '@phosphor-icons/react';

export interface RecipeFilterValues {
  search: string;
  difficulty: string;
  max_cook_time: number | undefined;
  sort_by: string;
  sort_order: string;
}

interface RecipeFiltersProps {
  filters: RecipeFilterValues;
  onChange: (filters: RecipeFilterValues) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const COOK_TIME_OPTIONS = [
  { value: undefined, label: 'Any time' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'title', label: 'Title' },
  { value: 'cook_time', label: 'Cook time' },
  { value: 'times_made', label: 'Most made' },
];

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({ filters, onChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.difficulty || filters.max_cook_time !== undefined || filters.sort_by !== 'created_at';

  const updateFilter = (key: keyof RecipeFilterValues, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      search: filters.search,
      difficulty: '',
      max_cook_time: undefined,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-10 pr-4 py-3 bg-cream-dark text-charcoal border-2 border-transparent rounded-xl focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all duration-200 placeholder:text-charcoal/40"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
            showFilters || hasActiveFilters
              ? 'border-terracotta bg-terracotta/10 text-terracotta'
              : 'border-transparent bg-cream-dark text-charcoal/60 hover:text-charcoal'
          }`}
        >
          <Funnel size={20} weight={hasActiveFilters ? 'fill' : 'bold'} />
          <span className="hidden sm:inline text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="bg-cream-dark rounded-xl p-4 space-y-4">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-2">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter('difficulty', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.difficulty === opt.value
                      ? 'bg-terracotta text-cream'
                      : 'bg-cream-lightest text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cook Time */}
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-2">Max cook time</label>
            <div className="flex flex-wrap gap-2">
              {COOK_TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => updateFilter('max_cook_time', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.max_cook_time === opt.value
                      ? 'bg-terracotta text-cream'
                      : 'bg-cream-lightest text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-2">Sort by</label>
            <div className="flex flex-wrap gap-2 items-center">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter('sort_by', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.sort_by === opt.value
                      ? 'bg-terracotta text-cream'
                      : 'bg-cream-lightest text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => updateFilter('sort_order', filters.sort_order === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-lg bg-cream-lightest text-charcoal/70 hover:text-charcoal transition-all duration-200"
                title={filters.sort_order === 'asc' ? 'Ascending' : 'Descending'}
              >
                <SortAscending
                  size={20}
                  weight="bold"
                  className={`transition-transform duration-200 ${filters.sort_order === 'desc' ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-terracotta font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
