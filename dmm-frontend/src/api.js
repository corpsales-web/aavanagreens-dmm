import axios from 'axios'

// Feature flags
export const AI_ENABLED = false // Soft-disable AI until LLM balance is topped up

// Vite-safe env resolution (no direct process reference)
const ENV = (typeof import.meta !== 'undefined' ? import.meta.env : {}) || {}
const BASE = String(ENV.REACT_APP_BACKEND_URL || '').replace(/\/$/, '')

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Helpers always prefix /api
export const get = (path, config) => api.get(`/api${path}`, config)
export const post = (path, data, config) => api.post(`/api${path}`, data, config)