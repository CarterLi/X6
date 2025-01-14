import { Color } from './'

describe('Color', () => {
  describe('#isValid', () => {
    it('shoud return validity of color value', () => {
      expect(Color.isValid('#fff')).toBeTruthy()
      expect(Color.isValid('red')).toBeTruthy()
      expect(Color.isValid(null)).toBeFalsy()
      expect(Color.isValid('none')).toBeFalsy()
    })
  })

  describe('#random', () => {
    it('shoud return valid random hex value', () => {
      expect(Color.random()).toMatch(/^#[0-9A-F]{6}/)
    })
  })

  describe('#invert', () => {
    it('shoud return invert value of a color value', () => {
      expect(Color.invert('#ffffff', false)).toBe('#000000')
      expect(Color.invert('#000', false)).toBe('#ffffff')
      expect(Color.invert('234567', false)).toBe('#dcba98')
    })

    it('decide font color in white or black depending on background color', () => {
      expect(Color.invert('#121212', true)).toBe('#FFFFFF')
      expect(Color.invert('#feeade', true)).toBe('#000000')
    })

    it('shoud throw exception with invalid color value', () => {
      expect(() => {
        Color.invert('#abcd', false)
      }).toThrowError('Invalid hex color.')
    })
  })
})