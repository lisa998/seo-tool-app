<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { NotificationRulesFormType } from '~/pages/rank-tracker/types';

const props = defineProps<{
  dialogVisible: boolean;
}>();
const emit = defineEmits(['cancel', 'submit']);

const formRef = ref();

const form = reactive<NotificationRulesFormType>({
  ruleName: '',
  triggerCondition: '',
  threshold: null,
  notifyChannels: [],
  enabled: true,
});

const triggerOptions = [
  { label: '排名下降超過 N 名', value: 'rank_drop', hasThreshold: true },
  { label: '關鍵字新進榜', value: 'new_entry', hasThreshold: false },
  { label: '掉出 Top 10', value: 'out_top10', hasThreshold: false },
  { label: '進入 Top 3', value: 'enter_top3', hasThreshold: false },
];

const selectedTrigger = computed(() => triggerOptions.find((o) => o.value === form.triggerCondition));

const showThreshold = computed(() => selectedTrigger.value?.hasThreshold);

watch(showThreshold, (val) => {
  if (!val) {
    form.threshold = null;
    formRef.value?.clearValidate('threshold');
  }
});

const rules = computed(() => ({
  ruleName: [{ required: true, message: '請輸入規則名稱', trigger: 'blur' }],
  triggerCondition: [{ required: true, message: '請選擇觸發條件', trigger: 'change' }],
  ...(showThreshold.value ? { threshold: [{ required: true, message: '請輸入門檻值', trigger: 'change' }] } : {}),
  notifyChannels: [
    {
      type: 'array',
      required: true,
      min: 1,
      message: '請至少選擇一種通知方式',
      trigger: 'change',
    },
  ],
}));

const resetForm = async () => {
  form.ruleName = '';
  form.triggerCondition = '';
  form.threshold = null;
  form.notifyChannels = [];
  form.enabled = true;
  await nextTick();
  formRef.value?.clearValidate();
};

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    emit('submit', { ...form });
    resetForm();
  });
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<template>
  <el-dialog :before-close="handleCancel" :visible.sync="dialogVisible" width="30%">
    <div class="bg-white w-full max-w-lg">
      <div class="flex items-center gap-2 mb-6">
        <i class="el-icon-bell text-primary text-lg" />
        <h2 class="text-text font-semibold text-base m-0">新增通知規則</h2>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
        class="space-y-1"
        label-position="top"
      >
        <el-form-item label="規則名稱" prop="ruleName" required>
          <el-input v-model="form.ruleName" clearable placeholder="例如：排名大幅下降通知" />
        </el-form-item>

        <el-form-item label="觸發條件" prop="triggerCondition" required>
          <el-select v-model="form.triggerCondition" class="w-full" placeholder="請選擇觸發條件">
            <el-option v-for="opt in triggerOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <transition name="fade">
          <el-form-item v-if="showThreshold" label="門檻值" prop="threshold">
            <el-input-number
              v-model="form.threshold"
              :max="100"
              :min="1"
              class="w-full"
              controls-position="right"
              placeholder="例如：5"
            />
            <p class="text-text-muted text-xs mt-1">排名下降超過此名次時觸發通知</p>
          </el-form-item>
        </transition>

        <el-form-item label="通知方式" prop="notifyChannels" required>
          <el-checkbox-group v-model="form.notifyChannels" class="flex gap-4">
            <el-checkbox label="email">
              <span class="flex items-center gap-1">
                <i class="el-icon-message text-text-secondary" />
                Email
              </span>
            </el-checkbox>
            <el-checkbox label="slack">
              <span class="flex items-center gap-1">
                <i class="el-icon-chat-dot-round text-text-secondary" />
                Slack
              </span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="啟用規則">
          <div class="flex items-center gap-3">
            <el-switch v-model="form.enabled" active-color="#A48677" inactive-color="#CDC3BC" />
            <span :class="form.enabled ? 'text-primary' : 'text-text-muted'" class="text-sm">
              {{ form.enabled ? '已啟用' : '已停用' }}
            </span>
          </div>
        </el-form-item>
      </el-form>

      <div class="border-t border-divider-soft my-5" />

      <div class="flex justify-end gap-3">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">建立規則</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1f1918;
  padding-bottom: 4px;
}

:deep(.el-input__inner),
:deep(.el-input-number .el-input__inner) {
  border-color: #cdc3bc;
}

:deep(.el-input__inner:focus),
:deep(.el-input-number .el-input__inner:focus) {
  border-color: #a48677;
}

:deep(.el-select .el-input__inner:focus) {
  border-color: #a48677;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #a48677;
  border-color: #a48677;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #a48677;
}

:deep(.el-button--primary) {
  background-color: #a48677;
  border-color: #a48677;
}

:deep(.el-button--primary:hover) {
  background-color: #8f6e61;
  border-color: #8f6e61;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
