export interface ChangePassReq {

    currentPassword: string
    newPassword: string
    confirmPassword: string

}

export interface ChangePassRes {
    status: boolean
    code: number
    message: string
}