'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scansApi, recipesApi } from '@/lib/api';
import { ImageUploader } from '@/components/scan/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Input } from '@/components/ui/Input';
import { CookingProgress, StepProgress } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Plus, Sparkle, ArrowRight } from '@phosphor-icons/react';

export default function ScanPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [scanId, setScanId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<'detecting' | 'analyzing' | 'generating' | 'complete'>('detecting');
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setIsDetecting(true);
    setGenerationStage('detecting');

    try {
      // Simulate stages for better UX
      setTimeout(() => setGenerationStage('analyzing'), 1500);

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
    } catch (error: any) {
      console.error('Error uploading image:', error);

      let errorMessage = 'Unknown error';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The image might be too large.';
      } else if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check if backend is running.';
      } else {
        errorMessage = error.message || 'Unknown error';
      }

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
    const removed = ingredients[index];
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipes = async () => {
    if (!scanId) return;

    // Update scan with edited ingredients first
    try {
      await scansApi.update(scanId, ingredients);
    } catch (error) {
      console.error('Error updating ingredients:', error);
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

      setTimeout(() => router.push('/recipes'), 500);
    } catch (error) {
      console.error('Error generating recipes:', error);
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
                />
                <Input
                  placeholder="Qty"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  className="w-24"
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

            {/* Generate button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGenerateRecipes}
              isLoading={isGenerating}
              disabled={ingredients.length === 0}
              iconRight={!isGenerating ? <ArrowRight size={20} weight="bold" /> : undefined}
              glow={!isGenerating && ingredients.length > 0}
            >
              {isGenerating ? 'Cooking up recipes...' : 'Get Recipe Ideas'}
            </Button>
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
