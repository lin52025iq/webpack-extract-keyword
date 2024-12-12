declare module 'webpack-extract-keyword' {
    export interface ExtractKeywordPluginOptions {
        /**
         * Whether the plugin is disabled
         * @default false
         */
        disabled?: boolean;
        /**
         * The output file path
         * @default 'output.json'
         */
        outputFile?: string;
        /**
         * The directories or path to include.
         * @default ['src']
         */
        include?: string[];
        /**
         * The regular expression to extract keywords
         * @default /[\u4e00-\u9fff]+/g
         */
        extractRegex?: RegExp;
    }

    export class ExtractKeywordPlugin {
        constructor(options?: ExtractKeywordPluginOptions);
    }
}
