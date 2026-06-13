<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import Icon from './Icon.vue'

interface Option {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    value: string
    options: (string | Option)[]
    widthClass?: string
    menuWidth?: string
  }>(),
  { widthClass: 'w-full', menuWidth: 'w-full min-w-[12rem]' },
)

const emit = defineEmits<{ change: [value: string] }>()

const opts = computed<Option[]>(() =>
  props.options.map((o) =>
    typeof o === 'object' ? o : { value: o, label: String(o) },
  ),
)
const cur = computed(
  () =>
    opts.value.find((o) => String(o.value) === String(props.value)) ||
    opts.value[0],
)

function pick(value: string, e: MouseEvent) {
  emit('change', value)
  ;(e.currentTarget as HTMLElement).blur()
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur()
}
</script>

<template>
  <div :class="cn('dropdown', widthClass)">
    <div
      tabindex="0"
      role="button"
      class="h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] flex items-center justify-between gap-2 cursor-pointer hover:border-base-content/25 transition-colors"
    >
      <span class="truncate">{{ cur?.label }}</span>
      <Icon
        name="chevron-down"
        :size="16"
        class="text-base-content/40 shrink-0"
      />
    </div>
    <ul
      tabindex="0"
      :class="
        cn(
          'dropdown-content menu menu-sm z-[70] mt-1 p-1.5 bg-base-100 rounded-xl shadow-xl border border-base-content/10 max-h-72 overflow-auto flex-nowrap',
          menuWidth,
        )
      "
    >
      <li v-for="o in opts" :key="o.value">
        <a
          class="rounded-lg flex items-center gap-2"
          :style="
            String(o.value) === String(value)
              ? {
                  background:
                    'color-mix(in oklab, var(--accent) 14%, transparent)',
                  color: 'var(--accent)',
                }
              : undefined
          "
          @click="pick(o.value, $event)"
        >
          <span class="flex-1 truncate">{{ o.label }}</span>
          <Icon
            v-if="String(o.value) === String(value)"
            name="check"
            :size="15"
          />
        </a>
      </li>
    </ul>
  </div>
</template>
