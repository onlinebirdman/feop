import httpClient from './httpClient'
import { handlePayload } from './utils/handlePayload'

export default async function pontFetch<Payload, Resp>(payload: Payload, config: FetchConfig): Promise<Resp['body']> {
  const {
    params,
    body,
  } = handlePayload(payload, config?.parameters || [])
  config.params = params
  config.data = body
  return httpClient({
    url: config.path,
    method: config.method.toUpperCase(),
    ...config,
  })
}
