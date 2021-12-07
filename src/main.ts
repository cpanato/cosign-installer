import * as installer from './installer'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {dirname} from 'path'

async function run(): Promise<void> {
  try {
    const version = core.getInput('version') || 'latest'
    const args = core.getInput('args')
    const workdir = core.getInput('workdir') || '.'
    const isInstallOnly = /^true$/i.test(core.getInput('install-only'))
    const cosign = await installer.getCosign(version)
    core.info(`Cosign ${version} installed successfully`)

    if (isInstallOnly) {
      const cosignDir = dirname(cosign)
      core.addPath(cosignDir)
      core.debug(`Added ${cosignDir} to PATH`)

      return
    } else if (!args) {
      core.setFailed('args input required')

      return
    }

    if (workdir && workdir !== '.') {
      core.info(`Using ${workdir} as working directory`)
      process.chdir(workdir)
    }

    await exec.exec(`${cosign} ${args}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
