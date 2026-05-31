import { ref, watch } from 'vue'

const THEME_KEY = 'iching-theme'
const theme = ref(localStorage.getItem(THEME_KEY) || 'light')

export function useTheme() {
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(THEME_KEY, t)
    theme.value = t
  }

  function toggleTheme() {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(next)
  }

  // 初始化时应用
  applyTheme(theme.value)

  return { theme, toggleTheme, applyTheme }
}
