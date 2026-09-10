import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { DynamicFormComponent } from './dynamic-form';
import { DynamicFormField } from './dynamic-form.types';

describe('DynamicFormComponent', () => {
    let fixture: ComponentFixture<DynamicFormComponent>;
    let component: DynamicFormComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DynamicFormComponent],
            providers: [provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
        }).compileComponents();

        fixture = TestBed.createComponent(DynamicFormComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should render fields and emit values on submit', () => {
        const submitted = vi.fn();
        component.submitted.subscribe(submitted);

        const fields: DynamicFormField[] = [
            { name: 'title', type: 'text', label: 'Title', required: true },
            { name: 'price', type: 'number', label: 'Price', required: true },
        ];

        component.fields = fields;
        component.initialValue = { title: 'Rose', price: 100 };
        fixture.detectChanges();

        expect(component.form.controls['title'].value).toBe('Rose');
        expect(component.form.controls['price'].value).toBe(100);

        component.submit();
        expect(submitted).toHaveBeenCalledWith({ title: 'Rose', price: 100 });
    });

    it('should not emit submitted while the form is invalid', () => {
        const submitted = vi.fn();
        component.submitted.subscribe(submitted);

        component.fields = [
            {
                name: 'title',
                type: 'text',
                label: 'Title',
                required: true,
                validators: [Validators.required],
            },
        ];
        fixture.detectChanges();

        expect(component.form.invalid).toBe(true);
        expect(component.submit()).toBe(false);
        expect(submitted).not.toHaveBeenCalled();
    });

    it('should pass options to select fields', () => {
        const fields: DynamicFormField[] = [
            {
                name: 'category',
                type: 'select',
                label: 'Category',
                options: [{ id: '1', name: 'Roses' }],
                optionLabel: 'name',
                optionValue: 'id',
            },
        ];

        component.fields = fields;
        fixture.detectChanges();

        expect(component.form.contains('category')).toBe(true);
    });

    it('should conditionally hide and disable fields', () => {
        const fields: DynamicFormField[] = [
            { name: 'hasDiscount', type: 'checkbox', label: 'Has Discount' },
            {
                name: 'discountValue',
                type: 'number',
                label: 'Discount Value',
                visibleWhen: (values) => !!values['hasDiscount'],
            },
        ];

        component.fields = fields;
        fixture.detectChanges();

        const discountControl = component.form.controls['discountValue'];
        expect(discountControl.disabled).toBe(true);

        component.form.controls['hasDiscount'].setValue(true);
        fixture.detectChanges();

        expect(discountControl.enabled).toBe(true);
    });


});
