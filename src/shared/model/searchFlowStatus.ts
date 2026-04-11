export const SearchFlowStatuses = {
  Idle: 'idle',
  Loading: 'loading',
  Polling: 'polling',
  Success: 'success',
  Error: 'error',
} as const

export type SearchFlowStatus = (typeof SearchFlowStatuses)[keyof typeof SearchFlowStatuses]
