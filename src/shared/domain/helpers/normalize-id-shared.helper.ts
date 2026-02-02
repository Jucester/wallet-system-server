import { Types } from 'mongoose'

export const transformIdToString = ({ value }) => {
  if (!value) {
    return
  }
  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Types.UUID) {
    return value.toString()
  }

  const buffer = Buffer.from(value.data)

  return [
    buffer.toString('hex', 0, 4), //  4 bytes
    buffer.toString('hex', 4, 6), //  2 bytes
    buffer.toString('hex', 6, 8), //  2 bytes
    buffer.toString('hex', 8, 10), //  2 bytes
    buffer.toString('hex', 10, 16), // 6 bytes
  ].join('-')
}
