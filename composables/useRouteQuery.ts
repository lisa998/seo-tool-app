import {useRoute, useRouter, watch} from "@nuxtjs/composition-api";

export default function (query: Record<string, any>) {
    const route = useRoute()
    const router = useRouter()

    const defaultQuery = route.value.query as Record<string, string>

    watch(query, (newQuery: Record<string, any>) => {
        router.replace({query: newQuery})
    },)

    return {defaultQuery}
}