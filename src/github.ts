import * as httpm from '@actions/http-client'
import * as core from '@actions/core'
import * as semver from 'semver'

export interface GitHubRelease {
  id: number
  tag_name: string
}

export const getRelease = async (
  version: string
): Promise<GitHubRelease | null> => {
  const resolvedVersion: string = (await resolveVersion(version)) || version
  const url: string = `https://github.com/sigstore/cosign/releases/${resolvedVersion}`
  const http: httpm.HttpClient = new httpm.HttpClient('cosign-installer')
  return (await http.getJson<GitHubRelease>(url)).result
}

const resolveVersion = async (version: string): Promise<string | null> => {
  const allTags: Array<string> | null = await getAllTags()
  if (!allTags) {
    throw new Error(`Cannot find cosign tags`)
  }
  core.debug(`Found ${allTags.length} tags in total`)

  if (version === 'latest') {
    return semver.maxSatisfying(allTags, version)
  }

  const cleanTags: Array<string> = allTags.map(tag => cleanTag(tag))
  const cleanVersion: string = cleanTag(version)
  return semver.maxSatisfying(cleanTags, cleanVersion)
}

interface GitHubTag {
  ref: string
}

const getAllTags = async (): Promise<Array<string>> => {
  const http: httpm.HttpClient = new httpm.HttpClient('cosign-installer')
  const url: string = `https://api.github.com/repos/sigstore/cosign/git/refs/tags?per_page=100`
  const getTags = http.getJson<Array<GitHubTag>>(url)

  return getTags.then(response => {
    if (response.result == null) {
      return []
    }

    return response.result.map(obj => obj.ref)
  })
}

const cleanTag = (tag: string): string => {
  return tag.replace('refs/tags/', '')
}
