const fs = require('fs')
const path = require('path')

const PluginName = 'ExtractKeywordPlugin'

class ExtractKeywordPlugin {
    /**
     * @param {Object} options
     * @param {boolean} [options.disabled = false]
     * @param {string} [options.outputFile = 'output.json']
     * @param {string[]} [options.include = ['src']]
     * @param {RegExp} [options.extractRegex = /[\u4e00-\u9fff]+/g]
     */
    constructor(options = {}) {
        this.disabled = options?.disabled ?? false
        this.outputFile = options?.outputFile ?? 'output.json'
        this.include = options?.include ?? ['src']
        this.extractRegex = options?.extractRegex ?? /[\u4e00-\u9fff]+/g
        this.characterMap = {}
    }

    apply(compiler) {
        if (this.disabled) return
        compiler.hooks.normalModuleFactory.tap(PluginName, factory => {
            factory.hooks.parser.for('javascript/auto').tap(PluginName, parser => {
                parser.hooks.program.tap(PluginName, ast => {
                    const resourcePath = parser.state.module.resource
                    const normalizedPath = path.normalize(resourcePath) // 规范化路径
                    const relativePath = path.relative(path.resolve('.'), normalizedPath) // 获取相对路径

                    if (this.matchInclude(relativePath)) {
                        this.updateCharacterMap(relativePath, null, true)
                        this.traverseAST(ast, relativePath)
                    }
                })
            })
        })

        compiler.hooks.done.tapPromise(PluginName, async () => {
            fs.writeFileSync(this.outputFile, this.createJSONContent(), 'utf8')
        })
    }

    matchInclude(relativePath) {
        return this.include.some(path => relativePath.startsWith(path))
    }

    traverseAST(node, currentFile) {
        if (!node || node.type === 'Line' || node.type === 'Block') {
            return
        }

        if (typeof node.value === 'string') {
            const str = node.value
            const extractRegex = this.extractRegex
            let match
            while ((match = extractRegex.exec(str)) !== null) {
                this.updateCharacterMap(currentFile, match[0])
            }
        }

        Object.keys(node).forEach(key => {
            const child = node[key]
            if (Array.isArray(child)) {
                child.forEach(childNode => this.traverseAST(childNode, currentFile))
            } else if (child !== null && typeof child === 'object') {
                this.traverseAST(child, currentFile)
            }
        })
    }

    updateCharacterMap(filePath, character, clean = false) {
        if (clean) {
            delete this.characterMap[filePath]
        } else {
            if (Array.isArray(this.characterMap[filePath])) {
                this.characterMap[filePath].push(character)
            } else {
                this.characterMap[filePath] = [character]
            }
        }
    }

    createJSONContent() {
        const result = {}

        Object.entries(this.characterMap).forEach(([key, value]) => {
            if (!Array.isArray(value) || !value.length) return

            let parts = key.split(/[\/\?]/)
            let currentLevel = result

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    if (!currentLevel[part]) {
                        currentLevel[part] = value
                    } else {
                        currentLevel[part] = [...currentLevel[part], ...value]
                    }
                } else {
                    if (!currentLevel[part]) {
                        currentLevel[part] = {}
                    }
                    currentLevel = currentLevel[part]
                }
            })
        })

        const buildSortedObject = characterMap => {
            return Object.keys(characterMap)
                .sort()
                .reduce((sortedObj, key) => {
                    const value = characterMap[key]
                    if (Array.isArray(value) && value.length) {
                        sortedObj[key] = Array.isArray(sortedObj[key]) ? [...sortedObj[key], ...value] : value
                    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        sortedObj[key] = buildSortedObject(value)
                    } else {
                        sortedObj[key] = value
                    }
                    return sortedObj
                }, {})
        }

        return JSON.stringify(buildSortedObject(result), null, 2)
    }
}

module.exports = ExtractKeywordPlugin
