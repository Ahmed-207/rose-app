import { Address, SingleAddressPayload } from "./edit-address"

export interface GetAddressesRes {
  status: boolean
  code: number
  payload: Payload
}

export interface GetAddressRes {
  status: boolean
  code: number
  payload: SingleAddressPayload
}

export interface Payload {
  addresses: Address[]
}
