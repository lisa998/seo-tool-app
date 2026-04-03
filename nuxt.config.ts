import type {NuxtConfig} from '@nuxt/types'

const config: NuxtConfig = {
    hooks: {
        listen() {
            console.log('[MSW] listen hook fired, NODE_ENV =', process.env.NODE_ENV)
            if (process.env.NODE_ENV !== 'development') return
            try {
                // Node.js 原生不支援 require('.ts')，需要 jiti 做 runtime 轉譯
                // jiti 是 Nuxt 2 的 transitive dependency，可直接使用
                const createJiti = require('jiti')
                const jiti = createJiti(__filename)
                const {server} = jiti('./mocks/server')
                server.listen({onUnhandledRequest: 'bypass'})
                server.events.on('request:start', ({ request }: { request: Request }) => {
                    console.log('MSW intercepted:', request.method, request.url)
                });
                console.log('[MSW] Server-side Mock 已啟動 🎯')
            } catch (error) {
                console.error('[MSW] Server-side 啟動失敗:', error)
            }
        },
    },
    modules: ['@nuxtjs/axios'],
    axios: {
        baseURL: 'http://localhost:3000',
    },
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
        '~/plugins/axios',
        '~/plugins/element-ui.ts',
        {src: '~/plugins/highcharts.js', mode: 'client'},
        {src: '~/plugins/msw.client.ts', mode: 'client'},
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
            // and (2) runs babel on it so private fields, class fields, `?.` and `??` get transpiled.
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