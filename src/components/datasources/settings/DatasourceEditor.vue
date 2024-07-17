
<template>
  <div id="monaco-editor" :ref="reference" :width="width" :height="height" />
</template>

<script>
import * as monaco from 'monaco-editor'
import SQL_KEYWORDS from './sqlKeywords.js'

const { format } = require('sql-formatter')

export default {
  name: 'MonacoEditor',
  components: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    types: {
      type: String,
      default: 'sql'
    },
    reference: {
      type: String,
      default: 'monacoEditor'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '200px'
    },
    name: {
      type: String,
      default: 'test'
    },
    editorOptions: {
      type: Object,
      default: function () {
        return {
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          writeOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          glyphMargin: true,
          useTabStops: false,
          fontSize: 18,
          autoIndent: true,
          autoIndex: true,
          tabCompletion: 'on',
          cursorSmoothCaretAnimation: true,
          formatOnPaste: true,
          mouseWheelZoom: true,
          folding: true,
          autoClosingBrackets: 'always',
          autoClosingOvertype: 'always',
          autoClosingQuotes: 'always'
        }
      }
    },
    codes: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      monaco: monaco,
      editor: null,
      isSave: true,
      codeValue: null,
      codesCopy: null,
      formatProvider: null,
      suggestion: null,
      // to-do: get available tables
      databaseData: {
        a: ['group', 'area'],
        b: ['user', 'client']
      },
      // to-do: get available fields for each table
      tableData: {
        user: ['age', 'gender'],
        group: ['id', 'name']
      }
    }
  },
  watch: {
    codes: function (newValue) {
      console.debug('Code editor: content change')
      if (this.editor) {
        if (newValue !== this.editor.getValue()) {
          this.editor.setValue(newValue)
          this.editor.trigger(this.editor.getValue(), 'editor.action.formatDocument')
        }
      }
    },
    visible: function (status) {
      console.log('Drawer is visible?', status)
    }
  },
  methods: {
    // INIT MAIN EDITOR
    initEditor () {
      const self = this
      const editorRef = self.$refs[self.reference] || self.$refs.monacoEditor
      if (!this.editor) {
        this.editor = monaco.editor.create(editorRef, {
          value: self.codeValue || self.codes,
          language: self.types,
          theme: 'vs-light',
          minimap: { enabled: false },
          editorOptions: self.editorOptions,
          width: self.width,
          height: self.height
        })
        self.editor.onDidChangeModelContent(function (event) {
          self.codesCopy = self.editor.getValue()
          // self.$emit('onCodeChange', self.editor.getValue(), event)
          // self.$emit('change', self.editor.getValue(), event)
          self.$emit('action:update', self.editor.getValue(), false)
        })

        self.editor.getModel().onDidChangeContent(() => {
          console.log('content changed to', monaco.editor.getModels()[0].getValue(), ' ,or: ', self.editor.getValue())
          self.codesCopy = self.editor.getValue()
          self.$emit('action:update', self.editor.getValue(), false)
        })
        // formatProvider
        this.formatProvider = monaco.languages.registerDocumentFormattingEditProvider('sql', {
          provideDocumentFormattingEdits (model) {
            return [{
              text: self.formatSql(1),
              range: model.getFullModelRange()
            }]
          }
        })
        // SUGGESTIONS
        if (this.suggestion) this.suggestion.dispose()
        this.suggestion = monaco.languages.registerCompletionItemProvider('sql', {
          triggerCharacters: ['.', ' '],
          provideCompletionItems: (model, position) => {
            let suggestions = []
            const { lineNumber, column } = position
            const textBeforePointer = model.getValueInRange({
              startLineNumber: lineNumber,
              startColumn: 0,
              endLineNumber: lineNumber,
              endColumn: column
            })
            const tokens = textBeforePointer.toLocaleLowerCase().trim().split(/\s+/)
            const lastToken = tokens[tokens.length - 1]
            if (lastToken.endsWith('.')) {
              const tokenNoDot = lastToken.slice(0, lastToken.length - 1)
              if (Object.keys(this.databaseData).includes(tokenNoDot)) {
                suggestions = [...this.getTableSuggest(tokenNoDot)]
              }
            } else if (lastToken === '.') {
              suggestions = []
            } else if (textBeforePointer.endsWith(' ')) {
              if (textBeforePointer.endsWith('select * from ')) {
                // select * from
                suggestions = this.getTableSuggest(this.database)
              } else if (lastToken === 'where') {
                const lastToken2 = tokens[tokens.length - 2]
                const lastToken3 = tokens[tokens.length - 3]
                const lastToken4 = tokens[tokens.length - 4]
                const lastToken5 = tokens[tokens.length - 5]
                if (lastToken5 + lastToken4 + lastToken3 === 'select*from') {
                  // select * from tableName where
                  suggestions = [...this.getParamSuggest(lastToken2)]
                } else {
                  suggestions = []
                }
              } else {
                suggestions = []
              }
            } else {
              suggestions = [...this.getDBSuggest(), ...this.getSQLSuggest()]
            }
            return {
              suggestions
            }
          }
        })

        // EDITOR SQL COLOR CONFIGURATION
        let reg = '/'
        SQL_KEYWORDS.forEach((keyword) => {
          reg += `${keyword}|`
        })
        reg += '/'
        this.color = monaco.languages.setMonarchTokensProvider('sql', {
          ignoreCase: true,
          tokenizer: {
            root: [
              [
                reg,
                { token: 'keyword' }
              ],
              [
                /[+]|[-]|[*]|[/]|[%]|[>]|[<]|[=]|[!]|[:]|[&&]|[||]/,
                { token: 'string' }
              ],
              [/'.*?'|".*?"/, { token: 'string.escape' }],
              [/#--.*?--#/, { token: 'comment' }],
              [/null/, { token: 'regexp' }],
              [/[{]|[}]/, { token: 'type' }],
              [/[\u4e00-\u9fa5]/, { token: 'predefined' }],
              [/''/, { token: 'invalid' }],
              [/[\u4e00-\u9fa5]/, { token: 'number.binary' }],
              [/(?!.*[a-zA-Z])[0-9]/, { token: 'number.hex' }],
              [/[(]|[)]/, { token: 'number.octal' }],
              [/[\u4e00-\u9fa5]/, { token: 'number.float' }]
            ]
          }
        })
      } else {
        // if exist clear mistakes and suggestions and formats
        this.clearMistake()
        this.suggestion.dispose()
        this.formatProvider.dispose()
      }
    },
    // FORMAT SQL EDITOR
    formatSql (needValue) {
      this.clearMistake()
      try {
        this.setValue(format((this.editor).getValue()))
      } catch (e) {
        const { message } = e
        const list = message.split(' ')
        const line = list.indexOf('line')
        const column = list.indexOf('column')
        this.markMistake({
          startLineNumber: Number(list[line + 1]),
          endLineNumber: Number(list[line + 1]),
          startColumn: Number(list[column + 1]),
          endColumn: Number(list[column + 1])
        }, 'Error', message)
      }
      if (needValue) {
        return this.editor.getValue()
      }
    },
    markMistake (range, type, message) {
      const { startLineNumber, endLineNumber, startColumn, endColumn } = range
      monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'eslint',
        [{
          startLineNumber,
          endLineNumber,
          startColumn,
          endColumn,
          severity: monaco.MarkerSeverity[type],
          message
        }]
      )
    },
    clearMistake () {
      monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'eslint',
        []
      )
    },
    getSQLSuggest () {
      const sqlKeywords = SQL_KEYWORDS
      return sqlKeywords.map((key) => ({
        label: key,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: key,
        detail: 'keyword'
      }))
    },
    getTableSuggest (dbName) {
      const tableNames = this.databaseData[dbName]
      if (!tableNames) {
        return []
      }
      return tableNames.map((name) => ({
        label: name,
        kind: monaco.languages.CompletionItemKind.Constant,
        insertText: name,
        detail: dbName
      }))
    },
    getParamSuggest (tableName) {
      const params = this.tableData[tableName]
      if (!params) {
        return []
      }
      return params.map((name) => ({
        label: name,
        kind: monaco.languages.CompletionItemKind.Constant,
        insertText: name,
        detail: 'param'
      }))
    },
    getDBSuggest () {
      return Object.keys(this.databaseData).map((key) => ({
        label: key,
        kind: monaco.languages.CompletionItemKind.Enum,
        insertText: key,
        detail: 'database'
      }))
    },
    // get Value from Editor
    getValue () {
      return this.editor.getValue()
    },
    // set value from Editor
    setValue (content) {
      this.editor.setValue(content)
    },
    findAndReplaceLimit (currentLimit, newLimit) {
      // const lineCount = this.editor.getModel()?.getLineCount()
      const fullRange = this.editor.getModel().getFullModelRange()
      const limitRange = new this.monaco.Range(fullRange.endLineNumber - 1, 1, fullRange.endLineNumber, fullRange.endColumn)
      this.editor.executeEdits(currentLimit, [{
        range: limitRange,
        text: newLimit
      }])
    },
    // remove and reinit editor for the next time.
    disposeEditor () {
      if (this.editor) {
        console.log('Dispose Monaco Editor...')
        this.clearMistake()
        this.color.dispose()
        this.suggestion.dispose()
        this.formatProvider.dispose()
        this.editor.dispose()
      }
    }
  },
  mounted () {
    if (!this.editor) {
      this.initEditor()
    }
  },
  unmount () {
    if (this.editor) {
      console.log('Dispose Monaco Editor...')
      this.clearMistake()
      this.color.dispose()
      this.suggestion.dispose()
      this.formatProvider.dispose()
      this.editor.dispose()
    }
  }
}
</script>

<style scoped>
#monaco-editor {
  display: flex;
  width: 100%;
  height: 400px;
  resize: vertical;
  overflow: auto;
}
</style>
