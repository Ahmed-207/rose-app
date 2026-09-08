import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl as AngularFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FormControlComponent } from './form-control';

const noop = () => {
    // intentional no-op for mock translate service subscriptions
};

const mockTranslateService = {
    get: () => ({ subscribe: noop }),
    instant: (key: string) => key,
    onLangChange: { subscribe: noop },
    onTranslationChange: { subscribe: noop },
};

describe('FormControlComponent', () => {
    let component: FormControlComponent;
    let fixture: ComponentFixture<FormControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormControlComponent],
            providers: [{ provide: TranslateService, useValue: mockTranslateService }],
        }).compileComponents();

        fixture = TestBed.createComponent(FormControlComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should support boundControl input', () => {
        const control = new AngularFormControl('test');
        component.boundControl = control;
        expect(component.control).toBe(control);
    });

    it('should fallback to ngControl when boundControl is not provided', () => {
        expect(component.control).toBeNull();
    });

    it('should support file type in union', () => {
        component.type = 'file';
        expect(component.type).toBe('file');
    });
});
