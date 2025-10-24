import { useMemo } from 'react';
import { getService } from '../../infrastructure/di/container';
import { TYPES } from '../../infrastructure/di/types';
import { CreateRecipeBookUseCase } from '../../application/useCases/recipeBooks/CreateRecipeBookUseCase';
import { GetRecipeBookUseCase } from '../../application/useCases/recipeBooks/GetRecipeBookUseCase';
import { UpdateRecipeBookUseCase } from '../../application/useCases/recipeBooks/UpdateRecipeBookUseCase';
import { DeleteRecipeBookUseCase } from '../../application/useCases/recipeBooks/DeleteRecipeBookUseCase';
import { ListRecipeBooksUseCase } from '../../application/useCases/recipeBooks/ListRecipeBooksUseCase';
import { CreateRecipeBookDto } from '../../application/dto/RecipeBookDto';
import { UpdateRecipeBookDto } from '../../application/dto/RecipeBookDto';
import { Result } from '../../domain/common/Result';

/**
 * Custom hook for recipe book operations
 * 
 * Provides access to all recipe book use cases through dependency injection.
 * This follows the Clean Architecture principle by keeping the presentation layer
 * decoupled from the application layer implementation details.
 */
export function useRecipeBookUseCase() {
  const useCases = useMemo(() => ({
    createRecipeBookUseCase: getService<CreateRecipeBookUseCase>(TYPES.CreateRecipeBookUseCase),
    getRecipeBookUseCase: getService<GetRecipeBookUseCase>(TYPES.GetRecipeBookUseCase),
    updateRecipeBookUseCase: getService<UpdateRecipeBookUseCase>(TYPES.UpdateRecipeBookUseCase),
    deleteRecipeBookUseCase: getService<DeleteRecipeBookUseCase>(TYPES.DeleteRecipeBookUseCase),
    listRecipeBooksUseCase: getService<ListRecipeBooksUseCase>(TYPES.ListRecipeBooksUseCase),
  }), []);

  return useCases;
}

/**
 * Hook for creating a recipe book with loading state
 */
export function useCreateRecipeBook() {
  const { createRecipeBookUseCase } = useRecipeBookUseCase();

  const createRecipeBook = async (dto: CreateRecipeBookDto) => {
    return await createRecipeBookUseCase.execute(dto);
  };

  return { createRecipeBook };
}

/**
 * Hook for getting a single recipe book with loading state
 */
export function useGetRecipeBook() {
  const { getRecipeBookUseCase } = useRecipeBookUseCase();

  const getRecipeBook = async (id: string) => {
    return await getRecipeBookUseCase.execute(id);
  };

  return { getRecipeBook };
}

/**
 * Hook for updating a recipe book with loading state
 */
export function useUpdateRecipeBook() {
  const { updateRecipeBookUseCase } = useRecipeBookUseCase();

  const updateRecipeBook = async (id: string, dto: UpdateRecipeBookDto) => {
    return await updateRecipeBookUseCase.execute(dto);
  };

  return { updateRecipeBook };
}

/**
 * Hook for deleting a recipe book with loading state
 */
export function useDeleteRecipeBook() {
  const { deleteRecipeBookUseCase } = useRecipeBookUseCase();

  const deleteRecipeBook = async (id: string) => {
    return await deleteRecipeBookUseCase.deletePermanently(id);
  };

  return { deleteRecipeBook };
}

/**
 * Hook for listing recipe books with loading state
 */
export function useListRecipeBooks() {
  const { listRecipeBooksUseCase } = useRecipeBookUseCase();

  const listRecipeBooks = async (options?: { page?: number; pageSize?: number; search?: string }) => {
    if (options?.search) {
      // For now, we'll use getAll and filter client-side
      // In the future, we can implement server-side search
      const result = await listRecipeBooksUseCase.getAll();
      if (!result.isSuccess) {
        return result;
      }
      
      const filteredBooks = result.value.filter(book => 
        book.title.toLowerCase().includes(options.search!.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(options.search!.toLowerCase()))
      );
      
      return Result.success(filteredBooks);
    }
    
    if (options?.page && options?.pageSize) {
      return await listRecipeBooksUseCase.getWithPagination(options.page, options.pageSize);
    }
    
    return await listRecipeBooksUseCase.getAll();
  };

  return { listRecipeBooks };
}
