import axios from 'axios'

// Feature flags
export const AI_ENABLED = true // AI now enabled with Emergent LLM key

// Vite-safe env resolution (no direct process reference)
const ENV = (typeof import.meta !== 'undefined' ? import.meta.env : {}) || {}
const BASE = String(ENV.VITE_BACKEND_URL || ENV.REACT_APP_BACKEND_URL || 'http://localhost:8002').replace(/\/$/, '')

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Helpers always prefix /api
export const get = (path, config) => api.get(`/api${path}`, config)
export const post = (path, data, config) => api.post(`/api${path}`, data, config)