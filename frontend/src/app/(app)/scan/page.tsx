'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { scansApi, recipesApi, pantryApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { ImageUploader } from '@/components/scan/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Input } from '@/components/ui/Input';
import { CookingProgress, StepProgress } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Plus, Sparkle, ArrowRight, Package } from '@phosphor-icons/react';
import { useAuthStore } from '@/store/auth';
import { SCAN_STAGE_DELAY_MS, RECIPE_REDIRECT_DELAY_MS } from '@/lib/constants';
import type { Ingredient } from '@/types/api';

export default function ScanPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, hasHydrated, isLoading } = useAuthStore();

  // ALL hooks must be declared before any conditional returns
  const [scanId, setScanId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingToPantry, setIsAddingToPantry] = useState(false);
  const [generationStage, setGenerationStage] = useState<'detecting' | 'analyzing' | 'generating' | 'complete'>('detecting');
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hasHydrated && !isLoading && !isAuthenticated) {
      router.push('/login?redirect=/scan');
    }
  }, [hasHydrated, isLoading, isAuthenticated, router]);

  // Show nothing while checking auth or if not authenticated
  if (!hasHydrated || isLoading || !isAuthenticated) {
    return null;
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setIsDetecting(true);
    setGenerationStage('detecting');

    try {
      // Simulate stages for better UX
      setTimeout(() => setGenerationStage('analyzing'), SCAN_STAGE_DELAY_MS);

      const scan = await scansApi.create(file);
      setScanId(scan.id);
      setIngredients(scan.ingredients || []);

      if (scan.ingredients?.length > 0) {
        addToast({
          type: 'success',
          title: 'Scan complete!',
          message: `Found ${scan.ingredients.length} ingredients`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      addToast({
        type: 'error',
        title: 'Upload failed',
        message: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setIsDetecting(false);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;

    setIngredients([
      ...ingredients,
      {
        name: newIngredient.trim(),
        quantity: newQuantity.trim() || 'some',
        confidence: 1.0,
      },
    ]);

    setNewIngredient('');
    setNewQuantity('');

    addToast({
      type: 'info',
      title: 'Ingredient added',
      message: newIngredient.trim(),
      duration: 2000,
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddToPantry = async () => {
    if (ingredients.length === 0) return;

    setIsAddingToPantry(true);
    try {
      const pantryItems = ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity || 'some',
      }));

      await pantryApi.addBulk(pantryItems);
      addToast({
        type: 'success',
        title: 'Added to Pantry',
        message: `${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''} added to your pantry`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to add to pantry',
        message: 'Could not add ingredients to your pantry.',
      });
    } finally {
      setIsAddingToPantry(false);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!scanId) return;

    // Update scan with edited ingredients first
    try {
      await scansApi.update(scanId, ingredients);
    } catch (error) {
      addToast({
        type: 'warning',
        title: 'Update failed',
        message: 'Could not save your changes. Recipes will use originally detected ingredients.',
      });
    }

    setIsGenerating(true);
    setGenerationStage('generating');

    try {
      await recipesApi.generate(scanId);
      setGenerationStage('complete');

      addToast({
        type: 'success',
        title: 'Recipes ready!',
        message: 'Check out your personalized recipes',
      });

      setTimeout(() => router.push('/recipes'), RECIPE_REDIRECT_DELAY_MS);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Generation failed',
        message: 'Failed to generate recipes. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl mb-2">Scan Your Fridge</h1>
        <p className="text-charcoal/70">
          Upload a photo and we'll detect what ingredients you have
        </p>
      </div>

      {/* Uploader */}
      <div>
        <ImageUploader onUpload={handleUpload} isLoading={isUploading} />
      </div>

      {/* Detection Progress */}
      {isDetecting && (
        <Card variant="elevated" className="animate-scale-in">
          <CookingProgress stage={generationStage} />
        </Card>
      )}

      {/* Ingredients Result */}
      {!isDetecting && ingredients.length > 0 && (
        <Card variant="elevated">
          <div className="space-y-5">
            {/* Found ingredients header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={20} className="text-terracotta" weight="fill" />
                <h2 className="text-xl font-semibold">Found in your fridge</h2>
              </div>
              <p className="text-sm text-charcoal/70">
                We detected {ingredients.length} ingredients. Edit or add more below.
              </p>
            </div>

            {/* Ingredient tags */}
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Tag
                  key={index}
                  variant="success"
                  onRemove={() => handleRemoveIngredient(index)}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {ingredient.name} ({ingredient.quantity})
                </Tag>
              ))}
            </div>

            {/* Add ingredient form */}
            <div className="border-t border-charcoal/10 pt-5">
              <h3 className="text-sm font-semibold text-charcoal/70 mb-3">
                Add something we missed
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingredient name"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  className="flex-1"
                  aria-label="New ingredient name"
                />
                <Input
                  placeholder="Qty"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  className="w-24"
                  aria-label="New ingredient quantity"
                />
                <Button
                  variant="secondary"
                  onClick={handleAddIngredient}
                  iconLeft={<Plus size={18} weight="bold" />}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleAddToPantry}
                isLoading={isAddingToPantry}
                disabled={ingredients.length === 0 || isAddingToPantry}
                iconLeft={!isAddingToPantry ? <Package size={18} weight="bold" /> : undefined}
                className="sm:flex-1"
              >
                {isAddingToPantry ? 'Adding...' : 'Add to Pantry'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateRecipes}
                isLoading={isGenerating}
                disabled={ingredients.length === 0}
                iconRight={!isGenerating ? <ArrowRight size={20} weight="bold" /> : undefined}
                glow={!isGenerating && ingredients.length > 0}
                className="sm:flex-1"
              >
                {isGenerating ? 'Cooking up recipes...' : 'Get Recipe Ideas'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card variant="glass" className="animate-scale-in">
          <StepProgress
            steps={['Scan', 'Analyze', 'Generate', 'Done']}
            currentStep={generationStage === 'generating' ? 2 : 3}
          />
        </Card>
      )}

      {/* No ingredients detected */}
      {!isDetecting && !isUploading && ingredients.length === 0 && scanId && (
        <Card variant="elevated">
          <EmptyState
            variant="error"
            title="No ingredients detected"
            description="Try uploading a clearer photo or add ingredients manually."
            actionLabel="Try Again"
            onAction={() => {
              setScanId(null);
              setIngredients([]);
            }}
          />
        </Card>
      )}
    </div>
  );
}
