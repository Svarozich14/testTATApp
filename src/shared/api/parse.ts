export type ApiRejected = { status: number; body: unknown | null }

export async function readRejectedResponse(e: unknown): Promise<ApiRejected> {
  if (e instanceof Response) {
    const body = await e.json().catch(() => null)
    return { status: e.status, body }
  }
  throw e
}

export async function readJson<T>(resp: Response): Promise<T> {
  return (await resp.json()) as T
}

