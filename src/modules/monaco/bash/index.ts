import * as monaco from 'monaco-editor';

export const shLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '#'
  },
  brackets: [
    ['(', ')'],
    ['[', ']'],
    ['{', '}']
  ],
  autoClosingPairs: [
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
    { open: '`', close: '`', notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '{', close: '}', notIn: ['string', 'comment'] }
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' },
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' }
  ],
  folding: {
    markers: {
      start: /^\s*#\s*region\b/,
      end: /^\s*#\s*endregion\b/
    }
  }
};

export const shKeywords = [
  'if',
  'then',
  'else',
  'elif',
  'fi',
  'case',
  'esac',
  'for',
  'while',
  'until',
  'do',
  'done',
  'in',
  'function',
  'return',
  'exit',
  'break',
  'continue',
  'shift',
  'source',
  'export',
  'readonly',
  'local',
  'declare',
  'typeset',
  'unset',
  'let',
  'eval',
  'exec',
  'command',
  'builtin',
  'type',
  'hash',
  'alias',
  'unalias',
  'set',
  'shopt',
  'trap',
  'wait',
  'test',
  'true',
  'false',
  'read',
  'echo',
  'printf',
  'getopts'
];

export const shCommands = [
  'ls',
  'cd',
  'pwd',
  'mkdir',
  'rmdir',
  'rm',
  'cp',
  'mv',
  'cat',
  'tac',
  'head',
  'tail',
  'less',
  'more',
  'grep',
  'find',
  'xargs',
  'sed',
  'awk',
  'cut',
  'sort',
  'uniq',
  'wc',
  'tr',
  'tee',
  'touch',
  'chmod',
  'chown',
  'chgrp',
  'ln',
  'tar',
  'gzip',
  'gunzip',
  'zip',
  'unzip',
  'curl',
  'wget',
  'ssh',
  'scp',
  'rsync',
  'ps',
  'top',
  'htop',
  'kill',
  'killall',
  'pkill',
  'nohup',
  'bg',
  'fg',
  'jobs',
  'su',
  'sudo',
  'whoami',
  'id',
  'groups',
  'passwd',
  'df',
  'du',
  'free',
  'mount',
  'umount',
  'netstat',
  'ss',
  'ping',
  'ifconfig',
  'ip',
  'iptables',
  'systemctl',
  'service',
  'journalctl',
  'crontab',
  'at',
  'date',
  'cal',
  'sleep',
  'watch',
  'man',
  'help',
  'history',
  'which',
  'whereis',
  'whatis',
  'env',
  'printenv',
  'diff',
  'patch',
  'git',
  'docker',
  'kubectl',
  'helm',
  'npm',
  'yarn',
  'pip',
  'python',
  'node',
  'java',
  'make',
  'cmake',
  'gcc',
  'g++',
  'go',
  'rustc',
  'cargo'
];

export const shVariables = [
  '$0',
  '$1',
  '$2',
  '$3',
  '$4',
  '$5',
  '$6',
  '$7',
  '$8',
  '$9',
  '$#',
  '$@',
  '$*',
  '$?',
  '$$',
  '$!',
  '$_',
  '$BASH',
  '$BASH_VERSION',
  '$HOME',
  '$PATH',
  '$SHELL',
  '$USER',
  '$UID',
  '$PWD',
  '$OLDPWD',
  '$LANG',
  '$LC_ALL',
  '$TERM',
  '$HOSTNAME',
  '$RANDOM',
  '$LINENO',
  '$SECONDS',
  '$SHLVL',
  '$IFS',
  '$PS1',
  '$PS2',
  '$PIPESTATUS',
  '$GROUPS',
  '$HISTFILE',
  '$HISTSIZE',
  '$MAIL',
  '$OSTYPE'
];

export const shLanguageDefinition: monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: false,
  tokenizer: {
    root: [
      // Comments
      [/#.*$/, 'comment'],

      // Shebang
      [/^#!.*$/, 'comment.directive'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/"([^"\\]|\\.)*"/, 'string'],
      [/'([^'\\]|\\.)*'/, 'string'],

      // Backtick command substitution
      [/`[^`]*`/, 'string.interpolated'],

      // Variable expansion
      [/\$\{[a-zA-Z_]\w*(:[-+][^}]*)?}/, 'variable'],
      [/\$\{[@*#?$!0-9_]}/, 'variable'],
      [/\$[a-zA-Z_]\w*/, 'variable'],
      [/\$[@*#?$!0-9]/, 'variable'],

      // Keywords
      [/\b(?:if|then|else|elif|fi|case|esac|for|while|until|do|done|in|function|return|exit|break|continue|shift|source|export|readonly|local|declare|typeset|unset|let|eval|exec|command|builtin|type|hash|alias|unalias|set|shopt|trap|wait|test|true|false|read|echo|printf|getopts)\b/, 'keyword'],

      // Numbers
      [/\b\d+\b/, 'number'],

      // Operators
      [/[&|<>]+/, 'operator'],
      [/[-+=!]+/, 'operator'],
      [/[{}[\]()]/, '@brackets'],

      // Identifiers
      [/[a-zA-Z_][\w-]*/, 'identifier']
    ]
  }
};

function ensureShLanguageRegistered() {
  const exists = monaco.languages.getLanguages().some(lang => lang.id === 'bash');
  if (!exists) {
    monaco.languages.register({ id: 'bash', extensions: ['.sh', '.bash', '.zsh'], aliases: ['Bash', 'sh', 'bash', 'zsh'], mimetypes: ['text/x-shellscript'] });
  }
}

export function registerShLanguage() {
  ensureShLanguageRegistered();
  monaco.languages.setLanguageConfiguration('bash', shLanguageConfiguration);
  monaco.languages.setMonarchTokensProvider('bash', shLanguageDefinition);

  monaco.languages.registerCompletionItemProvider('bash', {
    triggerCharacters: ['$', '{'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

      const keywordSuggestions: monaco.languages.CompletionItem[] = shKeywords.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: label,
        range
      }));

      const commandSuggestions: monaco.languages.CompletionItem[] = shCommands.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: label,
        range
      }));

      const variableSuggestions: monaco.languages.CompletionItem[] = shVariables.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: label,
        range
      }));

      const snippetSuggestions: monaco.languages.CompletionItem[] = [
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if [ ${1:condition} ]; then\n  $0\nfi',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'if-else',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if [ ${1:condition} ]; then\n  $2\nelse\n  $0\nfi',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'for',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'for ${1:var} in ${2:items}; do\n  $0\ndone',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'while',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'while [ ${1:condition} ]; do\n  $0\ndone',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '${1:name}() {\n  $0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'case',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'case ${1:var} in\n  ${2:pattern1}) $3 ;;\n  *) $0 ;;\nesac',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        }
      ];

      return {
        suggestions: [...keywordSuggestions, ...commandSuggestions, ...variableSuggestions, ...snippetSuggestions]
      };
    }
  });
}
