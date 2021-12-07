# cosign-installer GitHub Action

This action enables you to sign and verify container images using `cosign`.
`cosign-installer` verifies the integrity of the `cosign` release during installation.

For a quick start guide on the usage of `cosign`, please refer to https://github.com/sigstore/cosign#quick-start.
For available `cosign` releases, see https://github.com/sigstore/cosign/releases.

## Usage

Add the following entry to your Github workflow YAML file:

```yaml
uses: sigstore/cosign-installer@v1.3.1
with:
  cosign-release: 'v1.3.1' # optional
```

Example using a pinned version:

```yaml
jobs:
  test_cosign_action:
    runs-on: ubuntu-latest

    permissions:
      actions: none
      checks: none
      contents: none
      deployments: none
      issues: none
      packages: none
      pull-requests: none
      repository-projects: none
      security-events: none
      statuses: none

    name: Install Cosign and test presence in path
    steps:
      - name: Install Cosign
        uses: sigstore/cosign-installer@v2
        with:
          install-only: true
          version: 'v1.3.1'
      - name: Check install!
        run: cosign version
```

Example using the default version:

```yaml
jobs:
  test_cosign_action:
    runs-on: ubuntu-latest

    permissions:
      actions: none
      checks: none
      contents: none
      deployments: none
      issues: none
      packages: none
      pull-requests: none
      repository-projects: none
      security-events: none
      statuses: none

    name: Install Cosign and test presence in path
    steps:
      - name: Install Cosign
        uses: sigstore/cosign-installer@main
        with:
          install-only: true
      - name: Check install!
        run: cosign version
```

This action does not need any GitHub permission to run, however, if your workflow needs to update, create or perform any
action against your repository, then you should change the scope of the permission appropriately.

For example, if you are using the `gcr.io` as your registry to push the images you will need to give the `write` permission
to the `packages` scope.

Example of a simple workflow:

```yaml
jobs:
  test_cosign_action:
    runs-on: ubuntu-latest

    permissions:
      actions: none
      checks: none
      contents: read
      deployments: none
      issues: none
      packages: write
      pull-requests: none
      repository-projects: none
      security-events: none
      statuses: none
      id-token: write # needed for signing the images with GitHub OIDC **not production ready**

    name: Install Cosign and test presence in path
    steps:
      - uses: actions/checkout@master
        with:
          fetch-depth: 1

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v1
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - id: docker_meta
        uses: docker/metadata-action@v3.6.0
        with:
          images: ghcr.io/sigstore/sample-honk
          tags: type=sha,format=long

      - name: Build and Push container images
        uses: docker/build-push-action@v2
        with:
          platforms: linux/amd64,linux/arm/v7,linux/arm64
          push: true
          tags: ${{ steps.docker_meta.outputs.tags }}
          labels: ${{ steps.docker_meta.outputs.labels }}

      - name: Sign image with a key
        run: |
          echo ${COSIGN_KEY} > /tmp/my_cosign.key
        env:
          COSIGN_KEY: ${{secrets.COSIGN_KEY}}

      - name: Cosign sign
        uses: sigstore/cosign-installer@main
        with:
          args: sign --key /tmp/my_cosign.key ${TAGS}
        env:
          TAGS: ${{ steps.docker_meta.outputs.tags }}
          COSIGN_PASSWORD: ${{secrets.COSIGN_PASSWORD}}

      - name: Cosign sign
        uses: sigstore/cosign-installer@main
        with:
          args: sign --oidc-issuer https://token.actions.githubusercontent.com ${TAGS}
        env:
          TAGS: ${{ steps.docker_meta.outputs.tags }}
          COSIGN_EXPERIMENTAL: 1
```

## Customizing

### Inputs

Following inputs can be used as `step.with` keys

| Name             | Type    | Default      | Description                                                      |
|------------------|---------|--------------|------------------------------------------------------------------|
| `version`        | String  | `latest`     | `cosign` version to use instead of the default                   |
| `args`           | String  |              | Arguments to pass to cosign                                      |
| `workdir`        | String  | `.`          | Working directory (below repository root)                        |
| `install-only`   | Bool    | `false`      | Just install cosign                                              |

## Security

Should you discover any security issues, please refer to sigstores [security
process](https://github.com/sigstore/community/blob/main/SECURITY.md)


## Development

```
# format code and build javascript artifacts
docker buildx bake pre-checkin

# validate all code has correctly formatted and built
docker buildx bake validate

# run tests
docker buildx bake test
```
