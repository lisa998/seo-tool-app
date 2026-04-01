import {computed, reactive, ref, useRoute} from "@nuxtjs/composition-api";

const linkAnalysisKeys = ['backlinks', 'referring-domains', 'anchors', 'broken-links'] as const

export type LinkAnalysisKey = typeof linkAnalysisKeys[number]

interface Query {
    [key: string]: string | number,
}

export default function () {
    const queryObject = reactive<Record<LinkAnalysisKey, Query>>(
        linkAnalysisKeys.reduce((obj, k) => {
            obj[k] = {}
            return obj
        }, {} as Record<LinkAnalysisKey, Query>)
    )
    const activeTab = ref<LinkAnalysisKey>('backlinks')
    const stringifyQuery = computed(() => {
        const api = activeTab.value
        if (!queryObject?.[api]) return ''
        const params = new URLSearchParams(
            Object.entries(queryObject[api]).map(([key, value]) => [key, String(value)])
        )
        return params.toString()
    })
    const route = useRoute()

    // 設定query 到route上，但不觸發頁面重新載入
    function updateRouteQuery() {
        const query = stringifyQuery.value
        const url = `${route.value.path}${query ? `?${query}` : ''}`
        window.history.replaceState(null, '', url)
    }


    return {queryObject, activeTab}
}