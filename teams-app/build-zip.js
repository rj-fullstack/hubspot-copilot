const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// Minimal ZIP builder — no dependencies, pure Node.js
// Ensures UTF-8 encoding, LF line endings, no BOM

function toBytes(str) {
  return Buffer.from(str, 'utf8')
}

function buildZip(files) {
  const entries = []
  const centralDir = []
  let offset = 0

  for (const [name, filePath] of files) {
    let data = fs.readFileSync(filePath)
    // Normalize line endings to LF for text files
    if (name.endsWith('.json') || name.endsWith('.yaml')) {
      data = Buffer.from(data.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
    }
    const compressed = zlib.deflateRawSync(data, { level: 9 })
    const nameBytes = toBytes(name)
    const crc = crc32(data)
    const now = new Date()
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)

    // Local file header
    const localHeader = Buffer.alloc(30 + nameBytes.length)
    localHeader.writeUInt32LE(0x04034b50, 0)  // signature
    localHeader.writeUInt16LE(20, 4)           // version needed
    localHeader.writeUInt16LE(0, 6)            // flags
    localHeader.writeUInt16LE(8, 8)            // compression: deflate
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc >>> 0, 14)
    localHeader.writeUInt32LE(compressed.length, 18)
    localHeader.writeUInt32LE(data.length, 22)
    localHeader.writeUInt16LE(nameBytes.length, 26)
    localHeader.writeUInt16LE(0, 28)
    nameBytes.copy(localHeader, 30)

    entries.push(localHeader, compressed)

    // Central directory entry
    const centralEntry = Buffer.alloc(46 + nameBytes.length)
    centralEntry.writeUInt32LE(0x02014b50, 0)  // signature
    centralEntry.writeUInt16LE(20, 4)           // version made by
    centralEntry.writeUInt16LE(20, 6)           // version needed
    centralEntry.writeUInt16LE(0, 8)            // flags
    centralEntry.writeUInt16LE(8, 10)           // compression
    centralEntry.writeUInt16LE(dosTime, 12)
    centralEntry.writeUInt16LE(dosDate, 14)
    centralEntry.writeUInt32LE(crc >>> 0, 16)
    centralEntry.writeUInt32LE(compressed.length, 20)
    centralEntry.writeUInt32LE(data.length, 24)
    centralEntry.writeUInt16LE(nameBytes.length, 28)
    centralEntry.writeUInt16LE(0, 30)           // extra
    centralEntry.writeUInt16LE(0, 32)           // comment
    centralEntry.writeUInt16LE(0, 34)           // disk start
    centralEntry.writeUInt16LE(0, 36)           // internal attr
    centralEntry.writeUInt32LE(0, 38)           // external attr
    centralEntry.writeUInt32LE(offset, 42)      // local header offset
    nameBytes.copy(centralEntry, 46)

    centralDir.push(centralEntry)
    offset += localHeader.length + compressed.length
  }

  const centralDirBuf = Buffer.concat(centralDir)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(centralDir.length, 8)
  eocd.writeUInt16LE(centralDir.length, 10)
  eocd.writeUInt32LE(centralDirBuf.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)

  return Buffer.concat([...entries, centralDirBuf, eocd])
}

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })())
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF)
}

const dir = __dirname
const zip = buildZip([
  ['manifest.json',  path.join(dir, 'manifest.json')],
  ['ai-plugin.json', path.join(dir, 'ai-plugin.json')],
  ['openapi.json',   path.join(dir, 'openapi.json')],
  ['color.png',      path.join(dir, 'color.png')],
  ['outline.png',    path.join(dir, 'outline.png')],
])

fs.writeFileSync(path.join(dir, 'appPackage.zip'), zip)
console.log('appPackage.zip built successfully (' + zip.length + ' bytes)')
console.log('Files: manifest.json, ai-plugin.json, openapi.json, color.png, outline.png')
