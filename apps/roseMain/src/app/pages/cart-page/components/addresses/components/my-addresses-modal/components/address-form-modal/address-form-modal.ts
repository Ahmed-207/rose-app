import { Component, computed, inject, OnInit, input, output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideArrowLeft, LucideLocate } from '@lucide/angular';
import { addressStore } from '@org/user-addresses';
import { Address, EditAddressReq } from '@org/user-addresses';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AddressFormMode } from '../../../../types/address-form-mode';
import { Stepper } from '../../../../../stepper/stepper';

@Component({
  selector: 'address-form-modal',
  imports: [ReactiveFormsModule, LucideArrowLeft, LucideLocate, Stepper, GoogleMap, MapMarker, TranslatePipe],
  templateUrl: './address-form-modal.html',
  styleUrl: './address-form-modal.css',
})
export class AddressFormModal implements OnInit {

  mode = input.required<AddressFormMode>();
  seedData = input<Address | null>(null);
  formClosed = output<void>();
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  readonly _store = inject(addressStore);
  readonly totalSteps = 2;
  currentStep: WritableSignal<number> = signal(1);
  readonly coordinates: WritableSignal<{ lat: string; lng: string }> = signal({ lat: '', lng: '' });

  readonly mapCenter = computed<google.maps.LatLngLiteral>(() => {
    const latStr = this.coordinates().lat;
    const lngStr = this.coordinates().lng;
    if (latStr && lngStr) {
      return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
    }
    return { lat: 30.0444, lng: 31.2357 };
  });

  readonly mapZoom = signal<number>(14);
  readonly isLocating: WritableSignal<boolean> = signal(false);
  readonly locationError: WritableSignal<string | null> = signal(null);

  // Translation KEYS, resolved in the template via | translate
  readonly modalTitle = computed(() =>
    this.mode() === 'add' ? 'addresses.ADD_NEW_ADDRESS_TITLE' : 'addresses.UPDATE_ADDRESS_INFO'
  );

  readonly primaryCtaLabel = computed(() =>
    this.currentStep() === 1 ? 'addresses.NEXT' : 'addresses.ADD_ADDRESS'
  );

  addressForm = this.fb.group({
    title: ['', Validators.required],
    isPrimary: [false],
    city: ['', Validators.required],
    street: ['', Validators.required],
    phone: ['', Validators.required],
  });

  ngOnInit(): void {
    const seed = this.seedData();
    if (this.mode() === 'edit' && seed) {
      this.addressForm.patchValue({
        title: seed.title,
        isPrimary: seed.isPrimary,
        city: seed.city,
        street: seed.street,
        phone: seed.phone,
      });

      this.coordinates.set({ lat: seed.latitude.toString(), lng: seed.longitude.toString() });
    }
  }

  onStepperNodeClick(step: number): void {
    this.currentStep.set(step);
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.addressForm.invalid) {
        this.addressForm.markAllAsTouched();
        return;
      }
      this.currentStep.set(2);
      return;
    }

    this.submitAddress();
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  closeForm(): void {
    this.formClosed.emit();
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.coordinates.set({
        lat: event.latLng.lat().toString(),
        lng: event.latLng.lng().toString()
      });
    }
  }

  private submitAddress(): void {
    const formValue = this.addressForm.getRawValue();
    const { lat, lng } = this.coordinates();

    const payload: EditAddressReq = {
      title: formValue.title!,
      isPrimary: formValue.isPrimary!,
      city: formValue.city!,
      street: formValue.street!,
      phone: formValue.phone!,
      latitude: lat ? parseFloat(lat) : 0,
      longitude: lng ? parseFloat(lng) : 0,
    };

    if (this.mode() === 'add') {
      this._store.addAddress(payload);
    } else {
      const seed = this.seedData();
      if (seed) {
        this._store.updateAddress({ id: seed.id, changes: payload });
      }
    }

    this.closeForm();
  }

  findMyLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set(this.translate.instant('addresses.GEOLOCATION_NOT_SUPPORTED'));
      return;
    }

    this.isLocating.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.coordinates.set({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
        });
        this.isLocating.set(false);
      },
      () => {
        this.locationError.set(this.translate.instant('addresses.GEOLOCATION_ERROR'));
        this.isLocating.set(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
}