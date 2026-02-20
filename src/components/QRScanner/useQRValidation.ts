import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

// API configuration
const API_ENDPOINT = API_BASE_URL + '/one-c/qr/validate'

const ensureQrPrefix = (value: string): string => {
  return value.startsWith('QR_') ? value : `QR_${value}`
}

export interface QRResponse {
  type: string
  valid: boolean
  reason?: string
  message?: string
  data?: QRData
}

export interface QRData {
  subscriptionId: string
  userId: string
  userName?: string
  expiresAt: string
  remainingUses: number | null
  validatedAt: string
  usedToday?: number
  limit?: number
}


/**
 * Custom hook to handle QR code validation with the server
 */
export const useQRValidation = () => { 
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [validationData, setValidationData] = useState<QRResponse | null>(null)
  
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null)

  /**
   * Send QR code data to server for validation using GET request
   */
  const validateQRCode = async (data: string) => {
    console.log('Sending QR data to server:', data)
    console.log(data,"<<<<");
    
    
    const formattedData = ensureQrPrefix(data)
    console.log('QR data sent to OneC:', formattedData)
    
    setSending(true)
    setSendError(null)
    setSendSuccess(null)
    setValidationData(null)
    
    try {
      const response = await axios.get<QRResponse>(API_ENDPOINT, {
        params: { code: formattedData }
      });
      
      
      const responseBody = response.data
      console.log('Server response:', responseBody)
      
      // Handle validation response
      if (responseBody.valid && responseBody.data) {
        const details = [
          responseBody.data.userName && `User: ${responseBody.data.userName}`,
          responseBody.data.subscriptionId && `Subscription: ${responseBody.data.subscriptionId}`,
          responseBody.data.expiresAt && `Expires: ${new Date(responseBody.data.expiresAt).toLocaleDateString()}`
        ].filter(Boolean).join(' | ')
        
        setSendSuccess(`✓ Valid QR Code ${details ? '(' + details + ')' : ''}`)
        setValidationData(responseBody)
      } else {
        const reasonMap: Record<string, string> = {
          not_found: 'QR code not found',
          invalid_format: 'Unable to decrypt or parse QR code',
          missing_subscription_id: 'QR code is missing subscription information',
          not_yet_valid: 'QR code not yet valid',
          expired: 'QR code expired',
          no_user: 'No user found',
          no_active_subscription: 'No active subscription',
          daily_limit_reached: `Daily usage limit reached (${responseBody.data?.limit || 3} uses per day)`,
          server_error: 'Server error during validation'
        }
        const reason = reasonMap[responseBody.reason || ''] || responseBody.reason || 'Invalid'
        const message = responseBody.message || `Invalid: ${reason}`
        setSendError(message)
        
        // Still set validation data for daily limit info
        if (responseBody.reason === 'daily_limit_reached') {
          setValidationData(responseBody)
        }
      }
    } catch (err) {
      console.error('Validation error:', err)
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Connection error during validation'
        setSendError(errorMessage)
      } else {
        setSendError(err instanceof Error ? err.message : 'Unknown error during validation')
      }
    } finally {
      setSending(false)
    }
  }

  /**
   * Confirm QR usage - marks the subscription as used for today
   */
const confirmQRUsage = async (data: string) => {
  console.log('Confirming QR usage:', data)
  
  setConfirming(true)
  setConfirmError(null)
  setConfirmSuccess(null)
  
  try {
    const formattedData = ensureQrPrefix(data)
    
    const params: { code: string; userId?: string; subscriptionId?: string } = {
      code: formattedData,
    }
    
    if (validationData?.data?.userId) {
      params.userId = validationData.data.userId
    }
    if (validationData?.data?.subscriptionId) {
      params.subscriptionId = validationData.data.subscriptionId
    }
    
    console.log('Confirm usage params:', params)
    
    const response = await axios.get(`${API_BASE_URL}/one-c/qr/confirm-usage`, {
      params
    })
    
    const responseBody = response.data
    console.log('Confirm usage response:', responseBody)
    
    if (responseBody.status === 'ok') {
      const usageInfo = responseBody.data
      setConfirmSuccess(
        `✓ Usage confirmed! ${usageInfo.remainingUses} of ${usageInfo.dailyLimit} uses remaining today`
      )
      
      // Update validation data with new usage counts
      if (validationData) {
        setValidationData({
          ...validationData,
          data: validationData.data ? {
            ...validationData.data,
            remainingUses: usageInfo.remainingUses,
            usedToday: usageInfo.usageCount,
            limit: usageInfo.dailyLimit
          } : undefined
        })
      }
    } else {
      const errorMessage = responseBody.message || 'Failed to confirm usage'
      setConfirmError(errorMessage)
    }
  } catch (err) {
    console.error('Confirm usage error:', err)
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Connection error during confirmation'
      setConfirmError(errorMessage)
    } else {
      setConfirmError(err instanceof Error ? err.message : 'Unknown error during confirmation')
    }
  } finally {
    setConfirming(false)
  }
}
  /**
   * Delete subscription based on QR code data
   */
  const deleteSubscription = async (data: string) => {
    console.log('Deleting subscription:', data)
    
    setDeleting(true)
    setDeleteError(null)
    setDeleteSuccess(null)
    
    try {
      // Parse the QR data to get subscription ID
      let subscriptionId: string | null = null
      
      try {
        const parsed = JSON.parse(data)
        subscriptionId = parsed.subId || parsed.subscriptionId || null
      } catch {
        setDeleteError('Invalid QR code format')
        return
      }

      if (!subscriptionId) {
        setDeleteError('No subscription ID found in QR code')
        return
      }

      const deleteEndpoint = `${API_BASE_URL}/subscriptions/${subscriptionId}`
      const response = await axios.delete(deleteEndpoint)
      
      console.log('Delete response:', response.data)
      setDeleteSuccess('Subscription deleted successfully')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err))
    } finally {
      setDeleting(false)
    }
  }

  return {
    sending,
    sendError,
    sendSuccess,
    validationData,
    validateQRCode,
    confirming,
    confirmError,
    confirmSuccess,
    confirmQRUsage,
    deleting,
    deleteError,
    deleteSuccess,
    deleteSubscription
  }
}
