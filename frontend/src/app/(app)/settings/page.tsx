'use client';

import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';
import type { UserPreferences } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Plus, Leaf, Warning, Globe, ChefHat, Clock, Users, FloppyDisk } from '@phosphor-icons/react';
import { DIETARY_OPTIONS, CUISINE_OPTIONS, SKILL_LEVELS } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';

export default function SettingsPage() {
  const { addToast } = useToast();
  const { isAuthenticated, hasHydrated, isLoading: isAuthLoading } = useAuthStore();
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !isAuthLoading && !isAuthenticated;
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary: [],
    allergies: [],
    cuisines: [],
    skill_level: 'intermediate',
    max_cook_time: 60,
    servings: 2,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    if (!hasHydrated) return;
    loadPreferences();
  }, [hasHydrated, isGuestDemo]);

  const loadPreferences = async () => {
    if (isGuestDemo) {
      setPreferences({
        dietary: ['Vegetarian'],
        allergies: ['Peanuts'],
        cuisines: ['Indian', 'Mediterranean'],
        skill_level: 'intermediate',
        max_cook_time: 45,
        servings: 2,
      });
      setIsLoading(false);
      return;
    }

    try {
      const data = await userApi.getPreferences();
      setPreferences(data);
    } catch {
      addToast({
        type: 'error',
        title: 'Error loading settings',
        message: 'Failed to load your preferences.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isGuestDemo) {
      addToast({
        type: 'info',
        title: 'Sign in to save preferences',
        message: 'Guest demo mode is read-only for recruiters.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await userApi.updatePreferences(preferences);
      addToast({
        type: 'success',
        title: 'Preferences saved!',
        message: 'Your settings have been updated',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to save',
        message: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietary = (option: string) => {
    const current = preferences.dietary || [];
    const updated = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    setPreferences({ ...preferences, dietary: updated });
  };

  const toggleCuisine = (option: string) => {
    const current = preferences.cuisines || [];
    const updated = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    setPreferences({ ...preferences, cuisines: updated });
  };

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    const current = preferences.allergies || [];
    if (!current.includes(newAllergy.trim())) {
      setPreferences({ ...preferences, allergies: [...current, newAllergy.trim()] });
      addToast({ type: 'info', title: 'Allergy added', message: newAllergy.trim(), duration: 2000 });
    }
    setNewAllergy('');
  };

  const removeAllergy = (allergy: string) => {
    const current = preferences.allergies || [];
    setPreferences({ ...preferences, allergies: current.filter((item: string) => item !== allergy) });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-12">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot" />
          <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-1" />
          <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl mb-1">Settings</h1>
        <p className="text-charcoal/70">
          Customize your recipe recommendations
        </p>
      </div>

      {isGuestDemo && (
        <Card variant="glass" className="border border-terracotta/20">
          <p className="text-sm text-charcoal/80 text-center mb-0">
            Guest demo mode: settings are preview-only. Sign in to personalize and persist your preferences.
          </p>
        </Card>
      )}

      {/* Dietary Restrictions */}
      <Card variant="elevated">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-sage/10 rounded-lg">
            <Leaf size={20} className="text-sage" weight="duotone" />
          </div>
          <h2 className="text-xl font-semibold">Dietary Restrictions</h2>
        </div>
        <p className="text-sm text-charcoal/70 mb-4">
          Select any dietary preferences to filter recipes
        </p>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((option, index) => (
            <button
              key={option}
              onClick={() => toggleDietary(option)}
              className={`
                px-4 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                active:scale-95
                ${
                  preferences.dietary?.includes(option)
                    ? 'bg-sage text-cream border-sage shadow-soft'
                    : 'bg-cream text-charcoal border-cream-darker hover:border-sage'
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {option}
            </button>
          ))}
        </div>
      </Card>

      {/* Allergies */}
      <Card variant="elevated">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-butter/10 rounded-lg">
            <Warning size={20} className="text-butter-dark" weight="duotone" />
          </div>
          <h2 className="text-xl font-semibold">Allergies</h2>
        </div>
        <p className="text-sm text-charcoal/70 mb-4">
          Add any food allergies to avoid in recipes
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="e.g., peanuts, shellfish, eggs"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={addAllergy}
            iconLeft={<Plus size={18} weight="bold" />}
          >
            Add
          </Button>
        </div>

        {preferences.allergies && preferences.allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {preferences.allergies.map((allergy: string, index: number) => (
              <Tag
                key={allergy}
                variant="warning"
                onRemove={() => removeAllergy(allergy)}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {allergy}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Preferred Cuisines */}
      <Card variant="elevated">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-terracotta/10 rounded-lg">
            <Globe size={20} className="text-terracotta" weight="duotone" />
          </div>
          <h2 className="text-xl font-semibold">Preferred Cuisines</h2>
        </div>
        <p className="text-sm text-charcoal/70 mb-4">
          Select cuisines you enjoy (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((option, index) => (
            <button
              key={option}
              onClick={() => toggleCuisine(option)}
              className={`
                px-4 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                active:scale-95
                ${
                  preferences.cuisines?.includes(option)
                    ? 'bg-terracotta text-cream border-terracotta shadow-soft'
                    : 'bg-cream text-charcoal border-cream-darker hover:border-terracotta'
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {option}
            </button>
          ))}
        </div>
      </Card>

      {/* Cooking Preferences */}
      <Card variant="elevated">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-sage/10 rounded-lg">
            <ChefHat size={20} className="text-sage" weight="duotone" />
          </div>
          <h2 className="text-xl font-semibold">Cooking Preferences</h2>
        </div>

        <div className="space-y-6">
          {/* Skill Level */}
          <div>
            <label className="text-sm font-medium text-charcoal/70 mb-2 block">
              Skill Level
            </label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setPreferences({ ...preferences, skill_level: level })}
                  className={`
                    flex-1 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 capitalize text-sm font-medium
                    active:scale-95
                    ${
                      preferences.skill_level === level
                        ? 'bg-sage text-cream border-sage shadow-soft'
                        : 'bg-cream text-charcoal border-cream-darker hover:border-sage'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Max Cook Time */}
          <div>
            <Slider
              min={15}
              max={180}
              step={15}
              value={preferences.max_cook_time || 60}
              onChange={(v) => setPreferences({ ...preferences, max_cook_time: v })}
              label="Maximum Cooking Time"
              valueLabel={(v) => `${v} min`}
            />
          </div>

          {/* Default Servings */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-charcoal/60" />
              <label className="text-sm font-medium text-charcoal/70">
                Default Servings
              </label>
            </div>
            <input
              type="number"
              min="1"
              max="12"
              value={preferences.servings || 2}
              onChange={(e) =>
                setPreferences({ ...preferences, servings: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-cream text-charcoal border-2 border-cream-darker rounded-xl focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          isLoading={isSaving}
          iconLeft={!isSaving ? <FloppyDisk size={20} weight="bold" /> : undefined}
          glow={!isSaving}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
