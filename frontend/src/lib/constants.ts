// API & Network
export const UPLOAD_TIMEOUT_MS = 60_000;
export const RECIPE_REDIRECT_DELAY_MS = 500;
export const SCAN_STAGE_DELAY_MS = 1_500;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const RECIPES_PAGE_SIZE = 12;
export const DASHBOARD_PREVIEW_COUNT = 3;

// Settings options
export const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
] as const;

export const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'French', 'Japanese',
] as const;

export const SKILL_LEVELS: Array<'beginner' | 'intermediate' | 'advanced'> = [
  'beginner', 'intermediate', 'advanced',
];
