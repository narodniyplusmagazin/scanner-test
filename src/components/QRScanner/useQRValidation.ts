import { useState } from 'react'
import { API_BASE_URL } from '../../config'

// API configuration
const API_ENDPOINT = API_BASE_URL + '/one-c/qr/validate'
const API_KEY = 'onec_key_example'

export interface QRResponse {
  type: string
  valid: boolean
  data: QRData
}

export interface QRData {
  subscriptionId: string
  userId: string
  userName: string
  expiresAt: string
  remainingUses: null
  validatedAt: string
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

  /**
   * Send QR code data to server for validation using SSE
   */
  const validateQRCode = async (data: string) => {
    console.log('Sending QR data to server:', data)
    
    setSending(true)
    setSendError(null)
    setSendSuccess(null)
    setValidationData(null)
    
    try {
      // Try to parse the QR data and extract subscription ID
      let codeToSend = data
      try {
        if (data.trim().startsWith('{')) {
          const parsed = JSON.parse(data)
          // If it's a subscription QR, send the subId with underscore format
          // so backend's split logic works correctly
          if (parsed.subId) {
            codeToSend = `${parsed.subId}_sub`
          }
        }
      } catch {
        // If parsing fails, send original data
      }

      // Use EventSource for SSE connection
      const url = `${API_ENDPOINT}?code=${encodeURIComponent(codeToSend)}`
      const eventSource = new EventSource(url)

      // Handle incoming validation result
      eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data)
        
        try {
          const responseBody = JSON.parse(event.data);
          console.log('Server response body:', responseBody)
          
          // Handle validation response
          if (responseBody.valid) {
            const details = [
              responseBody.data?.subscriptionId && `Subscription: ${responseBody.data.subscriptionId}`,
              responseBody.data?.userId && `User: ${responseBody.data.userId}`,
              responseBody.data?.expiresAt && `Expires: ${new Date(responseBody.data.expiresAt).toLocaleDateString()}`
            ].filter(Boolean).join(' | ')
            
            setSendSuccess(`✓ Valid QR Code ${details ? '(' + details + ')' : ''}`)
            setValidationData(responseBody)
          } else {
            const reasonMap: Record<string, string> = {
              not_found: 'QR code not found',
              already_used: 'QR code already used',
              not_yet_valid: 'QR code not yet valid',
              expired: 'QR code expired',
              no_user: 'No user found',
              no_active_subscription: 'No active subscription'
            }
            const reason = reasonMap[responseBody.reason] || responseBody.reason || 'Invalid'
            const message = responseBody.message || `Invalid: ${reason}`
            setSendError(message)
          }
        } catch (parseErr) {
          console.error('Failed to parse SSE data:', parseErr)
          setSendError('Failed to parse validation response')
        } finally {
          eventSource.close()
          setSending(false)
        }
      }

      // Handle errors
      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        setSendError('Connection error during validation')
        eventSource.close()
        setSending(false)
      }

      // Set timeout to prevent hanging connections
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close()
          if (!sendError && !sendSuccess) {
            setSendError('Validation timeout')
          }
          setSending(false)
        }
      }, 10000) // 10 second timeout
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err))
      setSending(false)
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
      const res = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      })

      console.log('Delete response:', res)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Delete error response:', errorText)
        throw new Error(`${res.status} ${res.statusText}: ${errorText}`)
      }
      
      const responseBody = await res.text()
      console.log('Delete response body:', responseBody)
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
    deleting,
    deleteError,
    deleteSuccess,
    deleteSubscription
  }
}
