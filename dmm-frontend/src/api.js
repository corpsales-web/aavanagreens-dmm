import axios from 'axios'

const BASE = (import.meta?.env?.REACT_APP_BACKEND_URL || process?.env?.REACT_APP_BACKEND_URL || '').replace(/\/$/, '')

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Helpers always prefix /api
export const get = (path, config) => api.get(`/api${path}`, config)
export const post = (path, data, config) => api.post(`/api${path}`, data, config)