/**
 * Recipes List Page Object
 * 
 * Actions and assertions for the recipes list screen
 */

import { device, element, by, expect as detoxExpect } from 'detox';
import { BasePage } from './BasePage';

export class RecipesListPage extends BasePage {
  async searchRecipes(query: string) {
    await this.typeText('search-input', query);
    await this.waitForElement('search-results');
  }

  async clearSearch() {
    await this.tapButton('clear-search-button');
  }

  async openAddRecipe() {
    await this.tapButton('add-recipe-button');
  }

  async selectRecipe(recipeIndex: number) {
    await element(by.id(`recipe-item-${recipeIndex}`)).tap();
  }

  async expectRecipeVisible(recipeTitle: string) {
    await detoxExpect(element(by.text(recipeTitle))).toBeVisible();
  }

  async expectRecipeNotVisible(recipeTitle: string) {
    await detoxExpect(element(by.text(recipeTitle))).not.toBeVisible();
  }

  async openFilters() {
    await this.tapButton('filter-button');
  }

  async selectCategory(category: string) {
    await element(by.id(`category-${category.toLowerCase()}`)).tap();
  }

  async selectTag(tag: string) {
    await element(by.id(`tag-${tag.toLowerCase()}`)).tap();
  }

  async applyFilters() {
    await this.tapButton('apply-filters-button');
  }

  async clearFilters() {
    await this.tapButton('clear-filters-button');
  }

  async expectEmptyState() {
    await this.expectVisible('empty-state');
    await this.expectText('empty-state-title', 'No recipes found');
  }

  async expectLoadingState() {
    await this.expectVisible('loading-spinner');
  }

  async expectErrorState() {
    await this.expectVisible('error-state');
    await this.expectText('error-message', 'Failed to load recipes');
  }

  async retryLoad() {
    await this.tapButton('retry-button');
  }

  async refreshList() {
    await this.swipeDown('recipes-list');
  }

  async loadMoreRecipes() {
    await this.swipeUp('recipes-list');
    await this.waitForElement('loading-more-indicator');
  }

  async navigateToBooks() {
    await this.tapButton('books-tab');
  }

  async navigateToSettings() {
    await this.tapButton('settings-tab');
  }

  async expectSearchQuery(query: string) {
    await this.expectText('search-input', query);
  }

  async goBack() {
    await device.pressBack();
  }

  async editRecipe() {
    await this.tapButton('edit-recipe-button');
  }

  async openBatchParsing() {
    await this.tapButton('batch-parsing-button');
  }
}
