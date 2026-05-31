/**
 * 生辰档案存储
 * 使用 localStorage 持久化
 */
import { reactive, computed } from 'vue'

const STORAGE_KEY = 'iching_profiles'
const ACTIVE_KEY = 'iching_active_profile'

function loadProfiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || ''
}

function saveActiveId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_KEY)
  }
}

// 生成唯一ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const state = reactive({
  profiles: loadProfiles(),
  activeId: loadActiveId(),
})

export function useProfileStore() {
  const profiles = computed(() => state.profiles)
  const activeProfile = computed(() => state.profiles.find(p => p.id === state.activeId) || null)

  function addProfile(profile) {
    const newProfile = {
      id: genId(),
      name: profile.name,
      birthYear: profile.birthYear,
      birthMonth: profile.birthMonth,
      birthDay: profile.birthDay,
      birthHour: profile.birthHour,
      birthMinute: profile.birthMinute,
      cityName: profile.cityName || '',
      lng: profile.lng || null,
      lat: profile.lat || null,
      createdAt: Date.now(),
    }
    state.profiles.push(newProfile)
    saveProfiles(state.profiles)
    return newProfile
  }

  function updateProfile(profile) {
    const idx = state.profiles.findIndex(p => p.id === profile.id)
    if (idx >= 0) {
      state.profiles[idx] = { ...state.profiles[idx], ...profile }
      saveProfiles(state.profiles)
    }
  }

  function deleteProfile(id) {
    state.profiles = state.profiles.filter(p => p.id !== id)
    if (state.activeId === id) {
      state.activeId = state.profiles.length > 0 ? state.profiles[0].id : ''
    }
    saveProfiles(state.profiles)
    saveActiveId(state.activeId)
  }

  function setActiveProfile(id) {
    state.activeId = id
    saveActiveId(id)
  }

  function clearActiveProfile() {
    state.activeId = ''
    saveActiveId('')
  }

  return {
    profiles,
    activeProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    clearActiveProfile,
  }
}
