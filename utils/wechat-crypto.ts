/**
 * 企业微信消息加解密工具
 * 
 * 参考文档：https://developer.work.weixin.qq.com/document/path/90968
 */

import crypto from 'crypto'

export class WeChatCrypto {
  private token: string
  private encodingAESKey: string
  private corpId: string
  private aesKey: Buffer

  constructor(token: string, encodingAESKey: string, corpId: string) {
    this.token = token
    this.encodingAESKey = encodingAESKey
    this.corpId = corpId
    
    // 将 EncodingAESKey 转换为 AES Key
    // EncodingAESKey 是 43 位字符串，需要加 '=' 补全为 44 位，然后 Base64 解码
    this.aesKey = Buffer.from(encodingAESKey + '=', 'base64')
  }

  /**
   * 验证签名
   * @param signature 企业微信发送的签名
   * @param timestamp 时间戳
   * @param nonce 随机数
   * @param encryptedMsg 加密的消息体
   * @returns 是否验证通过
   */
  verifySignature(signature: string, timestamp: string, nonce: string, encryptedMsg: string): boolean {
    // 1. 将 token、timestamp、nonce、加密消息体按字典序排序
    const tmpArr = [this.token, timestamp, nonce, encryptedMsg].sort()
    
    // 2. 拼接成字符串
    const tmpStr = tmpArr.join('')
    
    // 3. 使用 SHA1 算法加密
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex')
    
    // 4. 比较签名
    return hash === signature
  }

  /**
   * 解密消息
   * @param encryptedMsg Base64 编码的加密消息
   * @returns 解密后的 XML 字符串
   */
  decrypt(encryptedMsg: string): string {
    try {
      // 1. Base64 解码
      const encrypted = Buffer.from(encryptedMsg, 'base64')
      
      // 2. 提取 IV（前 16 字节）和实际加密内容
      const iv = encrypted.slice(0, 16)
      const ciphertext = encrypted.slice(16)
      
      // 3. AES-256-CBC 解密
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, iv)
      let decrypted = decipher.update(ciphertext)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      
      // 4. 解析消息结构
      // 消息格式：[16字节随机字符串][4字节网络字节序消息长度][消息内容][4字节网络字节序随机字符串长度][随机字符串][企业ID]
      // 前16字节是随机字符串，需要跳过
      const contentLength = decrypted.readUInt32BE(16)
      const content = decrypted.slice(20, 20 + contentLength).toString('utf8')
      
      // 读取随机字符串长度
      const randomStrLength = decrypted.readUInt32BE(20 + contentLength)
      const randomStr = decrypted.slice(24 + contentLength, 24 + contentLength + randomStrLength).toString('utf8')
      
      // 读取企业ID
      const fromCorpId = decrypted.slice(24 + contentLength + randomStrLength).toString('utf8')
      
      // 5. 验证企业 ID
      if (fromCorpId !== this.corpId) {
        throw new Error(`企业 ID 不匹配: 期望 ${this.corpId}, 实际 ${fromCorpId}`)
      }
      
      return content
    } catch (error: any) {
      throw new Error(`解密失败: ${error.message}`)
    }
  }

  /**
   * 加密消息（用于回复）
   * @param message 要加密的 XML 消息
   * @returns Base64 编码的加密消息
   */
  encrypt(message: string): string {
    try {
      // 1. 生成随机字符串（16 字节）
      const randomStr = crypto.randomBytes(16).toString('base64').slice(0, 16)
      
      // 2. 构造消息体
      // 格式：[4字节网络字节序消息长度][消息内容][4字节网络字节序随机字符串长度][随机字符串][企业ID]
      const messageBuffer = Buffer.from(message, 'utf8')
      const randomStrBuffer = Buffer.from(randomStr, 'utf8')
      const corpIdBuffer = Buffer.from(this.corpId, 'utf8')
      
      const contentLength = Buffer.allocUnsafe(4)
      contentLength.writeUInt32BE(messageBuffer.length, 0)
      
      const randomStrLength = Buffer.allocUnsafe(4)
      randomStrLength.writeUInt32BE(randomStrBuffer.length, 0)
      
      const plaintext = Buffer.concat([
        contentLength,
        messageBuffer,
        randomStrLength,
        randomStrBuffer,
        corpIdBuffer,
      ])
      
      // 3. 使用 PKCS7 填充
      const blockSize = 32 // AES-256 块大小
      const padding = blockSize - (plaintext.length % blockSize)
      const paddingBuffer = Buffer.alloc(padding, padding)
      const paddedPlaintext = Buffer.concat([plaintext, paddingBuffer])
      
      // 4. 生成随机 IV
      const iv = crypto.randomBytes(16)
      
      // 5. AES-256-CBC 加密
      const cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, iv)
      let encrypted = cipher.update(paddedPlaintext)
      encrypted = Buffer.concat([encrypted, cipher.final()])
      
      // 6. 拼接 IV 和加密内容，然后 Base64 编码
      const result = Buffer.concat([iv, encrypted])
      return result.toString('base64')
    } catch (error: any) {
      throw new Error(`加密失败: ${error.message}`)
    }
  }

  /**
   * 生成签名（用于回复消息）
   * @param timestamp 时间戳
   * @param nonce 随机数
   * @param encryptedMsg 加密的消息
   * @returns 签名
   */
  generateSignature(timestamp: string, nonce: string, encryptedMsg: string): string {
    const tmpArr = [this.token, timestamp, nonce, encryptedMsg].sort()
    const tmpStr = tmpArr.join('')
    return crypto.createHash('sha1').update(tmpStr).digest('hex')
  }
}

/**
 * 解析 XML 消息
 */
export function parseWeChatXML(xml: string): Promise<any> {
  // 简单的 XML 解析（生产环境建议使用 xml2js）
  return new Promise((resolve, reject) => {
    try {
      const result: any = {}
      const tagRegex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g
      let match

      while ((match = tagRegex.exec(xml)) !== null) {
        const tagName = match[1] || match[3]
        const tagValue = match[2] || match[4]
        if (!result[tagName]) {
          result[tagName] = []
        }
        result[tagName].push(tagValue)
      }

      resolve({ xml: result })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 生成 XML 消息（用于回复）
 */
export function generateWeChatXML(data: Record<string, string>): string {
  const parts: string[] = ['<xml>']
  
  for (const [key, value] of Object.entries(data)) {
    parts.push(`<${key}><![CDATA[${value}]]></${key}>`)
  }
  
  parts.push('</xml>')
  return parts.join('')
}

