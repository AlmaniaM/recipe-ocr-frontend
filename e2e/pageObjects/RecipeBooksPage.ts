/**
 * Recipe Books Page Object
 * 
 * Actions and assertions for the recipe books screen
 */

import { element, by, expect as detoxExpect } from 'detox';
import { BasePage } from './BasePage';

export class RecipeBooksPage extends BasePage {
  async navigateToRecipes() {
    await this.tapButton('recipes-tab');
  }

  async navigateToSettings() {
    await this.tapButton('settings-tab');
  }

  async createNewBook() {
    await this.tapButton('create-book-button');
  }

  async enterBookName(name: string) {
    await this.typeText('book-name-input', name);
  }

  async enterBookDescription(description: string) {
    await this.typeText('book-description-input', description);
  }

  async saveBook() {
    await this.tapButton('save-book-button');
  }

  async cancelBookCreation() {
    await this.tapButton('cancel-book-button');
  }

  async selectBook(bookIndex: number) {
    await element(by.id(`book-item-${bookIndex}`)).tap();
  }

  async expectBookVisible(bookName: string) {
    await detoxExpect(element(by.text(bookName))).toBeVisible();
  }

  async expectBookNotVisible(bookName: string) {
    await detoxExpect(element(by.text(bookName))).not.toBeVisible();
  }

  async editBook(bookIndex: number) {
    await this.tapButton(`edit-book-${bookIndex}`);
  }

  async deleteBook(bookIndex: number) {
    await this.tapButton(`delete-book-${bookIndex}`);
  }

  async confirmDelete() {
    await this.tapButton('confirm-delete-button');
  }

  async cancelDelete() {
    await this.tapButton('cancel-delete-button');
  }

  async expectDeleteConfirmation() {
    await this.expectVisible('delete-confirmation-dialog');
    await this.expectText('delete-message', 'Are you sure you want to delete this book?');
  }

  async addRecipeToBook(bookIndex: number, recipeIndex: number) {
    await this.selectBook(bookIndex);
    await this.tapButton('add-recipe-to-book-button');
    await this.selectRecipe(recipeIndex);
  }

  async removeRecipeFromBook(bookIndex: number, recipeIndex: number) {
    await this.selectBook(bookIndex);
    await this.tapButton(`remove-recipe-${recipeIndex}`);
  }

  async selectRecipe(recipeIndex: number) {
    await element(by.id(`recipe-item-${recipeIndex}`)).tap();
  }

  async searchBooks(query: string) {
    await this.typeText('book-search-input', query);
  }

  async clearBookSearch() {
    await this.tapButton('clear-book-search-button');
  }

  async sortBooksBy(sortOption: string) {
    await this.tapButton('sort-books-button');
    await this.tapButton(`sort-${sortOption.toLowerCase()}`);
  }

  async expectEmptyState() {
    await this.expectVisible('empty-books-state');
    await this.expectText('empty-books-title', 'No recipe books found');
  }

  async expectLoadingState() {
    await this.expectVisible('books-loading-spinner');
  }

  async expectErrorState() {
    await this.expectVisible('books-error-state');
    await this.expectText('books-error-message', 'Failed to load recipe books');
  }

  async retryLoadBooks() {
    await this.tapButton('retry-books-button');
  }

  async refreshBooks() {
    await this.swipeDown('books-list');
  }

  async expectBookForm() {
    await this.expectVisible('book-name-input');
    await this.expectVisible('book-description-input');
    await this.expectVisible('save-book-button');
    await this.expectVisible('cancel-book-button');
  }

  async expectBookList() {
    await this.expectVisible('books-list');
    await this.expectVisible('create-book-button');
  }

  async expectRecipeVisible(recipeTitle: string) {
    await detoxExpect(element(by.text(recipeTitle))).toBeVisible();
  }
}
