// 导出语言列表与语言支持
import * as monaco from 'monaco-editor';
import { registerBatLanguage } from '@/modules/monaco/bat';
import { registerNginxLanguage } from '@/modules/monaco/nginx';
import { registerPowerShellLanguage } from '@/modules/monaco/ps1';

export type MonacoLanguage = string;

export const getMonacoLanguages = (): MonacoLanguage[] => {
  const languages = monaco.languages.getLanguages();
  return languages
    .map(lang => lang.id)
    .slice(0, 30);
};

export const MONACO_LANGUAGES: MonacoLanguage[] = [
  'plaintext',
  'json',
  'javascript',
  'typescript',
  'html',
  'css',
  'xml',
  'markdown',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'rust',
  'php',
  'ruby',
  'sql',
  'yaml',
  'toml',
  'ini',
  'dockerfile',
  'bat',
  'bash',
  'powershell',
  'nginx',
  'apacheconf',
  'lua',
  'perl',
  'r',
  'scala',
  'swift'
];

export function registerMonacoLanguages() {
  registerBatLanguage();
  registerNginxLanguage();
  registerPowerShellLanguage();
}

export const inferMonacoLanguageByFilename = (filename: string): MonacoLanguage => {
  const known = new Set(MONACO_LANGUAGES);
  const name = (filename || '').trim();
  if (!name) return 'plaintext';

  const lower = name.toLowerCase();

  if (lower === 'dockerfile' || lower.endsWith('/dockerfile')) return 'dockerfile';
  if (lower === 'nginx.conf' || lower.endsWith('.nginx.conf')) return 'nginx';

  const base = lower.split('/').pop() ?? lower;
  const dotIndex = base.lastIndexOf('.');
  const ext = dotIndex >= 0 ? base.slice(dotIndex + 1) : '';

  const extMap: Record<string, MonacoLanguage> = {
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    mts: 'typescript',
    cts: 'typescript',
    json: 'json',
    html: 'html',
    htm: 'html',
    css: 'css',
    xml: 'xml',
    md: 'markdown',
    markdown: 'markdown',
    py: 'python',
    java: 'java',
    cs: 'csharp',
    c: 'cpp',
    cc: 'cpp',
    cpp: 'cpp',
    cxx: 'cpp',
    h: 'cpp',
    hh: 'cpp',
    hpp: 'cpp',
    hxx: 'cpp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    sql: 'sql',
    yml: 'yaml',
    yaml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    conf: 'ini',
    cfg: 'ini',
    dockerfile: 'dockerfile',
    bat: 'bat',
    cmd: 'bat',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    ps1: 'powershell',
    psm1: 'powershell',
    psd1: 'powershell',
    lua: 'lua',
    pl: 'perl',
    r: 'r',
    scala: 'scala',
    swift: 'swift'
  };

  const language = ext ? extMap[ext] : undefined;
  if (!language) return 'plaintext';
  return known.has(language) ? language : 'plaintext';
};
