import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldAlert, Shield, Clock, CheckCircle, XCircle, Upload, Loader2, FileText, Lock } from 'lucide-react'
import { getKycStatus, uploadKycDocument } from '../api/personal'
import { useAuth } from '../auth/useAuth'

const DOC_SLOTS = [
  { type: 'pan_card',      label: 'PAN Card',      hint: 'JPG, PNG or PDF' },
  { type: 'aadhaar_front', label: 'Aadhaar Front',  hint: 'Front side of Aadhaar card' },
  { type: 'aadhaar_back',  label: 'Aadhaar Back',   hint: 'Back side of Aadhaar card' },
  { type: 'photo',         label: 'Your Photo',     hint: 'Recent passport-size photograph' },
]

const STATUS_CONFIG = {
  not_started: { label: 'Not Started',  bg: 'bg-gray-100',  text: 'text-gray-600',  icon: Shield },
  in_progress:  { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  submitted:    { label: 'Submitted',   bg: 'bg-blue-100',  text: 'text-blue-700',  icon: ShieldAlert },
  verified:     { label: 'Verified',    bg: 'bg-green-100', text: 'text-green-700', icon: ShieldCheck },
  expired:      { label: 'Expired',     bg: 'bg-red-100',   text: 'text-red-700',   icon: XCircle },
}

export default function Kyc() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [kycStatus, setKycStatus] = useState('not_started')
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRefs = useRef({})

  const load = async () => {
    try {
      setLoading(true)
      const data = await getKycStatus()
      setKycStatus(data.kyc_status || 'not_started')
      setDocs(data.documents || [])
    } catch {
      setError('Failed to load KYC status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const docByType = (type) => docs.find(d => d.doc_type === type)

  const handleUpload = async (docType, file) => {
    setUploadingType(docType)
    setError(null)
    try {
      const newDoc = await uploadKycDocument(docType, file)
      setDocs(prev => [...prev.filter(d => d.doc_type !== docType), newDoc])
      setKycStatus(newDoc.kyc_status || kycStatus)
      if (fileInputRefs.current[docType]) fileInputRefs.current[docType].value = ''
    } catch (err) {
      setError('Upload failed: ' + (err?.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setUploadingType(null)
    }
  }

  const cfg = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.not_started
  const StatusIcon = cfg.icon

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user?.advisor_id) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Identity verification for advisor-managed accounts.</p>
        </div>
        <div className="mt-8 flex flex-col items-center text-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <Lock size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">KYC not required yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              KYC verification is only required once you connect with an advisor. Connect with an advisor to get started.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Find an Advisor
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-sm text-gray-500 mt-1">Upload your documents for your advisor to verify.</p>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${cfg.bg}`}>
        <StatusIcon size={20} className={cfg.text} />
        <div>
          <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {kycStatus === 'not_started' && 'Upload all 4 documents to get started.'}
            {kycStatus === 'in_progress' && 'Some documents are pending. Upload the remaining ones.'}
            {kycStatus === 'submitted' && 'All documents uploaded. Your advisor is reviewing them.'}
            {kycStatus === 'verified' && 'Your KYC is complete. All documents have been verified.'}
            {kycStatus === 'expired' && 'Your KYC has expired. Please re-upload your documents.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Document cards */}
      <div className="space-y-3">
        {DOC_SLOTS.map(slot => {
          const existing = docByType(slot.type)
          const isUploading = uploadingType === slot.type
          const isRejected = existing?.status === 'rejected'
          const isVerified = existing?.status === 'verified'

          return (
            <div
              key={slot.type}
              className={`bg-white rounded-xl border p-4 space-y-3 ${
                isRejected ? 'border-red-200' : isVerified ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{slot.label}</span>
                {!existing && <span className="text-xs text-gray-400">Not uploaded</span>}
                {existing?.status === 'pending' && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                    <Clock size={10} /> Under review
                  </span>
                )}
                {isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
                {isRejected && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                    <XCircle size={10} /> Action required
                  </span>
                )}
              </div>

              {isRejected && existing.rejection_reason && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Your advisor requested a re-upload:</p>
                    <p className="text-xs text-red-600 mt-0.5">{existing.rejection_reason}</p>
                  </div>
                </div>
              )}

              {existing && !isRejected && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                  <FileText size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">{existing.file_name}</span>
                </div>
              )}

              {(!existing || isRejected) && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">{slot.hint}</p>
                  <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
                    isUploading
                      ? 'border-blue-200 text-blue-400 cursor-not-allowed bg-blue-50'
                      : isRejected
                      ? 'border-red-200 text-red-600 cursor-pointer hover:border-red-300 hover:bg-red-50'
                      : 'border-gray-200 text-gray-600 cursor-pointer hover:border-navy-300 hover:bg-navy-50 hover:text-navy-700'
                  }`}>
                    <input
                      ref={el => fileInputRefs.current[slot.type] = el}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={isUploading}
                      onChange={e => e.target.files[0] && handleUpload(slot.type, e.target.files[0])}
                    />
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isUploading ? 'Uploading…' : isRejected ? 'Re-upload' : 'Upload'}
                  </label>
                </div>
              )}

              {existing && !isRejected && !isVerified && (
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                  <input
                    ref={el => fileInputRefs.current[slot.type] = el}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => e.target.files[0] && handleUpload(slot.type, e.target.files[0])}
                  />
                  {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  Replace file
                </label>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center text-gray-400 pb-4">
        Your documents are securely stored and only visible to your advisor.
      </p>
    </div>
  )
}
