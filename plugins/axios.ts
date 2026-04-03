import {Notification} from 'element-ui'
import {AxiosError} from 'axios';
import {Context} from "@nuxt/types";

export default function ({$axios}: Context) {
    $axios.onError((error: AxiosError) => {
        if (process.client) {
            Notification.error({
                title: '請求失敗',
                message: error.response?.data?.message || error.message || '未知錯誤',
            })
        }
    })

    $axios.onRequest((config) => {
        config.headers.common.Authorization = `Bearer test-token-12345`
    })
}
