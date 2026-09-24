// Draws the ID card with the 2D canvas API only. The hero shows this as a static poster straight away;
// the 3D scene wraps the same canvases in textures once it has loaded.
import { profile } from '../content'

// Single black card, matching the site's light theme.
export const P = { bg: '#151515', ink: '#f4f4f2', muted: '#8d8d88', line: '#2c2c2b', accent: '#ee6a1f', strap: '#161616', strapInk: '#d7d7d2' }

// Card is 1.6 × 2.25 world units; the texture keeps that ratio.
export const CARD_W = 1.6
export const CARD_H = 2.25

// Rig geometry shared by the 3D scene and the static poster, in world units (1 unit = ppu px).
export const REACH = 1.7 // strap length, pivot to the clasp's clamp
export const CARD_ANCHOR = 1.4 // top of the clamp (where the strap ends), above the card centre
// The clasp, top to bottom, in card-local y. The slot punched in the card spans y 1.0375 to 1.078.
export const CLASP = {
  clampY: 1.375, // centre of the dark clamp that grips the strap end
  clampH: 0.05,
  ringY: 1.35, // centre of the D-ring; only its lower half is drawn
  ringR: 0.07,
  swivelTop: 1.28,
  swivelBottom: 1.255,
  hookBottom: 1.075, // the hook runs down the card's face to here, then curves through the slot
  hookZ: 0.03, // how far in front of (and behind) the card the hook runs
}
export const STRAP_W = 0.2
// The strap hangs from a pivot above the top of the page, so it reads as coming from off screen.
// Measured from the top of the canvas, which starts at the top of the page (behind the header).
export const RAIL_INSET = -0.3
// top of the canvas to the bottom of the resting card
export const RIG_DEPTH = RAIL_INSET + REACH + CARD_ANCHOR + CARD_H / 2
// Key light above and slightly right of the viewer; the wall the shadow falls on sits WALL_Z behind the card.
export const LIGHT = { x: 0.6, y: 4, z: 8 }
export const WALL_Z = -0.5
export const SHADOW_SHIFT = { x: (-LIGHT.x / LIGHT.z) * -WALL_Z, y: (-LIGHT.y / LIGHT.z) * -WALL_Z }
export const W = 1024
const H = 1440
export const S = W / 300 // mockup was designed at 300px wide
export const PAD = 22 * S
const RADIUS = 18 * S

// Slot punched through the top of the card for the clip, in texture pixels.
export const SLOT = { w: 90, h: 26, top: 30 }

export const SANS = '"Archivo Variable", Archivo, system-ui, sans-serif'
export const MONO = '"IBM Plex Mono", ui-monospace, Consolas, monospace'

let assets: Promise<HTMLImageElement | null> | null = null
/** Photo plus the fonts the card uses; shared by the poster and the 3D scene. */
export function loadCardAssets() {
  assets ??= (async () => {
    const img = new Image()
    img.src = '/photo.jpg'
    await Promise.all([
      img.decode(),
      document.fonts.load('800 condensed 60px "Archivo Variable"'),
      document.fonts.load('500 30px "Archivo Variable"'),
      document.fonts.load('500 30px "IBM Plex Mono"'),
    ]).catch(() => {})
    return img.complete && img.naturalWidth ? img : null
  })()
  return assets
}

// Condensed width is the badge-print voice from DESIGN.md; browsers without fontStretch fall back to normal width.
function stretch(ctx: CanvasRenderingContext2D, v: CanvasFontStretch) {
  if ('fontStretch' in ctx) ctx.fontStretch = v
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function base() {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const p = P
  roundRect(ctx, 0, 0, W, H, RADIUS)
  ctx.fillStyle = p.bg
  ctx.fill()
  // obsidian finish from the reference: a faint rim and a brighter top edge, so the black card
  // keeps its silhouette against a dark page
  ctx.save()
  ctx.lineWidth = 4
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  roundRect(ctx, 2, 2, W - 4, H - 4, RADIUS - 2)
  ctx.stroke()
  const sheen = ctx.createLinearGradient(0, 0, 0, 40)
  sheen.addColorStop(0, 'rgba(255,255,255,0.10)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  roundRect(ctx, 0, 0, W, H, RADIUS)
  ctx.clip()
  ctx.fillRect(0, 0, W, 40)
  ctx.restore()
  // punch the clip slot so it is truly see-through (alphaTest discards it)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  roundRect(ctx, W / 2 - SLOT.w / 2, SLOT.top, SLOT.w, SLOT.h, SLOT.h / 2)
  ctx.fill()
  ctx.restore()
  return { c, ctx, p }
}

export function logo(ctx: CanvasRenderingContext2D, p: typeof P, right: string) {
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 ${26 * S}px ${SANS}`
  ctx.fillStyle = p.ink
  ctx.letterSpacing = `${-0.5 * S}px`
  ctx.fillText('ihya', PAD, 46 * S)
  const w = ctx.measureText('ihya').width
  ctx.fillStyle = p.accent
  ctx.fillText('.', PAD + w, 46 * S)
  ctx.letterSpacing = '0px'
  ctx.font = `500 ${10 * S}px ${MONO}`
  ctx.fillStyle = p.muted
  ctx.textAlign = 'right'
  ctx.fillText(right, W - PAD, 44 * S)
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0px'
}

export function drawFront(photo: HTMLImageElement | null, sub: string, location: string) {
  const { c, ctx, p } = base()

  if (photo) {
    // The portrait is the card's main panel: full width, face centred, lifted in brightness so it
    // reads against the black card, fading out only at the bottom where the name begins.
    const px = PAD
    const py = 58 * S
    const pw = W - PAD * 2
    const ph = 228 * S
    const off = document.createElement('canvas')
    off.width = Math.round(pw)
    off.height = Math.round(ph)
    const o = off.getContext('2d')!
    const side = pw * 1.12 // a little zoom so the face fills the panel
    o.filter = 'grayscale(1) brightness(1.2) contrast(1.12)'
    o.drawImage(photo, (pw - side) / 2, ph * 0.46 - side * 0.46, side, side)
    o.filter = 'none'
    o.globalCompositeOperation = 'destination-in'
    const g = o.createLinearGradient(0, 0, 0, ph)
    g.addColorStop(0.58, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    o.fillStyle = g
    o.fillRect(0, 0, pw, ph)
    ctx.save()
    roundRect(ctx, px, py, pw, ph, 12 * S)
    ctx.clip()
    ctx.drawImage(off, px, py)
    ctx.restore()
  }

  logo(ctx, p, 'DEV PASS 2026')

  // bottom stack
  ctx.fillStyle = p.ink
  ctx.font = `700 ${18 * S}px ${SANS}`
  ctx.fillText(profile.name, PAD, 300 * S)
  ctx.fillStyle = p.muted
  ctx.font = `500 ${11 * S}px ${SANS}`
  ctx.fillText(sub, PAD, 316 * S)

  ctx.fillStyle = p.ink
  // setting `font` resets fontStretch, so stretch goes second; shrink to fit if condensed isn't supported
  let size = 58 * S
  ctx.font = `800 ${size}px ${SANS}`
  stretch(ctx, 'condensed')
  const room = W - PAD * 2
  const wide = ctx.measureText('DEVELOPER').width
  if (wide > room) {
    size *= room / wide
    ctx.font = `800 ${size}px ${SANS}`
    stretch(ctx, 'condensed')
  }
  ctx.fillText('DEVELOPER', PAD - 2 * S, 364 * S)
  stretch(ctx, 'normal')
  ctx.fillStyle = p.muted
  ctx.font = `500 ${10 * S}px ${MONO}`
  ctx.fillText('Web, mobile, data and AI', PAD, 377 * S)

  ctx.letterSpacing = '0px'
  ctx.fillStyle = p.line
  ctx.fillRect(PAD, 384 * S, W - PAD * 2, 1 * S)
  ctx.fillStyle = p.muted
  ctx.font = `500 ${11 * S}px ${SANS}`
  ctx.fillText(location, PAD, 402 * S)
  ctx.fillStyle = p.accent
  ctx.font = `800 ${22 * S}px ${SANS}`
  ctx.textAlign = 'right'
  ctx.fillText('1.', W - PAD, 403 * S)
  ctx.textAlign = 'left'

  return c
}

export function drawStrap() {
  const p = P
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = p.strap
  ctx.fillRect(0, 0, c.width, c.height)
  // stitched edges, as on the reference lanyard; they also keep the strap visible on a dark page
  ctx.strokeStyle = '#3a3d45'
  ctx.lineWidth = 4
  ctx.setLineDash([14, 8])
  for (const y of [9, c.height - 9]) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(c.width, y)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.fillStyle = p.strapInk
  ctx.font = `600 44px ${MONO}`
  ctx.letterSpacing = '6px'
  ctx.textBaseline = 'middle'
  const text = "IHYA' NASHIRUDIN ABRAR  •  DEVELOPER  •  DEV PASS 2026  •  "
  const tw = ctx.measureText(text).width
  // stretch the phrase to exactly fill the tile so it repeats seamlessly
  ctx.save()
  ctx.scale(c.width / tw, 1)
  ctx.fillText(text, 0, c.height / 2 + 2)
  ctx.restore()
  return c
}
