import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

/**
 * 将 Cloudflare Pages 静态文件与本地 vendor 原样复制到 dist/，
 * 保证构建产物可直接用于 Cloudflare Pages 部署与本地预览。
 */
function copyStaticAssetsPlugin() {
  return {
    name: 'copy-static-assets',
    apply: 'build',
    closeBundle() {
      const rootDir = process.cwd();
      const distDir = path.resolve(rootDir, 'dist');
      const copyFileIfExists = (rel) => {
        const src = path.resolve(rootDir, rel);
        const dest = path.resolve(distDir, rel);
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
        }
      };

      copyFileIfExists('_headers');
      copyFileIfExists('manifest.webmanifest');

      // 构建时生成 robots.txt 与 sitemap.xml（动态化后保持完整 SEO 索引）
      const siteOrigin = 'https://bencaozhiyan-xixiyu.pages.dev';
      const today = new Date().toISOString().slice(0, 10);
      const robotsTxt = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        '',
        `Sitemap: ${siteOrigin}/sitemap.xml`,
        ''
      ].join('\n');
      fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt, 'utf8');

      const sitemapUrls = [
        { loc: `${siteOrigin}/`, priority: '1.0', freq: 'weekly' },
        { loc: `${siteOrigin}/?route=bank`, priority: '0.9', freq: 'weekly' },
        { loc: `${siteOrigin}/?route=translation`, priority: '0.9', freq: 'weekly' },
        { loc: `${siteOrigin}/?route=workflow`, priority: '0.9', freq: 'weekly' },
        { loc: `${siteOrigin}/?route=ai`, priority: '0.8', freq: 'weekly' },
        { loc: `${siteOrigin}/?route=diy`, priority: '0.8', freq: 'weekly' }
      ];
      const sitemapXml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapUrls.map(
          (u) =>
            `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`
        ),
        '</urlset>',
        ''
      ].join('\n');
      fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf8');

      const vendorSrc = path.resolve(rootDir, 'vendor');
      const vendorDest = path.resolve(distDir, 'vendor');
      const skippedVendors = new Set([
        'tailwindcss-3.4.17.min.js',
        'chart-4.4.1.umd.min.js',
        'html2canvas-1.4.1.min.js',
        'lucide-0.460.0.min.js'
      ]);
      if (fs.existsSync(vendorSrc)) {
        const remaining = fs.readdirSync(vendorSrc).filter((e) => !skippedVendors.has(e));
        if (remaining.length > 0) {
          fs.mkdirSync(vendorDest, { recursive: true });
          for (const entry of remaining) {
            fs.copyFileSync(path.join(vendorSrc, entry), path.join(vendorDest, entry));
          }
        }
      }
    }
  };
}

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    strictPort: false
  },
  preview: {
    port: 4173,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/@kurkle/color')) {
            return 'vendor-chart';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'vendor-html2canvas';
          }
          if (id.includes('lab-v18-translation') || id.includes('routes/translation-chunk')) {
            return 'route-translation';
          }
          if (id.includes('lab-v12-diy-studio') || id.includes('lab-v13-mission-os') || id.includes('routes/diy-chunk')) {
            return 'route-diy';
          }
          if (id.includes('lab-v11-userplan') || id.includes('lab-v17-ai-review') || id.includes('routes/ai-review-chunk')) {
            return 'modal-ai-review';
          }
          if (id.includes('lab-v8-studio') || id.includes('lab-v9-visuals') || id.includes('routes/workflow-visuals-chunk')) {
            return 'route-workflow-visuals';
          }
          if (id.includes('lab-v15-insight') || id.includes('routes/insight-chunk')) {
            return 'modal-insight';
          }
        }
      }
    }
  },
  plugins: [
    copyStaticAssetsPlugin(),
    visualizer({
      filename: 'bundle-report/stats.html',
      title: 'tcm-chemistry-lab Bundle Visualizer',
      template: 'treemap',
      gzipSize: true,
      brotliSize: false,
      open: false
    }),
    visualizer({
      filename: 'bundle-report/stats.json',
      template: 'raw-data',
      gzipSize: true,
      open: false
    })
  ]
});
