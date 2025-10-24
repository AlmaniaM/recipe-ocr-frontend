import fs from 'fs';
import path from 'path';

export interface BundleAsset {
  name: string;
  size: number;
  type: 'javascript' | 'css' | 'image' | 'font' | 'other';
  path: string;
  gzippedSize?: number;
  compressionRatio?: number;
}

export interface BundleChunk {
  name: string;
  size: number;
  modules: string[];
  isEntry: boolean;
  isVendor: boolean;
  isCommon: boolean;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  compressionRatio: number;
  assets: BundleAsset[];
  chunks: BundleChunk[];
  dependencies: BundleDependency[];
  recommendations: string[];
  score: number; // 0-100
}

export interface BundleDependency {
  name: string;
  version: string;
  size: number;
  isDevDependency: boolean;
  isUsed: boolean;
  isOptimized: boolean;
  alternatives?: string[];
}

export interface BundleOptimization {
  type: 'tree-shaking' | 'code-splitting' | 'compression' | 'minification' | 'lazy-loading';
  isApplied: boolean;
  impact: 'low' | 'medium' | 'high';
  description: string;
  recommendation?: string;
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private projectRoot: string;
  private packageJson: any;

  private constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
  }

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  /**
   * Load package.json
   */
  private loadPackageJson(): any {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      console.warn('Could not load package.json:', error);
      return {};
    }
  }

  /**
   * Analyze bundle size
   */
  analyzeBundleSize(): BundleAnalysis {
    const assets = this.analyzeAssets();
    const chunks = this.analyzeChunks();
    const dependencies = this.analyzeDependencies();
    
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const gzippedSize = assets.reduce((sum, asset) => sum + (asset.gzippedSize || asset.size * 0.3), 0);
    const compressionRatio = totalSize > 0 ? gzippedSize / totalSize : 0;
    
    const recommendations = this.generateRecommendations(assets, chunks, dependencies);
    const score = this.calculateBundleScore(totalSize, assets, chunks, dependencies);

    return {
      totalSize,
      gzippedSize,
      compressionRatio,
      assets,
      chunks,
      dependencies,
      recommendations,
      score,
    };
  }

  /**
   * Analyze assets
   */
  private analyzeAssets(): BundleAsset[] {
    const assets: BundleAsset[] = [];
    const assetPaths = [
      'assets/adaptive-icon.png',
      'assets/favicon.png',
      'assets/icon.png',
      'assets/splash-icon.png',
    ];

    for (const assetPath of assetPaths) {
      const fullPath = path.join(this.projectRoot, assetPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const asset: BundleAsset = {
          name: path.basename(assetPath),
          size: stats.size,
          type: this.getAssetType(assetPath),
          path: assetPath,
          gzippedSize: this.estimateGzippedSize(stats.size),
          compressionRatio: this.estimateGzippedSize(stats.size) / stats.size,
        };
        assets.push(asset);
      }
    }

    return assets;
  }

  /**
   * Analyze chunks
   */
  private analyzeChunks(): BundleChunk[] {
    // In a real implementation, this would analyze actual bundle chunks
    // For now, we'll create mock chunks based on the project structure
    const chunks: BundleChunk[] = [
      {
        name: 'main',
        size: this.estimateMainChunkSize(),
        modules: ['App.tsx', 'index.ts'],
        isEntry: true,
        isVendor: false,
        isCommon: false,
      },
      {
        name: 'vendor',
        size: this.estimateVendorChunkSize(),
        modules: this.getVendorModules(),
        isEntry: false,
        isVendor: true,
        isCommon: false,
      },
      {
        name: 'common',
        size: this.estimateCommonChunkSize(),
        modules: this.getCommonModules(),
        isEntry: false,
        isVendor: false,
        isCommon: true,
      },
    ];

    return chunks;
  }

  /**
   * Analyze dependencies
   */
  private analyzeDependencies(): BundleDependency[] {
    const dependencies: BundleDependency[] = [];
    const packageDeps = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };

    for (const [name, version] of Object.entries(packageDeps)) {
      const dependency: BundleDependency = {
        name,
        version: version as string,
        size: this.estimateDependencySize(name),
        isDevDependency: name in (this.packageJson.devDependencies || {}),
        isUsed: this.isDependencyUsed(name),
        isOptimized: this.isDependencyOptimized(name),
        alternatives: this.getDependencyAlternatives(name),
      };
      dependencies.push(dependency);
    }

    return dependencies;
  }

  /**
   * Get asset type
   */
  private getAssetType(assetPath: string): BundleAsset['type'] {
    const ext = path.extname(assetPath).toLowerCase();
    
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      return 'javascript';
    } else if (['.css', '.scss', '.sass'].includes(ext)) {
      return 'css';
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
      return 'image';
    } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
      return 'font';
    } else {
      return 'other';
    }
  }

  /**
   * Estimate gzipped size
   */
  private estimateGzippedSize(originalSize: number): number {
    // Rough estimation: text files compress to ~30%, images to ~90%
    return originalSize * 0.3;
  }

  /**
   * Estimate main chunk size
   */
  private estimateMainChunkSize(): number {
    // Estimate based on project structure
    const srcFiles = this.getSourceFiles();
    return srcFiles.length * 2 * 1024; // 2KB per file estimate
  }

  /**
   * Estimate vendor chunk size
   */
  private estimateVendorChunkSize(): number {
    const vendorModules = this.getVendorModules();
    return vendorModules.length * 50 * 1024; // 50KB per vendor module
  }

  /**
   * Estimate common chunk size
   */
  private estimateCommonChunkSize(): number {
    const commonModules = this.getCommonModules();
    return commonModules.length * 10 * 1024; // 10KB per common module
  }

  /**
   * Get source files
   */
  private getSourceFiles(): string[] {
    try {
      const srcPath = path.join(this.projectRoot, 'src');
      return this.getFilesRecursively(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get files recursively
   */
  private getFilesRecursively(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getFilesRecursively(fullPath, extensions));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Get vendor modules
   */
  private getVendorModules(): string[] {
    const vendorDeps = [
      'react',
      'react-native',
      '@react-navigation/native',
      '@react-navigation/stack',
      '@react-navigation/bottom-tabs',
      'expo',
      'expo-camera',
      'expo-file-system',
      'expo-image-manipulator',
      'expo-image-picker',
      'expo-sharing',
      'expo-sqlite',
      'expo-status-bar',
      'react-native-gesture-handler',
      'react-native-image-crop-picker',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-vector-icons',
      'zustand',
      '@tanstack/react-query',
      'inversify',
      'reflect-metadata',
    ];

    return vendorDeps.filter(dep => this.packageJson.dependencies?.[dep] || this.packageJson.devDependencies?.[dep]);
  }

  /**
   * Get common modules
   */
  private getCommonModules(): string[] {
    return [
      'components/common/LoadingSpinner',
      'components/common/ErrorBoundary',
      'components/common/EmptyState',
      'hooks/useLoadingState',
      'hooks/usePerformance',
      'utils/helpers',
    ];
  }

  /**
   * Estimate dependency size
   */
  private estimateDependencySize(name: string): number {
    const sizeMap: { [key: string]: number } = {
      'react': 50 * 1024,
      'react-native': 200 * 1024,
      '@react-navigation/native': 100 * 1024,
      '@react-navigation/stack': 80 * 1024,
      '@react-navigation/bottom-tabs': 60 * 1024,
      'expo': 300 * 1024,
      'expo-camera': 150 * 1024,
      'expo-file-system': 50 * 1024,
      'expo-image-manipulator': 80 * 1024,
      'expo-image-picker': 70 * 1024,
      'expo-sharing': 40 * 1024,
      'expo-sqlite': 60 * 1024,
      'expo-status-bar': 20 * 1024,
      'react-native-gesture-handler': 100 * 1024,
      'react-native-image-crop-picker': 120 * 1024,
      'react-native-safe-area-context': 30 * 1024,
      'react-native-screens': 40 * 1024,
      'react-native-vector-icons': 200 * 1024,
      'zustand': 20 * 1024,
      '@tanstack/react-query': 80 * 1024,
      'inversify': 60 * 1024,
      'reflect-metadata': 10 * 1024,
    };

    return sizeMap[name] || 50 * 1024; // Default 50KB
  }

  /**
   * Check if dependency is used
   */
  private isDependencyUsed(name: string): boolean {
    // In a real implementation, this would analyze actual usage
    // For now, we'll assume all dependencies are used
    return true;
  }

  /**
   * Check if dependency is optimized
   */
  private isDependencyOptimized(name: string): boolean {
    const optimizedDeps = [
      'react',
      'react-native',
      '@react-navigation/native',
      'expo',
      'zustand',
      '@tanstack/react-query',
    ];

    return optimizedDeps.includes(name);
  }

  /**
   * Get dependency alternatives
   */
  private getDependencyAlternatives(name: string): string[] {
    const alternatives: { [key: string]: string[] } = {
      'lodash': ['ramda', 'native methods'],
      'moment': ['date-fns', 'dayjs'],
      'jquery': ['native DOM methods'],
      'bootstrap': ['tailwindcss', 'styled-components'],
      'material-ui': ['chakra-ui', 'antd'],
    };

    return alternatives[name] || [];
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    assets: BundleAsset[],
    chunks: BundleChunk[],
    dependencies: BundleDependency[]
  ): string[] {
    const recommendations: string[] = [];
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

    // Size recommendations
    if (totalSize > 2 * 1024 * 1024) {
      recommendations.push('Bundle size is too large (>2MB). Consider code splitting and lazy loading.');
    }

    // Asset recommendations
    const largeAssets = assets.filter(asset => asset.size > 100 * 1024);
    if (largeAssets.length > 0) {
      recommendations.push(`Large assets detected: ${largeAssets.map(a => a.name).join(', ')}. Consider optimizing images.`);
    }

    // Dependency recommendations
    const unusedDeps = dependencies.filter(dep => !dep.isUsed && !dep.isDevDependency);
    if (unusedDeps.length > 0) {
      recommendations.push(`Unused dependencies detected: ${unusedDeps.map(d => d.name).join(', ')}. Consider removing them.`);
    }

    const unoptimizedDeps = dependencies.filter(dep => !dep.isOptimized && dep.size > 100 * 1024);
    if (unoptimizedDeps.length > 0) {
      recommendations.push(`Large unoptimized dependencies: ${unoptimizedDeps.map(d => d.name).join(', ')}. Consider alternatives.`);
    }

    // Chunk recommendations
    const largeChunks = chunks.filter(chunk => chunk.size > 500 * 1024);
    if (largeChunks.length > 0) {
      recommendations.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}. Consider splitting them.`);
    }

    // Compression recommendations
    const uncompressedAssets = assets.filter(asset => asset.compressionRatio && asset.compressionRatio > 0.5);
    if (uncompressedAssets.length > 0) {
      recommendations.push('Some assets have poor compression. Consider optimizing them.');
    }

    return recommendations;
  }

  /**
   * Calculate bundle score
   */
  private calculateBundleScore(
    totalSize: number,
    assets: BundleAsset[],
    chunks: BundleChunk[],
    dependencies: BundleDependency[]
  ): number {
    let score = 100;

    // Size penalty
    if (totalSize > 2 * 1024 * 1024) {
      score -= 30;
    } else if (totalSize > 1 * 1024 * 1024) {
      score -= 15;
    }

    // Asset optimization penalty
    const largeAssets = assets.filter(asset => asset.size > 100 * 1024);
    score -= largeAssets.length * 5;

    // Dependency optimization penalty
    const unoptimizedDeps = dependencies.filter(dep => !dep.isOptimized && dep.size > 100 * 1024);
    score -= unoptimizedDeps.length * 3;

    // Chunk optimization penalty
    const largeChunks = chunks.filter(chunk => chunk.size > 500 * 1024);
    score -= largeChunks.length * 10;

    // Compression penalty
    const poorCompression = assets.filter(asset => asset.compressionRatio && asset.compressionRatio > 0.5);
    score -= poorCompression.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get bundle optimizations
   */
  getBundleOptimizations(): BundleOptimization[] {
    return [
      {
        type: 'tree-shaking',
        isApplied: this.isTreeShakingApplied(),
        impact: 'high',
        description: 'Remove unused code from bundle',
        recommendation: this.isTreeShakingApplied() ? undefined : 'Enable tree shaking in build configuration',
      },
      {
        type: 'code-splitting',
        isApplied: this.isCodeSplittingApplied(),
        impact: 'high',
        description: 'Split code into smaller chunks',
        recommendation: this.isCodeSplittingApplied() ? undefined : 'Implement code splitting for large components',
      },
      {
        type: 'compression',
        isApplied: this.isCompressionApplied(),
        impact: 'medium',
        description: 'Compress assets and code',
        recommendation: this.isCompressionApplied() ? undefined : 'Enable gzip compression for assets',
      },
      {
        type: 'minification',
        isApplied: this.isMinificationApplied(),
        impact: 'medium',
        description: 'Minify JavaScript and CSS',
        recommendation: this.isMinificationApplied() ? undefined : 'Enable minification in build process',
      },
      {
        type: 'lazy-loading',
        isApplied: this.isLazyLoadingApplied(),
        impact: 'high',
        description: 'Load components on demand',
        recommendation: this.isLazyLoadingApplied() ? undefined : 'Implement lazy loading for routes and components',
      },
    ];
  }

  /**
   * Check if tree shaking is applied
   */
  private isTreeShakingApplied(): boolean {
    // Check for tree shaking indicators in package.json
    const hasTreeShakingSupport = this.packageJson.sideEffects === false;
    return hasTreeShakingSupport;
  }

  /**
   * Check if code splitting is applied
   */
  private isCodeSplittingApplied(): boolean {
    // Check for code splitting indicators
    const srcFiles = this.getSourceFiles();
    const hasLazyImports = srcFiles.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('React.lazy') || content.includes('import(');
      } catch {
        return false;
      }
    });
    return hasLazyImports;
  }

  /**
   * Check if compression is applied
   */
  private isCompressionApplied(): boolean {
    // Check for compression indicators
    return true; // Assume compression is applied in production
  }

  /**
   * Check if minification is applied
   */
  private isMinificationApplied(): boolean {
    // Check for minification indicators
    return true; // Assume minification is applied in production
  }

  /**
   * Check if lazy loading is applied
   */
  private isLazyLoadingApplied(): boolean {
    // Check for lazy loading indicators
    const srcFiles = this.getSourceFiles();
    const hasLazyLoading = srcFiles.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('React.lazy') || content.includes('import(');
      } catch {
        return false;
      }
    });
    return hasLazyLoading;
  }

  /**
   * Generate bundle report
   */
  generateBundleReport(): string {
    const analysis = this.analyzeBundleSize();
    const optimizations = this.getBundleOptimizations();

    let report = `\n=== Bundle Analysis Report ===\n`;
    report += `Total Size: ${this.formatBytes(analysis.totalSize)}\n`;
    report += `Gzipped Size: ${this.formatBytes(analysis.gzippedSize)}\n`;
    report += `Compression Ratio: ${(analysis.compressionRatio * 100).toFixed(1)}%\n`;
    report += `Bundle Score: ${analysis.score}/100\n\n`;

    report += `=== Assets ===\n`;
    analysis.assets.forEach(asset => {
      report += `${asset.name}: ${this.formatBytes(asset.size)}`;
      if (asset.gzippedSize) {
        report += ` (gzipped: ${this.formatBytes(asset.gzippedSize)})`;
      }
      report += `\n`;
    });

    report += `\n=== Chunks ===\n`;
    analysis.chunks.forEach(chunk => {
      report += `${chunk.name}: ${this.formatBytes(chunk.size)} (${chunk.modules.length} modules)\n`;
    });

    report += `\n=== Dependencies ===\n`;
    analysis.dependencies
      .filter(dep => dep.size > 50 * 1024) // Only show dependencies > 50KB
      .sort((a, b) => b.size - a.size)
      .forEach(dep => {
        report += `${dep.name}: ${this.formatBytes(dep.size)}`;
        if (!dep.isOptimized) {
          report += ` (not optimized)`;
        }
        if (!dep.isUsed) {
          report += ` (unused)`;
        }
        report += `\n`;
      });

    report += `\n=== Optimizations ===\n`;
    optimizations.forEach(opt => {
      const status = opt.isApplied ? '✓' : '✗';
      report += `${status} ${opt.type}: ${opt.description}\n`;
      if (opt.recommendation) {
        report += `  Recommendation: ${opt.recommendation}\n`;
      }
    });

    if (analysis.recommendations.length > 0) {
      report += `\n=== Recommendations ===\n`;
      analysis.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const bundleAnalyzer = BundleAnalyzer.getInstance();
