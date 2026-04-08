import { isReactive, isRef, Ref, useRoute, useRouter, watch } from '@nuxtjs/composition-api';

type Query = Record<string, any>;
type QuerySource = Ref<Query> | Query;

export default function (query: QuerySource) {
  if (!isRef(query) && !isReactive(query)) {
    console.error('query needs reactive');
    return { defaultQuery: {} };
  }
  const route = useRoute();
  const router = useRouter();

  const defaultQuery = route.value.query as Record<string, string>;

  watch(query, (newQuery: Record<string, any>) => {
    router.replace({ query: newQuery });
  });

  return { defaultQuery };
}
