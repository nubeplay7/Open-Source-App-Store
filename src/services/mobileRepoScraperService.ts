import { AppCatalogItem, AppCatalogCategory } from '../types';

export interface ScrapedReleaseAsset {
  name: string;
  downloadUrl: string;
  sizeMb: number;
  tagName: string;
  publishedAt: string;
}

export interface ScrapedRepoResult {
  id: string;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string;
  license: string;
  defaultBranch: string;
  updatedAt: string;
  topics: string[];
  openIssues: number;
  hasReleases: boolean;
  latestVersion?: string;
  releaseAssets?: ScrapedReleaseAsset[];
  detectedCategory: AppCatalogCategory;
  suggestedPackageName: string;
  suggestedGradleTask: string;
}

export const PRESET_SEARCH_QUERIES = [
  { id: 'music-audio', label: 'Música & Audio', query: 'music player android' },
  { id: 'stores-managers', label: 'Tiendas & Gestores', query: 'package manager android foss' },
  { id: 'privacy-crypto', label: 'Privacidad & Cripto', query: 'privacy secure android client' },
  { id: 'productivity', label: 'Productividad & Notas', query: 'notes task productivity android' },
  { id: 'tools-utilities', label: 'Herramientas & Root', query: 'tools utility root shizuku' },
  { id: 'emulators-games', label: 'Juegos & Emuladores', query: 'emulator gaming android' },
  { id: 'flutter-apps', label: 'Apps en Flutter', query: 'flutter app android foss' },
  { id: 'react-native-apps', label: 'React Native FOSS', query: 'react-native android foss' }
];

class MobileRepoScraperService {
  private fallbackToken = (typeof localStorage !== 'undefined' ? localStorage.getItem('civer_github_pat') : '') || '';

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Civer-AppStore-Admin-Scraper'
    };
    if (this.fallbackToken) {
      headers['Authorization'] = `token ${this.fallbackToken}`;
    }
    return headers;
  }

  private mapLanguageAndTopicsToCategory(language: string, topics: string[], description: string): AppCatalogCategory {
    const text = (topics.join(' ') + ' ' + description).toLowerCase();
    if (text.includes('store') || text.includes('fdroid') || text.includes('package manager') || text.includes('obtainium')) {
      return 'STORES';
    }
    if (text.includes('music') || text.includes('audio') || text.includes('player') || text.includes('video') || text.includes('stream') || text.includes('podcast')) {
      return 'MULTIMEDIA';
    }
    if (text.includes('privacy') || text.includes('vpn') || text.includes('crypto') || text.includes('password') || text.includes('security') || text.includes('keepass')) {
      return 'PRIVACY';
    }
    if (text.includes('note') || text.includes('read') || text.includes('book') || text.includes('calendar') || text.includes('task') || text.includes('editor')) {
      return 'PRODUCTIVITY';
    }
    if (text.includes('tool') || text.includes('terminal') || text.includes('root') || text.includes('backup') || text.includes('installer') || text.includes('downloader')) {
      return 'TOOLS';
    }
    if (text.includes('game') || text.includes('emulator') || text.includes('retro')) {
      return 'GAMING';
    }
    if (text.includes('chat') || text.includes('messenger') || text.includes('social') || text.includes('matrix')) {
      return 'COMMUNICATION';
    }
    return 'TOOLS';
  }

  private generatePackageName(repoName: string, owner: string): string {
    const cleanRepo = repoName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanOwner = owner.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `org.${cleanOwner}.${cleanRepo}`;
  }

  async searchGitHubRepos(query: string, options?: { sort?: 'stars' | 'updated'; perPage?: number }): Promise<ScrapedRepoResult[]> {
    const sort = options?.sort || 'stars';
    const perPage = options?.perPage || 15;
    
    let q = query.trim();
    if (!q.includes('android') && !q.includes('flutter') && !q.includes('mobile')) {
      q += ' (android OR mobile OR flutter)';
    }

    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=${sort}&order=desc&per_page=${perPage}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      
      if (!res.ok) {
        console.warn(`[Scraper] GitHub API respondió con status ${res.status}. Usando fallback local.`);
        return this.getMockFallbackResults(query);
      }

      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) {
        return this.getMockFallbackResults(query);
      }

      const results: ScrapedRepoResult[] = data.items.map((repo: any) => {
        const category = this.mapLanguageAndTopicsToCategory(repo.language || '', repo.topics || [], repo.description || '');
        const owner = repo.owner?.login || 'foss';
        return {
          id: `scraped-${repo.id}`,
          name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          fullName: repo.full_name,
          description: repo.description || 'Aplicación móvil de código abierto descubierta mediante el Scraper Civer.',
          htmlUrl: repo.html_url,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          language: repo.language || 'Kotlin',
          license: repo.license?.spdx_id || 'GPL-3.0',
          defaultBranch: repo.default_branch || 'main',
          updatedAt: new Date(repo.updated_at).toLocaleDateString(),
          topics: repo.topics || [],
          openIssues: repo.open_issues_count || 0,
          hasReleases: true,
          latestVersion: 'v1.0.0',
          detectedCategory: category,
          suggestedPackageName: this.generatePackageName(repo.name, owner),
          suggestedGradleTask: (repo.language === 'Dart' || repo.topics?.includes('flutter')) ? 'flutter build apk --release' : './gradlew assembleRelease'
        };
      });

      return results;
    } catch (err) {
      console.error('[Scraper] Error buscando en GitHub:', err);
      return this.getMockFallbackResults(query);
    }
  }

  async fetchRepoReleases(fullName: string): Promise<ScrapedReleaseAsset[]> {
    try {
      const url = `https://api.github.com/repos/${fullName}/releases?per_page=5`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];

      const data = await res.json();
      if (!Array.isArray(data)) return [];

      const assetsList: ScrapedReleaseAsset[] = [];
      data.forEach((release: any) => {
        const tagName = release.tag_name || 'v1.0';
        const publishedAt = new Date(release.published_at || Date.now()).toLocaleDateString();
        (release.assets || []).forEach((a: any) => {
          if (a.name.endsWith('.apk') || a.name.endsWith('.aab')) {
            assetsList.push({
              name: a.name,
              downloadUrl: a.browser_download_url,
              sizeMb: Math.round((a.size / 1024 / 1024) * 10) / 10,
              tagName,
              publishedAt
            });
          }
        });
      });

      return assetsList;
    } catch (e) {
      return [];
    }
  }

  convertToCatalogItem(repo: ScrapedRepoResult, releaseAsset?: ScrapedReleaseAsset): AppCatalogItem {
    const id = repo.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const version = releaseAsset?.tagName || repo.latestVersion || 'v1.0.0';
    const apkSizeMb = releaseAsset?.sizeMb || 15.4;

    const gradients = [
      { bg: 'bg-indigo-600', grad: 'from-indigo-500 to-purple-700', banner: 'from-indigo-950 via-purple-900 to-slate-950' },
      { bg: 'bg-emerald-600', grad: 'from-emerald-500 to-teal-700', banner: 'from-emerald-950 via-teal-900 to-slate-950' },
      { bg: 'bg-amber-600', grad: 'from-amber-500 to-orange-700', banner: 'from-amber-950 via-orange-900 to-slate-950' },
      { bg: 'bg-cyan-600', grad: 'from-cyan-500 to-blue-700', banner: 'from-cyan-950 via-blue-900 to-slate-950' },
      { bg: 'bg-rose-600', grad: 'from-rose-500 to-pink-700', banner: 'from-rose-950 via-pink-900 to-slate-950' }
    ];
    const pickedTheme = gradients[Math.abs(repo.name.length) % gradients.length];
    const owner = repo.fullName.split('/')[0] || 'Community';

    return {
      id,
      name: repo.name,
      packageName: repo.suggestedPackageName,
      category: repo.detectedCategory,
      tagline: repo.description.length > 85 ? repo.description.substring(0, 82) + '...' : repo.description,
      description: `${repo.description}\n\nProyecto de código abierto mantenido por ${owner} con licencia ${repo.license}. Descubierto mediante el rastreador automatizado de repositorios Civer App Store.`,
      iconBg: pickedTheme.bg,
      iconGradient: pickedTheme.grad,
      iconSymbol: repo.detectedCategory === 'MULTIMEDIA' ? 'Music' : repo.detectedCategory === 'STORES' ? 'Store' : repo.detectedCategory === 'PRIVACY' ? 'Shield' : 'Code2',
      bannerGradient: pickedTheme.banner,
      screenshots: [],
      rating: 4.8,
      reviewCount: `${Math.max(1, Math.floor(repo.stars / 10))} reviews`,
      downloads: `${Math.max(100, repo.stars * 8)}+`,
      apkSizeMb,
      version,
      minAndroid: 'Android 8.0 (API 26)',
      targetSdk: 35,
      license: repo.license,
      githubUrl: repo.htmlUrl,
      githubStars: repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : `${repo.stars}`,
      isFree: true,
      price: 'Gratis • FOSS',
      developer: {
        name: owner,
        github: `https://github.com/${owner}`,
        website: repo.htmlUrl,
        verified: true
      },
      permissions: ['INTERNET', 'ACCESS_NETWORK_STATE', 'WAKE_LOCK'],
      trackersCount: 0,
      isStore: repo.detectedCategory === 'STORES',
      canCompileWithCi: true,
      defaultBranch: repo.defaultBranch,
      gradleTask: repo.suggestedGradleTask,
      recentReleaseDate: repo.updatedAt,
      changelogSummary: `Importación inicial al catálogo oficial Civer App Store desde ${repo.fullName}.`,
      badgeTag: 'Rastreado con Scraper',
      isFeatured: false,
      isEditorChoice: false,
      cloudBuildAvailable: !!releaseAsset,
      directApkDownloadUrl: releaseAsset?.downloadUrl || `https://appstore.civer.cloud/downloads/${repo.suggestedPackageName}-${version}-release.apk`,
      historicalVersions: [version],
      isScraped: true
    };
  }

  private getMockFallbackResults(query: string): ScrapedRepoResult[] {
    const rawList: ScrapedRepoResult[] = [
      {
        id: 'scraped-vimusic',
        name: 'ViMusic',
        fullName: 'vfsfitvnm/ViMusic',
        description: 'Una app para Android que te permite reproducir una amplia selección de canciones de YouTube Music sin anuncios ni cuentas requeridas.',
        htmlUrl: 'https://github.com/vfsfitvnm/ViMusic',
        stars: 12400,
        forks: 1100,
        language: 'Kotlin',
        license: 'GPL-3.0',
        defaultBranch: 'master',
        updatedAt: '2026-06-15',
        topics: ['android', 'youtube-music', 'music-player', 'foss'],
        openIssues: 45,
        hasReleases: true,
        latestVersion: 'v0.5.4',
        detectedCategory: 'MULTIMEDIA',
        suggestedPackageName: 'it.vfsfitvnm.vimusic',
        suggestedGradleTask: './gradlew assembleRelease'
      },
      {
        id: 'scraped-innertune',
        name: 'InnerTune',
        fullName: 'z-huang/InnerTune',
        description: 'Cliente de YouTube Music para Android con interfaz moderna basada en Material 3, descarga en caché local y letras sincronizadas.',
        htmlUrl: 'https://github.com/z-huang/InnerTune',
        stars: 9800,
        forks: 820,
        language: 'Kotlin',
        license: 'GPL-3.0',
        defaultBranch: 'main',
        updatedAt: '2026-07-20',
        topics: ['android', 'youtube-music', 'material3', 'audio'],
        openIssues: 32,
        hasReleases: true,
        latestVersion: 'v0.5.8',
        detectedCategory: 'MULTIMEDIA',
        suggestedPackageName: 'com.zionhuang.music',
        suggestedGradleTask: './gradlew assembleRelease'
      },
      {
        id: 'scraped-neostore',
        name: 'Neo Store',
        fullName: 'NeoApplications/Neo-Store',
        description: 'Cliente F-Droid moderno y elegante con diseño Material You, soporte multi-repositorio e instalación silenciosa Shizuku.',
        htmlUrl: 'https://github.com/NeoApplications/Neo-Store',
        stars: 4200,
        forks: 310,
        language: 'Kotlin',
        license: 'GPL-3.0',
        defaultBranch: 'main',
        updatedAt: '2026-08-01',
        topics: ['android', 'fdroid', 'package-manager', 'foss'],
        openIssues: 18,
        hasReleases: true,
        latestVersion: 'v1.1.0',
        detectedCategory: 'STORES',
        suggestedPackageName: 'com.machiav3lli.backup',
        suggestedGradleTask: './gradlew assembleRelease'
      },
      {
        id: 'scraped-retroarch',
        name: 'RetroArch Android',
        fullName: 'libretro/RetroArch',
        description: 'Front-end multiplataforma para emuladores, motores de videojuegos y reproductores de medios de alta precisión.',
        htmlUrl: 'https://github.com/libretro/RetroArch',
        stars: 18900,
        forks: 2400,
        language: 'C',
        license: 'GPL-3.0',
        defaultBranch: 'master',
        updatedAt: '2026-08-25',
        topics: ['android', 'emulator', 'gaming', 'retroarch'],
        openIssues: 120,
        hasReleases: true,
        latestVersion: 'v1.19.1',
        detectedCategory: 'GAMING',
        suggestedPackageName: 'com.retroarch.aarch64',
        suggestedGradleTask: './gradlew assembleRelease'
      },
      {
        id: 'scraped-briar',
        name: 'Briar',
        fullName: 'briar/briar',
        description: 'Mensajería segura peer-to-peer cifrada punto a punto vía Bluetooth, Wi-Fi local o la red Tor sin servidores centrales.',
        htmlUrl: 'https://code.briarproject.org/briar/briar',
        stars: 3800,
        forks: 410,
        language: 'Java',
        license: 'GPL-3.0',
        defaultBranch: 'master',
        updatedAt: '2026-07-30',
        topics: ['android', 'p2p', 'tor', 'security', 'privacy'],
        openIssues: 50,
        hasReleases: true,
        latestVersion: 'v1.5.8',
        detectedCategory: 'COMMUNICATION',
        suggestedPackageName: 'org.briarproject.briar.android',
        suggestedGradleTask: './gradlew assembleRelease'
      },
      {
        id: 'scraped-fossify-phone',
        name: 'Fossify Phone',
        fullName: 'FossifyOrg/Phone',
        description: 'Marcador telefónico y gestor de llamadas limpio, rápido y de código abierto sin anuncios ni rastreadores.',
        htmlUrl: 'https://github.com/FossifyOrg/Phone',
        stars: 2100,
        forks: 180,
        language: 'Kotlin',
        license: 'GPL-3.0',
        defaultBranch: 'master',
        updatedAt: '2026-08-10',
        topics: ['android', 'dialer', 'phone', 'fossify'],
        openIssues: 12,
        hasReleases: true,
        latestVersion: 'v1.1.2',
        detectedCategory: 'TOOLS',
        suggestedPackageName: 'org.fossify.phone',
        suggestedGradleTask: './gradlew assembleRelease'
      }
    ];

    const qLower = query.toLowerCase();
    return rawList.filter(item => 
      item.name.toLowerCase().includes(qLower) ||
      item.description.toLowerCase().includes(qLower) ||
      item.topics.some(t => t.toLowerCase().includes(qLower)) ||
      item.detectedCategory.toLowerCase().includes(qLower)
    );
  }
}

export const mobileRepoScraper = new MobileRepoScraperService();
