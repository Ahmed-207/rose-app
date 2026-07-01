export interface TestmonialRes {
    status: boolean
    code: number
    payload: Payload
}

export interface Payload {
    data: Testmonial[]
    metadata: Metadata
}

export interface Testmonial {
    id: string
    name: string
    email: string
    content: string
    rating: number
    image?: string
    isApproved: boolean
    immutable: boolean
    createdAt: string
    updatedAt: string
}

export interface Metadata {
    page: number
    limit: number
    total: number
    totalPages: number
}
