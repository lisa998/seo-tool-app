import {handlers} from './handlers'

export const server = setupServer(...handlers)
export {handlers}