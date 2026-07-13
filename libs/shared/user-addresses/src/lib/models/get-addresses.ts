import { Address } from "./edit-address"

export interface GetAddressesRes {
  status: boolean
  code: number
  payload: Payload
}

export interface Payload {
  addresses: Address[]
}
