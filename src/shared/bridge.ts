import type { WorkerRequest, WorkerResponse } from './messages'

export function callWorker<T>(msg: WorkerRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (res: WorkerResponse<T>) => {
      const last = chrome.runtime.lastError
      if (last) {
        reject(new Error(last.message))
        return
      }
      if (!res?.ok) {
        reject(new Error(res?.error || 'Request failed'))
        return
      }
      resolve(res.data)
    })
  })
}
