import fs = require('fs')
import * as installer from '../src/installer'

describe('installer', () => {
  it('get v1.2.0 version of cosign', async () => {
    const cosign = await installer.getCosign('v1.2.0')
    expect(fs.existsSync(cosign)).toBe(true)
  }, 100000)

  it('get latest version of cosign', async () => {
    const cosign = await installer.getCosign('latest')
    expect(fs.existsSync(cosign)).toBe(true)
  }, 100000)
})
