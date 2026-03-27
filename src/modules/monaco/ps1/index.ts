import * as monaco from 'monaco-editor';

export const powerShellLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '#',
    blockComment: ['<#', '#>']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ]
};

export const powerShellKeywords = [
  'begin',
  'break',
  'catch',
  'class',
  'continue',
  'data',
  'default',
  'do',
  'dynamicparam',
  'else',
  'elseif',
  'end',
  'enum',
  'exit',
  'filter',
  'finally',
  'for',
  'foreach',
  'from',
  'function',
  'if',
  'in',
  'param',
  'process',
  'return',
  'switch',
  'throw',
  'trap',
  'try',
  'until',
  'using',
  'var',
  'while'
];

export const powerShellOperators = [
  '-and',
  '-or',
  '-xor',
  '-not',
  '-eq',
  '-ne',
  '-gt',
  '-ge',
  '-lt',
  '-le',
  '-like',
  '-notlike',
  '-match',
  '-notmatch',
  '-contains',
  '-notcontains',
  '-in',
  '-notin',
  '-is',
  '-isnot',
  '-as',
  '-replace',
  '-split',
  '-join',
  '-f',
  '-band',
  '-bor',
  '-bxor',
  '-bnot'
];

export const powerShellConstants = ['$true', '$false', '$null'];

export const powerShellCommonCmdlets = [
  'Get-ChildItem',
  'Get-Content',
  'Set-Content',
  'Add-Content',
  'Get-Item',
  'Set-Item',
  'Copy-Item',
  'Move-Item',
  'Remove-Item',
  'New-Item',
  'Test-Path',
  'Resolve-Path',
  'Get-Location',
  'Set-Location',
  'Push-Location',
  'Pop-Location',
  'Get-Command',
  'Get-Help',
  'Get-Member',
  'Select-Object',
  'Where-Object',
  'ForEach-Object',
  'Sort-Object',
  'Group-Object',
  'Measure-Object',
  'Format-Table',
  'Format-List',
  'Out-String',
  'Out-File',
  'Write-Output',
  'Write-Host',
  'Write-Error',
  'Write-Warning',
  'Write-Verbose',
  'Write-Debug',
  'Start-Process',
  'Stop-Process',
  'Get-Process',
  'Get-Service',
  'Start-Service',
  'Stop-Service',
  'Restart-Service',
  'Invoke-Command',
  'Invoke-WebRequest',
  'Invoke-RestMethod',
  'ConvertFrom-Json',
  'ConvertTo-Json',
  'Import-Module',
  'Get-Module',
  'Set-StrictMode'
];

export const powerShellLanguageDefinition: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  tokenizer: {
    root: [
      [/^#.*$/, 'comment'],
      [/<#/, 'comment', '@comment'],

      [/[{}()[\]]/, 'delimiter.bracket'],
      [/[,;]/, 'delimiter'],

      [/"([^"\\]|\\.)*"/, 'string'],
      [/'([^'\\]|\\.)*'/, 'string'],

      [/\$(?:global:|script:|local:|private:|env:)?[a-zA-Z_][\w]*/, 'variable'],
      [/\$(?:\{[^}]+\}|[0-9]+|\?|_|\^|\$)/, 'variable'],

      [/\b(?:begin|break|catch|class|continue|data|default|do|dynamicparam|else|elseif|end|enum|exit|filter|finally|for|foreach|from|function|if|in|param|process|return|switch|throw|trap|try|until|using|var|while)\b/, 'keyword'],
      [/\b(?:-and|-or|-xor|-not|-eq|-ne|-gt|-ge|-lt|-le|-like|-notlike|-match|-notmatch|-contains|-notcontains|-in|-notin|-is|-isnot|-as|-replace|-split|-join|-f|-band|-bor|-bxor|-bnot)\b/, 'operator'],
      [/\$(?:true|false|null)\b/, 'constant'],

      [/\b[a-zA-Z][\w]*-[a-zA-Z][\w]*\b/, 'type.identifier'],

      [/\b0x[0-9a-f]+\b/, 'number'],
      [/\b\d+(?:\.\d+)?\b/, 'number'],

      [/[a-zA-Z_][\w]*/, 'identifier']
    ],
    comment: [
      [/#>/, 'comment', '@pop'],
      [/./, 'comment']
    ]
  }
};

function ensurePowerShellLanguageRegistered() {
  const exists = monaco.languages.getLanguages().some(lang => lang.id === 'powershell');
  if (!exists) {
    monaco.languages.register({ id: 'powershell' });
  }
}

export function registerPowerShellLanguage() {
  ensurePowerShellLanguageRegistered();
  monaco.languages.setLanguageConfiguration('powershell', powerShellLanguageConfiguration);
  monaco.languages.setMonarchTokensProvider('powershell', powerShellLanguageDefinition);

  monaco.languages.registerCompletionItemProvider('powershell', {
    triggerCharacters: ['-', '$', ':'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

      const keywordSuggestions: monaco.languages.CompletionItem[] = powerShellKeywords.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: label,
        range
      }));

      const operatorSuggestions: monaco.languages.CompletionItem[] = powerShellOperators.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Operator,
        insertText: label,
        range
      }));

      const constantSuggestions: monaco.languages.CompletionItem[] = powerShellConstants.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Constant,
        insertText: label,
        range
      }));

      const cmdletSuggestions: monaco.languages.CompletionItem[] = powerShellCommonCmdlets.map(label => ({
        label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: label,
        range
      }));

      return {
        suggestions: [...keywordSuggestions, ...operatorSuggestions, ...constantSuggestions, ...cmdletSuggestions]
      };
    }
  });
}
