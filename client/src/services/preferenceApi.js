import { request } from './http.js'

const getPreferences = () => request('/preferences')

const createPreference = (preference) =>
  request('/create/preference', { method: 'POST', body: preference })

const deletePreference = (id) =>
  request(`/delete/preference/${id}`, { method: 'DELETE' })

export default {
  getPreferences,
  createPreference,
  deletePreference,
}
