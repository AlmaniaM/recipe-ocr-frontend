import { Result } from '../../domain/common/Result';

describe('Result', () => {
  describe('success', () => {
    it('should create a successful result with a value', () => {
      const result = Result.success('test value');
      
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe('test value');
    });

    it('should create a successful result without a value', () => {
      const result = Result.successEmpty();
      
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
    });
  });

  describe('failure', () => {
    it('should create a failed result with an error message', () => {
      const result = Result.failure('test error');
      
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('test error');
    });
  });

  describe('map', () => {
    it('should map successful result to new value', () => {
      const result = Result.success(5);
      const mapped = result.map(x => x * 2);
      
      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe(10);
    });

    it('should return failure when mapping failed result', () => {
      const result = Result.failure('error');
      const mapped = result.map(x => x * 2);
      
      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('error');
    });

    it('should return failure when mapping function throws', () => {
      const result = Result.success(5);
      const mapped = result.map(x => {
        throw new Error('mapping error');
      });
      
      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('mapping error');
    });
  });

  describe('flatMap', () => {
    it('should flatMap successful result', () => {
      const result = Result.success(5);
      const flatMapped = result.flatMap(x => Result.success(x * 2));
      
      expect(flatMapped.isSuccess).toBe(true);
      expect(flatMapped.value).toBe(10);
    });

    it('should return failure when flatMapping failed result', () => {
      const result = Result.failure('error');
      const flatMapped = result.flatMap(x => Result.success(x * 2));
      
      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.error).toBe('error');
    });
  });

  describe('onSuccess', () => {
    it('should execute function on successful result', () => {
      const result = Result.success('test');
      let executed = false;
      
      result.onSuccess(value => {
        expect(value).toBe('test');
        executed = true;
      });
      
      expect(executed).toBe(true);
    });

    it('should not execute function on failed result', () => {
      const result = Result.failure('error');
      let executed = false;
      
      result.onSuccess(() => {
        executed = true;
      });
      
      expect(executed).toBe(false);
    });
  });

  describe('onFailure', () => {
    it('should execute function on failed result', () => {
      const result = Result.failure('error');
      let executed = false;
      
      result.onFailure(error => {
        expect(error).toBe('error');
        executed = true;
      });
      
      expect(executed).toBe(true);
    });

    it('should not execute function on successful result', () => {
      const result = Result.success('test');
      let executed = false;
      
      result.onFailure(() => {
        executed = true;
      });
      
      expect(executed).toBe(false);
    });
  });

  describe('getValueOr', () => {
    it('should return value for successful result', () => {
      const result = Result.success('test');
      expect(result.getValueOr('default')).toBe('test');
    });

    it('should return default for failed result', () => {
      const result = Result.failure('error');
      expect(result.getValueOr('default')).toBe('default');
    });
  });

  describe('getValueOrThrow', () => {
    it('should return value for successful result', () => {
      const result = Result.success('test');
      expect(result.getValueOrThrow()).toBe('test');
    });

    it('should throw error for failed result', () => {
      const result = Result.failure('error');
      expect(() => result.getValueOrThrow()).toThrow('error');
    });
  });
});
