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
        {src: '~/plugins/highcharts.js', mode: 'client'}
    ],
    components: true,
    build: {
        transpile: ['highcharts', 'highcharts-vue']
    }
}

export default config