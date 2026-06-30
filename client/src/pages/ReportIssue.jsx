import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { createIssue, getIssues, castVote } from '../utils/api.js'
import IssueCard from '../components/IssueCard.jsx'
import './ReportIssue.css'

const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧' },
  { value: 'road_damage', label: 'Road Damage', icon: '🚧' },
  { value: 'other', label: 'Other', icon: '⚠️' },
]

export default function ReportIssue() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [category, setCategory] = useState('')
  const [aiCategory, setAiCategory] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  // Duplicate detection
  const [duplicates, setDuplicates] = useState(null)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)

  useEffect(() => {
    if (!user) {
      // Will show sign-in prompt instead of redirecting
    }
  }, [user])

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setAiCategory('')
    // Simulate AI categorization
    setAnalyzing(true)
    setTimeout(() => {
      const randomCat = CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1))].value
      setAiCategory(randomCat)
      if (!category) setCategory(randomCat)
      setAnalyzing(false)
    }, 1500)
  }

  function removePhoto() {
    setPhoto(null)
    setPhotoPreview(null)
    setAiCategory('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!photo) return setError('Please add a photo of the issue')
    if (!category) return setError('Please select a category')
    if (!description.trim()) return setError('Please describe the issue')

    // Get location
    let lat = 26.8467, lng = 80.9462
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      })
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch {
      // Use default location
    }

    const formData = new FormData()
    formData.append('photo', photo)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('latitude', lat)
    formData.append('longitude', lng)

    // Check for duplicates first
    try {
      const existingIssues = await getIssues({ category, status: 'reported' })
      const issues = existingIssues.issues || existingIssues || []
      const nearbyDupes = issues.filter(iss => {
        if (!iss.location?.coordinates) return false
        const [issLng, issLat] = iss.location.coordinates
        const dist = Math.sqrt((lat - issLat) ** 2 + (lng - issLng) ** 2)
        return dist < 0.005 // ~500m
      }).slice(0, 3)

      if (nearbyDupes.length > 0) {
        setDuplicates(nearbyDupes)
        setPendingFormData(formData)
        setShowDuplicateModal(true)
        return
      }
    } catch {
      // If duplicate check fails, proceed with submission
    }

    await submitIssue(formData)
  }

  async function submitIssue(formData) {
    setSubmitting(true)
    try {
      const result = await createIssue(formData)
      navigate(`/issues/${result._id || result.issue?._id || ''}`)
    } catch (err) {
      setError(err.message || 'Failed to submit issue')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpvoteExisting(issueId) {
    try {
      await castVote(issueId, 1)
    } catch {}
    setShowDuplicateModal(false)
    navigate(`/issues/${issueId}`)
  }

  function handleSubmitAnyway() {
    setShowDuplicateModal(false)
    if (pendingFormData) submitIssue(pendingFormData)
  }

  if (!user) {
    return (
      <div className="report-page page-enter">
        <div className="container container-sm">
          <div className="empty-state" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="empty-state__icon">🔒</div>
            <h3 className="empty-state__title">Sign In Required</h3>
            <p className="empty-state__desc">You need to sign in to report an issue</p>
            <button className="btn btn-primary btn-lg" onClick={login} style={{ marginTop: 24 }} id="report-signin-btn">
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="report-page page-enter">
      <div className="container container-sm">
        <div className="report-page__header">
          <h2 className="report-page__title" id="report-title">Report an Issue</h2>
          <p className="report-page__subtitle">Help improve your community by reporting civic issues</p>
        </div>

        <form className="report-form card" onSubmit={handleSubmit} id="report-form">
          {/* Photo Upload */}
          <div className="report-form__section">
            <label className="input-label">Photo Evidence</label>
            {photoPreview ? (
              <div className="report-form__preview">
                <img src={photoPreview} alt="Issue preview" />
                <button type="button" className="report-form__remove" onClick={removePhoto} id="remove-photo-btn">
                  ✕
                </button>
                {analyzing && (
                  <div className="report-form__analyzing">
                    <div className="spinner spinner-sm" />
                    <span>AI analyzing...</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="report-form__dropzone"
                onClick={() => fileInputRef.current?.click()}
                id="photo-dropzone"
              >
                <div className="report-form__dropzone-icon">📷</div>
                <p className="report-form__dropzone-text">Click to add a photo</p>
                <p className="report-form__dropzone-hint">JPG, PNG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              hidden
              id="photo-input"
            />
          </div>

          {/* Category */}
          <div className="report-form__section">
            <label className="input-label">Category</label>
            <div className="report-form__categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`report-form__cat-card ${category === cat.value ? 'report-form__cat-card--selected' : ''} ${aiCategory === cat.value && category !== cat.value ? 'report-form__cat-card--ai' : ''}`}
                  onClick={() => setCategory(cat.value)}
                  id={`cat-${cat.value}`}
                >
                  <span className="report-form__cat-icon">{cat.icon}</span>
                  <span className="report-form__cat-label">{cat.label}</span>
                  {aiCategory === cat.value && (
                    <span className="report-form__cat-ai-tag">AI</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="report-form__section">
            <label className="input-label" htmlFor="description-input">Description</label>
            <textarea
              className="input"
              id="description-input"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={4}
            />
            <div className="report-form__char-count">
              <span className={description.length > 450 ? 'text-primary' : ''}>{description.length}</span>/500
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="report-form__error" id="report-error">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={submitting}
            id="submit-report-btn"
          >
            {submitting ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                Submitting...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>

      {/* Duplicate Detection Modal */}
      {showDuplicateModal && (
        <div className="modal-overlay" onClick={() => setShowDuplicateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} id="duplicate-modal">
            <div className="modal-header">
              <h3>Similar Issues Found</h3>
              <button className="modal-close" onClick={() => setShowDuplicateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-medium" style={{ marginBottom: 16 }}>
                We found similar issues nearby. Is yours one of these?
              </p>
              <div className="report-form__duplicates">
                {duplicates?.map((iss) => (
                  <div key={iss._id} onClick={() => handleUpvoteExisting(iss._id)} style={{ cursor: 'pointer' }}>
                    <IssueCard issue={iss} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-secondary" onClick={handleSubmitAnyway} id="submit-anyway-btn" style={{ width: '100%' }}>
                No, different issue — Submit new report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
