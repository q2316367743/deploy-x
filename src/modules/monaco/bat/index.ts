import * as monaco from 'monaco-editor';

export const batLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '::'
  },
  brackets: [
    ['(', ')'],
    ['[', ']'],
    ['{', '}']
  ],
  autoClosingPairs: [
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '{', close: '}', notIn: ['string', 'comment'] }
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' }
  ]
};

export const batKeywords = [
  'if',
  'else',
  'not',
  'exist',
  'defined',
  'errorlevel',
  'equ',
  'neq',
  'lss',
  'leq',
  'gtr',
  'geq',
  'for',
  'in',
  'do',
  'set',
  'setlocal',
  'endlocal',
  'call',
  'goto',
  'exit',
  'shift',
  'choice',
  'start',
  'pushd',
  'popd',
  'cd',
  'chdir',
  'dir',
  'copy',
  'move',
  'del',
  'erase',
  'ren',
  'rename',
  'md',
  'mkdir',
  'rd',
  'rmdir',
  'type',
  'cls',
  'pause',
  'echo',
  'title',
  'color',
  'prompt',
  'rem',
  'ver'
];

export const batCommands = [
  'attrib',
  'assoc',
  'bcdedit',
  'bitsadmin',
  'cacls',
  'certutil',
  'chcp',
  'chkdsk',
  'chkntfs',
  'cipher',
  'comp',
  'compact',
  'convert',
  'diskpart',
  'driverquery',
  'fc',
  'find',
  'findstr',
  'fltmc',
  'fsutil',
  'gpupdate',
  'hostname',
  'icacls',
  'ipconfig',
  'lodctr',
  'logman',
  'mklink',
  'more',
  'net',
  'netsh',
  'nslookup',
  'pathping',
  'ping',
  'powercfg',
  'qwinsta',
  'query',
  'reg',
  'robocopy',
  'route',
  'sc',
  'schtasks',
  'setx',
  'shutdown',
  'sort',
  'subst',
  'systeminfo',
  'taskkill',
  'tasklist',
  'timeout',
  'tracert',
  'tree',
  'typeperf',
  'verifier',
  'wevtutil',
  'whoami',
  'wmic'
];

export const batVariables = [
  '%0',
  '%1',
  '%2',
  '%3',
  '%4',
  '%5',
  '%6',
  '%7',
  '%8',
  '%9',
  '%*',
  '%%a',
  '%%b',
  '%%c',
  '%%d',
  '%%e',
  '%%f',
  '%%g',
  '%%h',
  '%%i',
  '%%j',
  '%%k',
  '%%l',
  '%%m',
  '%%n',
  '%%o',
  '%%p',
  '%%q',
  '%%r',
  '%%s',
  '%%t',
  '%%u',
  '%%v',
  '%%w',
  '%%x',
  '%%y',
  '%%z'
];

export const batLanguageDefinition: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  tokenizer: {
    root: [
      [/^\s*::.*$/, 'comment'],
      [/^\s*rem\b.*$/, 'comment'],

      [/^\s*:[^\s]+.*$/, 'type.identifier'],

      [/"([^"\\]|\\.)*"/, 'string'],

      [/!([a-zA-Z_][\w]*)!/, 'variable'],
      [/%(?:[a-zA-Z_][\w]*|[0-9]|\*|~[fdpnxatz]|~[0-9]+|~[0-9]+,[0-9]+)%/, 'variable'],
      [/%%[a-zA-Z]/, 'variable'],

      [/\b(?:if|else|not|exist|defined|errorlevel|equ|neq|lss|leq|gtr|geq|for|in|do|set|setlocal|endlocal|call|goto|exit|shift|choice|start|pushd|popd|cd|chdir|dir|copy|move|del|erase|ren|rename|md|mkdir|rd|rmdir|type|cls|pause|echo|title|color|prompt|rem|ver)\b/, 'keyword'],

      [/\b(?:attrib|assoc|bcdedit|bitsadmin|cacls|certutil|chcp|chkdsk|chkntfs|cipher|comp|compact|convert|diskpart|driverquery|fc|find|findstr|fltmc|fsutil|gpupdate|hostname|icacls|ipconfig|lodctr|logman|mklink|more|net|netsh|nslookup|pathping|ping|powercfg|qwinsta|query|reg|robocopy|route|sc|schtasks|setx|shutdown|sort|subst|systeminfo|taskkill|tasklist|timeout|tracert|tree|typeperf|verifier|wevtutil|whoami|wmic)\b/, 'type.identifier'],

      [/\b\d+\b/, 'number'],

      [/[&|<>]+/, 'operator'],

      [/[a-zA-Z_][\w-]*/, 'identifier']
    ]
  }
};

function ensureBatLanguageRegistered() {
  const exists = monaco.languages.getLanguages().some(lang => lang.id === 'bat');
  if (!exists) {
    monaco.languages.register({ id: 'bat' });
  }
}

export function registerBatLanguage() {
  ensureBatLanguageRegistered();
  monaco.languages.setLanguageConfiguration('bat', batLanguageConfiguration);
  monaco.languages.setMonarchTokensProvider('bat', batLanguageDefinition);

  monaco.languages.registerCompletionItemProvider('bat', {
    triggerCharacters: ['%', '!', ':'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

      const keywordSuggestions: monaco.languages.CompletionItem[] = batKeywords.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: label,
        range
      }));

      const commandSuggestions: monaco.languages.CompletionItem[] = batCommands.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: label,
        range
      }));

      const variableSuggestions: monaco.languages.CompletionItem[] = batVariables.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: label,
        range
      }));

      const snippetSuggestions: monaco.languages.CompletionItem[] = [
        {
          label: 'setlocal enabledelayedexpansion',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'setlocal EnableDelayedExpansion',
          range
        },
        {
          label: 'if exist',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if exist "${1:path}" (\r\n  $0\r\n)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'for /f',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'for /f "tokens=*" %%A in (${1:\'${2:command}\'} ) do (\r\n  $0\r\n)',
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
