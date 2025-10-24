import React, { memo, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Recipe } from '../../domain/entities/Recipe';
import { useTheme } from '../../context/ThemeContext';
import { useImageCache } from '../../hooks/useImageCache';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  index: number;
  testID?: string;
}

/**
 * Optimized RecipeCard component with image caching and performance optimizations
 * 
 * Performance Features:
 * - React.memo for preventing unnecessary re-renders
 * - Image caching for optimized image loading
 * - Memoized callbacks for event handlers
 * - Optimized layout calculations
 */
export const RecipeCard: React.FC<RecipeCardProps> = memo(({
  recipe,
  onPress,
  index,
  testID = `recipe-card-${index}`,
}) => {
  const { theme } = useTheme();
  const { getImageUri, isImageCached } = useImageCache();

  // Memoized press handler
  const handlePress = useCallback(() => {
    onPress(recipe);
  }, [onPress, recipe]);

  // Memoized image URI resolution
  const imageUri = useMemo(() => {
    if (recipe.imagePath) {
      return getImageUri(recipe.imagePath);
    }
    if (recipe.imageUrl) {
      return recipe.imageUrl;
    }
    return null;
  }, [recipe.imagePath, recipe.imageUrl, getImageUri]);

  // Memoized image loading state
  const isImageLoading = useMemo(() => {
    return recipe.imagePath && !isImageCached(recipe.imagePath);
  }, [recipe.imagePath, isImageCached]);

  // Memoized recipe metadata
  const recipeMeta = useMemo(() => {
    const meta = [];
    
    if (recipe.ingredientCount > 0) {
      meta.push(`${recipe.ingredientCount} ingredients`);
    }
    
    if (recipe.totalTime) {
      const timeText = recipe.totalTime.maxMinutes 
        ? `${recipe.totalTime.minMinutes}-${recipe.totalTime.maxMinutes} min`
        : `${recipe.totalTime.minMinutes} min`;
      meta.push(timeText);
    }
    
    if (recipe.servings) {
      meta.push(`${recipe.servings.value} servings`);
    }
    
    return meta;
  }, [recipe.ingredientCount, recipe.totalTime, recipe.servings]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        }
      ]}
      onPress={handlePress}
      testID={testID}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.recipeImage}
              resizeMode="cover"
              testID={`${testID}-image`}
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                No Image
              </Text>
            </View>
          )}
          
          {/* Loading indicator for cached images */}
          {isImageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                testID={`${testID}-image-loading`}
              />
            </View>
          )}
        </View>

        {/* Recipe Content */}
        <View style={styles.textContent}>
          <Text 
            style={[styles.recipeTitle, { color: theme.colors.textPrimary }]}
            numberOfLines={2}
            testID={`${testID}-title`}
          >
            {recipe.title}
          </Text>
          
          <Text 
            style={[styles.recipeCategory, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
            testID={`${testID}-category`}
          >
            {recipe.category}
          </Text>
          
          {recipe.description && (
            <Text 
              style={[styles.recipeDescription, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
              testID={`${testID}-description`}
            >
              {recipe.description}
            </Text>
          )}
          
          {/* Recipe Metadata */}
          {recipeMeta.length > 0 && (
            <View style={styles.recipeMeta} testID={`${testID}-meta`}>
              {recipeMeta.map((meta, metaIndex) => (
                <Text
                  key={metaIndex}
                  style={[styles.recipeMetaText, { color: theme.colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {meta}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

RecipeCard.displayName = 'RecipeCard';

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 0,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    textAlign: 'center',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipeMetaText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
