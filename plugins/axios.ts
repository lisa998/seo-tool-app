import { Notification } from 'element-ui';
import { AxiosError } from 'axios';
import { Context } from '@nuxt/types';

export default function ({ $axios }: Context) {
  $axios.onError((error: AxiosError) => {
    if (process.client) {
      const config = error.config || {};
      Notification.error({
        title: config.errorTitle || '請求失敗',
        message: config.errorMessage || error.response?.data?.message || error.message || '未知錯誤',
      });
    }
  });

  $axios.onRequest((config) => {
    config.headers.common.Authorization = `Bearer test-token-12345`;
  });
}
