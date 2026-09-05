/**
 * Maps a note name to its seat on a five-line staff, and describes that seat
 * in words a beginner can follow.
 */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export const OCTAVES = [2, 3, 4, 5, 6] as const

export type Letter = (typeof LETTERS)[number]
export type Octave = (typeof OCTAVES)[number]
export type Clef = 'treble' | 'bass'

// Staff geometry, in SVG user units.
const SPACING = 16 // gap between two staff lines
const HALF = SPACING / 2 // one diatonic step: line to neighbouring space
const BASE_Y = 170 // bottom staff line, before any downward shift
const NOTE_X = 270
const STAFF_LEFT = 16
const STAFF_RIGHT = 384
const LEDGER_HALF_WIDTH = 26
const GLYPH_X = 36
const GLYPH_SIZE = 4 * SPACING
const MIN_HEIGHT = 250
const TOP_MARGIN = 40 // keep the highest ledger line off the top edge

/** Diatonic index: seven steps per octave, C0 = 0. */
const MIDDLE_C = 28
/** Diatonic index of each clef's bottom staff line: E4 for treble, G2 for bass. */
const BOTTOM_LINE: Record<Clef, number> = { treble: 30, bass: 18 }
const CLEF_GLYPH: Record<Clef, string> = { treble: '\u{1D11E}', bass: '\u{1D122}' }

export interface StaffLayout {
  clef: Clef
  /** Note name as shown, e.g. "C4". */
  label: string
  /** Plain-language description of where the note sits. */
  sentence: string
  isMiddleC: boolean
  height: number
  noteX: number
  noteY: number
  staffLineYs: number[]
  ledgerYs: number[]
  staffLeft: number
  staffRight: number
  ledgerLeft: number
  ledgerRight: number
  glyph: string
  glyphX: number
  glyphY: number
  glyphSize: number
}

/** Steps above the clef's bottom staff line. 0 = bottom line, 8 = top line. */
function diatonicIndex(letter: Letter, octave: Octave): number {
  return 7 * octave + LETTERS.indexOf(letter)
}

/** Notes below middle C read more naturally on the bass staff. */
function clefFor(index: number): Clef {
  return index < MIDDLE_C ? 'bass' : 'treble'
}

/** Describes an offset from the bottom staff line in words. */
export function describe(offset: number, clef: Clef): string {
  const onLine = offset % 2 === 0

  if (offset >= 0 && offset <= 8) {
    const n = onLine ? offset / 2 + 1 : (offset + 1) / 2
    const ordinal = ['first', 'second', 'third', 'fourth', 'fifth'][n - 1]
    return `The ${ordinal} ${onLine ? 'line' : 'space'} of the ${clef} staff, counting up from the bottom.`
  }

  const above = offset > 8
  const side = above ? 'above' : 'below'
  const count = above ? Math.floor((offset - 8) / 2) : Math.floor(-offset / 2)
  if (count === 0) return `The space just ${side} the ${clef} staff.`

  const seat = onLine
    ? 'The note sits on the outermost one.'
    : 'The note sits in the space beyond the outermost one.'
  return `${count} ledger line${count > 1 ? 's' : ''} ${side} the ${clef} staff. ${seat}`
}

export function staffLayout(letter: Letter, octave: Octave): StaffLayout {
  const index = diatonicIndex(letter, octave)
  const clef = clefFor(index)
  const offset = index - BOTTOM_LINE[clef]

  // High notes would run off the top, so slide the whole staff down instead.
  const rawNoteY = BASE_Y - offset * HALF
  const shift = Math.max(0, TOP_MARGIN - rawNoteY)
  const noteY = rawNoteY + shift
  const base = BASE_Y + shift
  const topLine = base - 4 * SPACING

  const staffLineYs = Array.from({ length: 5 }, (_, i) => topLine + i * SPACING)

  const ledgerYs: number[] = []
  if (offset > 8) for (let o = 10; o <= offset; o += 2) ledgerYs.push(base - o * HALF)
  if (offset < 0) for (let o = -2; o >= offset; o -= 2) ledgerYs.push(base - o * HALF)

  return {
    clef,
    label: `${letter}${octave}`,
    sentence: describe(offset, clef),
    isMiddleC: index === MIDDLE_C,
    height: Math.max(MIN_HEIGHT, noteY + 60),
    noteX: NOTE_X,
    noteY,
    staffLineYs,
    ledgerYs,
    staffLeft: STAFF_LEFT,
    staffRight: STAFF_RIGHT,
    ledgerLeft: NOTE_X - LEDGER_HALF_WIDTH,
    ledgerRight: NOTE_X + LEDGER_HALF_WIDTH,
    glyph: CLEF_GLYPH[clef],
    glyphX: GLYPH_X,
    // The treble curl and the bass dots hang from different staff lines.
    glyphY: clef === 'treble' ? topLine + 3 * SPACING : topLine + SPACING,
    glyphSize: GLYPH_SIZE
  }
}
