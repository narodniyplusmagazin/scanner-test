import CryptoJS from 'crypto-js'
import { QR_ENCRYPTION_KEY } from '../../config'

/**
 * Interface for decoded QR data
 */
export interface DecodedQRData {
  type: 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'json' | 'subscription' | 'text' | 'encrypted'
  raw: string
  parsed?: {
    [key: string]: string | number | boolean | object
  }
  displayValue?: string
  decrypted?: boolean
  encryptionError?: string
}

/**
 * Try to decrypt data if it appears to be encrypted
 */
const tryDecrypt = (data: string): { success: boolean; decrypted?: string; error?: string } => {
  try {
    // Check if data looks like encrypted data (base64 or hex)
    // Common encrypted patterns: starts with encrypted prefix or is all base64/hex
    const isLikelyEncrypted = 
      data.length > 40 && 
      (/^[A-Za-z0-9+/=]+$/.test(data) || /^[A-Fa-f0-9]+$/.test(data))
    
    if (!isLikelyEncrypted) {
      return { success: false }
    }

    // Try AES decryption
    const decrypted = CryptoJS.AES.decrypt(data, QR_ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
    
    if (decrypted && decrypted.length > 0) {
      return { success: true, decrypted }
    }
    
    return { success: false }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Decryption failed' 
    }
  }
}

/**
 * Decode QR code data and determine its type and structure
 */
export const decodeQRData = (data: string): DecodedQRData => {
  // Try to decrypt first if data looks encrypted
  const decryptResult = tryDecrypt(data)
  let workingData = data
  let wasDecrypted = false
  
  if (decryptResult.success && decryptResult.decrypted) {
    workingData = decryptResult.decrypted
    wasDecrypted = true
  }
  // Check for JSON first (including subscription QR codes)
  if ((workingData.startsWith('{') && workingData.endsWith('}')) || 
      (workingData.startsWith('[') && workingData.endsWith(']'))) {
    try {
      const parsed = JSON.parse(workingData)
      
      // Check if it's a subscription QR code (has subId and userId)
      if (parsed.subId && parsed.userId) {
        return {
          type: 'subscription',
          raw: data,
          parsed: {
            subscriptionId: parsed.subId,
            userId: parsed.userId
          },
          displayValue: `Subscription ID: ${parsed.subId}\nUser ID: ${parsed.userId}`,
          decrypted: wasDecrypted
        }
      }
      
      // Generic JSON
      return {
        type: 'json',
        raw: data,
        parsed,
        displayValue: JSON.stringify(parsed, null, 2),
        decrypted: wasDecrypted
      }
    } catch {
      // Not valid JSON, continue to other checks
    }
  }

  // Check for URL
  if (workingData.startsWith('http://') || workingData.startsWith('https://')) {
    try {
      const url = new URL(workingData)
      return {
        type: 'url',
        raw: data,
        parsed: {
          protocol: url.protocol,
          hostname: url.hostname,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash
        },
        displayValue: workingData,
        decrypted: wasDecrypted
      }
    } catch {
      // Continue to other checks
    }
  }

  // Check for email
  if (workingData.startsWith('mailto:')) {
    const email = workingData.replace('mailto:', '')
    return {
      type: 'email',
      raw: data,
      parsed: { email },
      displayValue: email,
      decrypted: wasDecrypted
    }
  }

  // Check for phone
  if (workingData.startsWith('tel:')) {
    const phone = workingData.replace('tel:', '')
    return {
      type: 'phone',
      raw: data,
      parsed: { phone },
      displayValue: phone,
      decrypted: wasDecrypted
    }
  }

  // Check for SMS
  if (workingData.startsWith('sms:') || workingData.startsWith('smsto:')) {
    const phone = workingData.replace(/^sms(to)?:/, '')
    return {
      type: 'sms',
      raw: data,
      parsed: { phone },
      displayValue: phone,
      decrypted: wasDecrypted
    }
  }

  // Check for WiFi (format: WIFI:T:WPA;S:NetworkName;P:Password;;)
  if (workingData.startsWith('WIFI:')) {
    const parts = workingData.split(';')
    const parsed: { [key: string]: string } = {}
    
    parts.forEach(part => {
      const [key, value] = part.split(':')
      if (key && value) {
        const keyMap: { [key: string]: string } = {
          T: 'security',
          S: 'ssid',
          P: 'password',
          H: 'hidden'
        }
        parsed[keyMap[key] || key] = value
      }
    })

    return {
      type: 'wifi',
      raw: data,
      parsed,
      displayValue: `WiFi: ${parsed.ssid || 'Unknown'}`,
      decrypted: wasDecrypted
    }
  }

  // If data was encrypted but we couldn't parse it, return as encrypted type
  if (wasDecrypted) {
    return {
      type: 'text',
      raw: data,
      displayValue: workingData,
      decrypted: true
    }
  }

  // If decryption failed with error, include that info
  if (decryptResult.error) {
    return {
      type: 'encrypted',
      raw: data,
      displayValue: data,
      encryptionError: decryptResult.error
    }
  }

  // Default to text
  return {
    type: 'text',
    raw: data,
    displayValue: data
  }
}

/**
 * Format decoded data for display
 */
export const formatDecodedData = (decoded: DecodedQRData): string => {
  switch (decoded.type) {
    case 'subscription':
      return `🎫 Subscription${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'url':
      return `🔗 URL${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'email':
      return `📧 Email${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'phone':
      return `📞 Phone${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'sms':
      return `💬 SMS${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'wifi':
      return `📶 WiFi Network${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'json':
      return `📄 JSON Data${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
    
    case 'encrypted':
      return `🔒 Encrypted Data\nError: ${decoded.encryptionError || 'Could not decrypt'}`
    
    case 'text':
    default:
      return `📝 Text${decoded.decrypted ? ' (Decrypted)' : ''}\n${decoded.displayValue}`
  }
}
