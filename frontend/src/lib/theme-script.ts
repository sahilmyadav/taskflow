import type { ColorMode } from '@/types/task';

/**
 * Accent colours as raw HSL channels, so they can be dropped into both a CSS
 * custom property and an `hsl(...)` call.
 */
export const THEME_COLORS: Record<ColorMode, string> = {
  Amber: '38 92% 50%',
  Blue: '221 83% 53%',
  Pink: '330 81% 60%',
  Rose: '347 77% 50%',
  Emerald: '142 76% 36%',
  Black: '240 5.9% 10%',
};

export const DEFAULT_COLOR_MODE: ColorMode = 'Black';

/**
 * Runs synchronously in <head> while the browser parses the document, so the
 * stored theme and accent are on <html> before the first paint. Without this
 * the page paints light, then corrects itself once React hydrates.
 *
 * Kept in sync with the store by deriving the colour table from THEME_COLORS.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem('theme')||'system';
var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
var r=t==='system'?s:t;
d.classList.remove('light','dark');
d.classList.add(r);
d.setAttribute('data-theme',r);
d.style.colorScheme=r;
var c=${JSON.stringify(THEME_COLORS)};
var m=localStorage.getItem('colorMode')||'${DEFAULT_COLOR_MODE}';
var h=c[m]||c['${DEFAULT_COLOR_MODE}'];
d.style.setProperty('--primary',h);
if(m==='${DEFAULT_COLOR_MODE}'){d.style.removeProperty('--accent-color');}
else{d.style.setProperty('--accent-color','hsl('+h+')');}
}catch(e){}})();`
  .replace(/\n/g, '');
