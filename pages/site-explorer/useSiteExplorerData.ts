import {computed, useContext} from "@nuxtjs/composition-api";

export default function (query: Record<string, any> = {}) {
    const {$axios} = useContext()

    const fetchOverview = async () => {
        return await $axios.$get('/api/site-explorer/overview')
    }
    fetchOverview()

    const fake = [68, 69, 70, 70, 71, 72]

    const competitiveness = computed(() => [
        {
            title: 'DR 評分',
            metrics: 95,
            sparklines: fake.map((item, index) => ({
                x: index * 10,
                y: item
            }))
        },
        {
            title: '反向連結數',
            metrics: 95,
            sparklines: fake.map((item, index) => ({
                x: index * 10,
                y: item
            }))
        },
        {
            title: '參照網域數',
            metrics: 95,
            sparklines: fake.map((item, index) => ({
                x: index * 10,
                y: item
            }))
        },
        {
            title: '自然流量',
            metrics: 95,
            sparklines: fake.map((item, index) => ({
                x: index * 10,
                y: item
            }))
        }])


    return {competitiveness}
}
