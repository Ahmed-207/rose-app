import { Address } from "@org/user-addresses";
import { AddressFormMode } from "../types/address-form-mode";

export interface AddressFormState {
    isOpen: boolean;
    mode: AddressFormMode;
    seed: Address | null;
}
