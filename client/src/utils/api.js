const BASE_CONFIG = {
  credentials: 'include',
}

function buildQueryString(params) {
  const query = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value)
      }
    })
  }
  const str = query.toString()
  return str ? `?${str}` : ''
}

async function request(url, options = {}) {
  const res = await fetch(url, { ...BASE_CONFIG, ...options })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const err = new Error(errorData.message || errorData.error || `Request failed: ${res.status}`)
    err.status = res.status
    err.data = errorData
    throw err
  }
  return res.json()
}

// Issues
export function getIssues(filters) {
  return request(`/api/issues${buildQueryString(filters)}`)
}

export function getIssue(id) {
  return request(`/api/issues/${id}`)
}

export function createIssue(formData) {
  return request('/api/issues', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — browser will set multipart boundary
  })
}

export function submitResolution(id, formData) {
  return request(`/api/issues/${id}/resolve`, {
    method: 'POST',
    body: formData,
  })
}

export function updateIssueStatus(id, status) {
  return request(`/api/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

// Votes
export function castVote(issueId, value) {
  return request(`/api/votes/${issueId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
}

export function getVotes(issueId) {
  return request(`/api/votes/${issueId}`)
}

// Dashboard
export function getDashboardStats() {
  return request('/api/dashboard/stats')
}

export function getDashboardByCategory() {
  return request('/api/dashboard/by-category')
}

export function getDashboardByStatus() {
  return request('/api/dashboard/by-status')
}
