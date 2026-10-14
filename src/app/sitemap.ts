import { MetadataRoute } from "next";
import { i18n } from "@/config/i18n-config";
import { execSync } from "child_process";
import { readdir, stat } from "fs/promises";
import { join } from "path";

// Allow sitemap to be revalidated every hour (3600 seconds)
export const revalidate = 3600;

const getLastModified = (filePath: string): Date => {
  try {
    // 转义文件路径中的特殊字符，避免 shell 解析错误
    const escapedPath = filePath.replace(/'/g, "'\\''");
    const timestamp = execSync(`git log -1 --format=%cI '${escapedPath}'`)
      .toString()
      .trim();
    if (timestamp) {
      return new Date(timestamp);
    }
  } catch (e) {
    // If git command fails (e.g. in environments without git), fall back to current date
    console.warn(`Failed to get git timestamp for ${filePath}`, e);
  }
  return new Date();
};

/**
 * 递归扫描目录，查找所有 page.tsx 文件
 */
async function scanPages(
  dir: string,
  baseDir: string
): Promise<{ path: string; file: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[]> {
  const pages: { path: string; file: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // 跳过特定目录
      if (
        entry.name.startsWith('_') ||  // Next.js 私有目录
        entry.name.startsWith('.') ||  // 隐藏文件
        entry.name === 'node_modules' ||
        entry.name === 'api'           // 跳过 API 路由
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        // 递归扫描子目录
        const subPages = await scanPages(fullPath, baseDir);
        pages.push(...subPages);
      } else if (entry.name === 'page.tsx') {
        // 计算路由路径
        const relativePath = fullPath.replace(baseDir, '');
        const routePath = relativePath
          .replace(/\/page\.tsx$/, '')           // 移除 /page.tsx
          .replace(/\[.*?\]/g, '')                // 移除动态路由参数
          .replace(/\/\([^)]+\)/g, '')            // 移除路由组 (marketing)/(tool)
          .replace('//', '/')                     // 修复双斜杠
          .replace(/^\//, '')                     // 移除开头的斜杠
          || '/';                                 // 根路径

        // 跳过 dashboard、admin 等不需要 SEO 的页面
        const skipRoutes = ['dashboard', 'admin', 'auth', 'login', 'register', 'settings'];
        if (skipRoutes.some(route => routePath.includes(route))) {
          continue;
        }

        // 根据路径确定优先级和更新频率
        let priority = 0.8;
        let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly';

        if (routePath === '' || routePath === '/') {
          priority = 1.0;
          changeFrequency = 'daily';
        } else if (routePath.includes('pricing')) {
          priority = 0.9;
          changeFrequency = 'weekly';
        } else if (routePath.includes('privacy') || routePath.includes('terms')) {
          priority = 0.3;
          changeFrequency = 'monthly';
        } else if (routePath.includes('-to-') || /\d/.test(routePath)) {
          // 工具页面和模型页面
          priority = 0.7;
          changeFrequency = 'weekly';
        }

        pages.push({
          path: routePath === '/' ? '' : routePath,
          file: fullPath,
          priority,
          changeFrequency,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return pages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://videofly.app";

  // 自动扫描所有页面
  const appDir = join(process.cwd(), 'src', 'app', '[locale]');
  const routes = await scanPages(appDir, appDir);

  console.log('🗺️  Sitemap: 发现页面:', routes.length);

  const sitemap: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const lastModified = getLastModified(route.file);

    for (const locale of i18n.locales) {
      const localePath = locale === i18n.defaultLocale ? "" : `/${locale}`;
      const url = `${baseUrl}${localePath}${route.path ? `/${route.path}` : ''}`;

      sitemap.push({
        url,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  console.log(`🗺️  Sitemap: 生成 ${sitemap.length} 个 URL`);

  return sitemap;
}
