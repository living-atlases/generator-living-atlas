import { bakeBrandingBuildScripts } from '../generators/app/libs.js';

const baked = 'https://colecciones-marinas.gbif.es/brand-2023';

describe('bakeBrandingBuildScripts', () => {
  it('bakes the URL into both vite passes', () => {
    const out = bakeBrandingBuildScripts({ build: 'vite build', dev: 'vite' }, baked);
    expect(out.build).toBe(
      `cross-env BASE_BRANDING_URL=${baked} vite build && cross-env BASE_BRANDING_URL=${baked} BUILD_INIT=1 vite build`
    );
    expect(out.dev).toBe('vite');
  });

  it('keeps the Bootstrap 5 build and bakes the same URL into it', () => {
    const scripts = {
      build:
        'cross-env BASE_BRANDING_URL=https://l-a.site vite build && cross-env BASE_BRANDING_URL=https://l-a.site BUILD_INIT=1 vite build && npm run build:bs5',
      'build:bs5': 'cross-env BASE_BRANDING_URL=https://l-a.site node scripts/build-bs5.mjs',
    };
    const out = bakeBrandingBuildScripts(scripts, baked);
    expect(out.build.endsWith(' && npm run build:bs5')).toBe(true);
    expect(out.build).not.toContain('l-a.site');
    expect(out['build:bs5']).toBe(`cross-env BASE_BRANDING_URL=${baked} node scripts/build-bs5.mjs`);
  });

  it('adds the URL to a build:bs5 script that has none', () => {
    const out = bakeBrandingBuildScripts({ build: 'vite build', 'build:bs5': 'node scripts/build-bs5.mjs' }, baked);
    expect(out['build:bs5']).toBe(`cross-env BASE_BRANDING_URL=${baked} node scripts/build-bs5.mjs`);
  });

  it('is idempotent on replays', () => {
    const once = bakeBrandingBuildScripts({ build: 'x', 'build:bs5': 'node scripts/build-bs5.mjs' }, baked);
    expect(bakeBrandingBuildScripts(once, baked)).toEqual(once);
  });

  it('does not modify its input', () => {
    const scripts = { build: 'vite build' };
    bakeBrandingBuildScripts(scripts, baked);
    expect(scripts).toEqual({ build: 'vite build' });
  });
});
