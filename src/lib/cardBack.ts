import QRCode from 'qrcode'
import { profile } from '../content'
import { MONO, PAD, S, SANS, W, base, logo, roundRect } from './cardArt'

// Back of the card. Kept out of cardArt so the QR encoder only ships with the 3D chunk.

/** URL the QR code opens; exported so the page can check the code actually decodes to it. */
export const QR_URL = profile.github

export function drawBack() {
  const { c, ctx, p } = base()
  logo(ctx, p, 'DEV PASS 2026')

  // A large QR with the standard four-module quiet zone, dark on light, every module snapped to
  // whole texture pixels: that is what phone cameras need to read it off a screen.
  const qr = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const panel = Math.round(188 * S)
  const px = Math.round((W - panel) / 2)
  const py = Math.round(66 * S)
  const cell = Math.floor(panel / (n + 8))
  const inset = Math.round((panel - cell * n) / 2)
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, px, py, panel, panel, 12 * S)
  ctx.fill()
  ctx.fillStyle = '#000000'
  for (let r = 0; r < n; r++)
    for (let col = 0; col < n; col++) if (qr.modules.get(r, col)) ctx.fillRect(px + inset + col * cell, py + inset + r * cell, cell, cell)

  ctx.textAlign = 'center'
  ctx.fillStyle = p.muted
  ctx.font = `500 ${10 * S}px ${MONO}`
  ctx.fillText('Scan for github.com/ihyaabrar', W / 2, 274 * S)
  ctx.textAlign = 'left'

  ctx.fillStyle = p.line
  ctx.fillRect(PAD, 288 * S, W - PAD * 2, 1 * S)

  const field = (label: string, value: string, x: number, y: number) => {
    ctx.fillStyle = p.muted
    ctx.font = `500 ${8.5 * S}px ${MONO}`
    ctx.fillText(label, x, y)
    ctx.fillStyle = p.ink
    ctx.font = `600 ${11.5 * S}px ${SANS}`
    ctx.fillText(value, x, y + 14 * S)
  }
  const col2 = W / 2 + 4 * S
  field('Email', profile.email, PAD, 306 * S)
  field('LinkedIn', 'in/ihya-nashirudin-abrar', PAD, 338 * S)
  field('Instagram', '@ihyaabrar', PAD, 370 * S)
  field('ORCID', profile.orcidId, col2, 370 * S)

  ctx.fillStyle = p.muted
  ctx.font = `500 ${11 * S}px ${SANS}`
  ctx.fillText('Small progress is still progress.', PAD, 406 * S)

  return c
}
