import * as github from '../src/github'

describe('github', () => {
  it('returns latest cosign GitHub release', async () => {
    const release = await github.getRelease('latest')
    expect(release).not.toBeNull()
    expect(release?.tag_name).not.toEqual('')
  })
  it('returns v1.3.0 cosign GitHub release', async () => {
    const release = await github.getRelease('v1.3.0')
    expect(release).not.toBeNull()
    expect(release?.tag_name).toEqual('v1.3.0')
  })
  it('returns v1.3.1 cosign GitHub release', async () => {
    const release = await github.getRelease('~> 1.3')
    expect(release).not.toBeNull()
    expect(release?.tag_name).toEqual('v1.3.1')
  })
})
