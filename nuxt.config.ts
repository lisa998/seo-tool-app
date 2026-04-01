import type {NuxtConfig} from '@nuxt/types'

const config: NuxtConfig = {
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/composition-api/module',
        '@nuxtjs/tailwindcss'
    ],
    css: [
        '~/assets/styles/element-variables.scss',
        '~/assets/styles/tailwind.css'
    ],
    plugins: [
        '~/plugins/element-ui.ts',
        {src: '~/plugins/highcharts.js', mode: 'client'},
        {src: '~/plugins/msw.client.ts', mode: 'client'}
    ],
    components: true,
    build: {
        loaders: {
            scss: {
                sassOptions: {
                    quietDeps: true,
                    silenceDeprecations: ['import', 'legacy-js-api'],
                },
            },
        },
        transpile: [
            'highcharts',
            'highcharts-vue',
            // String matching works on the absolute file path for .js/.cjs files
            'msw',
            '@mswjs/interceptors',
            '@open-draft/deferred-promise',
            '@open-draft/logger',
            '@faker-js/faker',
            'tough-cookie',
            'graphql',
        ],
        // Needed for .js/.cjs files that are processed by the main babel-loader
        babel: {
            plugins: [
                ['@babel/plugin-proposal-class-properties', {loose: true}],
                ['@babel/plugin-proposal-private-methods', {loose: true}],
                ['@babel/plugin-proposal-private-property-in-object', {loose: true}],
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-transform-class-static-block',
            ],
        },
        extend(config) {
            // Nuxt 2's babel-loader only matches /\.jsx?$/ — it never processes .mjs files.
            // This rule: (1) tells webpack to treat .mjs as regular JS (not a strict ES module),
            // and (2) runs babel on it so private fields, class fields, ?. and ?? get transpiled.
            config.module!.rules!.push({
                test: /\.(mjs|cjs)$/,
                include: /node_modules/,
                type: 'javascript/auto',
                use: [{
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            ['@babel/plugin-proposal-class-properties', {loose: true}],
                            ['@babel/plugin-proposal-private-methods', {loose: true}],
                            ['@babel/plugin-proposal-private-property-in-object', {loose: true}],
                            '@babel/plugin-transform-class-static-block',
                            '@babel/plugin-proposal-optional-chaining',
                            '@babel/plugin-proposal-nullish-coalescing-operator',
                        ],
                    },
                }],
            })
        },
    }
}

export default config