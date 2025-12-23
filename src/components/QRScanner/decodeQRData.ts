/**
 * Interface for decoded QR data
 */
export interface DecodedQRData {
  type: 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'json' | 'subscription' | 'text'
  raw: string
  parsed?: {
    [key: string]: string | number | boolean | object
  }
  displayValue?: string
}

/**
 * Decode QR code data and determine its type and structure
 */
export const decodeQRData = (data: string): DecodedQRData => {
  // Check for JSON first (including subscription QR codes)
  if ((data.startsWith('{') && data.endsWith('}')) || 
      (data.startsWith('[') && data.endsWith(']'))) {
    try {
      const parsed = JSON.parse(data)
      
      // Check if it's a subscription QR code (has subId and userId)
      if (parsed.subId && parsed.userId) {
        return {
          type: 'subscription',
          raw: data,
          parsed: {
            subscriptionId: parsed.subId,
            userId: parsed.userId
          },
          displayValue: `Subscription ID: ${parsed.subId}\nUser ID: ${parsed.userId}`
        }
      }
      
      // Generic JSON
      return {
        type: 'json',
        raw: data,
        parsed,
        displayValue: JSON.stringify(parsed, null, 2)
      }
    } catch {
      // Not valid JSON, continue to other checks
    }
  }

  // Check for URL
  if (data.startsWith('http://') || data.startsWith('https://')) {
    try {
      const url = new URL(data)
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
        displayValue: data
      }
    } catch {
      // Continue to other checks
    }
  }

  // Check for email
  if (data.startsWith('mailto:')) {
    const email = data.replace('mailto:', '')
    return {
      type: 'email',
      raw: data,
      parsed: { email },
      displayValue: email
    }
  }

  // Check for phone
  if (data.startsWith('tel:')) {
    const phone = data.replace('tel:', '')
    return {
      type: 'phone',
      raw: data,
      parsed: { phone },
      displayValue: phone
    }
  }

  // Check for SMS
  if (data.startsWith('sms:') || data.startsWith('smsto:')) {
    const phone = data.replace(/^sms(to)?:/, '')
    return {
      type: 'sms',
      raw: data,
      parsed: { phone },
      displayValue: phone
    }
  }

  // Check for WiFi (format: WIFI:T:WPA;S:NetworkName;P:Password;;)
  if (data.startsWith('WIFI:')) {
    const parts = data.split(';')
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
      displayValue: `WiFi: ${parsed.ssid || 'Unknown'}`
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
      return `🎫 Subscription\n${decoded.displayValue}`
    
    case 'url':
      return `🔗 URL\n${decoded.displayValue}`
    
    case 'email':
      return `📧 Email\n${decoded.displayValue}`
    
    case 'phone':
      return `📞 Phone\n${decoded.displayValue}`
    
    case 'sms':
      return `💬 SMS\n${decoded.displayValue}`
    
    case 'wifi':
      return `📶 WiFi Network\n${decoded.displayValue}`
    
    case 'json':
      return `📄 JSON Data\n${decoded.displayValue}`
    
    case 'text':
    default:
      return `📝 Text\n${decoded.displayValue}`
  }
}
