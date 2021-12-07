import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'
import * as github from './github'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

const osPlat: string = os.platform()
const osArch: string = os.arch()

export async function getCosign(version: string): Promise<string> {
  const release: github.GitHubRelease | null = await github.getRelease(version)
  if (!release) {
    throw new Error(`Cannot find cosign ${version} release`)
  }

  const cosignBinary = getCosignBinary()
  const downloadUrl = util.format(
    'https://github.com/sigstore/cosign/releases/download/%s/%s',
    release.tag_name,
    cosignBinary
  )

  core.info(`Downloading ${downloadUrl}`)
  const cosignBin: string = osPlat == 'win32' ? 'cosign.exe' : 'cosign'
  const destPath: string = path.join(
    release.tag_name.replace(/^v/, ''),
    cosignBin
  )
  const downloadPath: string = await tc.downloadTool(downloadUrl, destPath)
  core.info(`Downloaded to ${downloadPath}`)

  fs.chmodSync(downloadPath, '0755')

  const cachePath: string = await tc.cacheFile(
    downloadPath,
    cosignBin,
    'cosign',
    release.tag_name.replace(/^v/, '')
  )
  core.debug(`Cached to ${cachePath}`)

  const toolPath: string = tc.find('cosign', release.tag_name.replace(/^v/, ''))

  const exePath: string = path.join(toolPath, 'cosign')
  core.debug(`Exe path is ${exePath}`)

  return exePath
}

const getCosignBinary = (): string => {
  let arch: string
  switch (osArch) {
    case 'x64': {
      arch = 'amd64'
      break
    }
    case 'arm': {
      const arm_version = (process.config.variables as any).arm_version
      arch = arm_version ? 'armv' + arm_version : 'arm'
      break
    }
    default: {
      arch = osArch
      break
    }
  }
  if (osPlat == 'darwin') {
    arch = 'amd64'
  }
  const platform: string =
    osPlat == 'win32' ? 'windows' : osPlat == 'darwin' ? 'darwin' : 'linux'
  const ext: string = osPlat == 'win32' ? '.exe' : ''
  return util.format('cosign-%s-%s%s', platform, arch, ext)
}
