export interface EditAddressReq {
  title: string
  isPrimary: boolean
  city: string
  street: string
  phone: string
  latitude: number
  longitude: number
}

export interface EditAddressRes {
  status: boolean
  code: number
  payload: SingleAddressPayload
}

export interface SingleAddressPayload {
  address: Address
}

export interface Address {
  id: string
  userId: string
  title: string
  isPrimary: boolean
  city: string
  street: string
  phone: string
  latitude: string
  longitude: string
  createdAt: string
  updatedAt: string
}
