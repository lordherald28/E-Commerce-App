import { provideZonelessChangeDetection } from '@angular/core';

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoverDirectiveForElement } from './hover.directive';

@Component({
    standalone: true,
    imports: [HoverDirectiveForElement],
    template: `<li appHoverElement>Item</li>`,
})
class TestHostComponent { }

describe('HoverDirectiveForElement', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let htmlElement: HTMLLIElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
            imports: [TestHostComponent],
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        htmlElement = fixture.nativeElement.querySelector('li') as HTMLLIElement;
    });

    it('debería añadir la clase', () => {
        htmlElement.dispatchEvent(new Event('mouseenter'));
        fixture.detectChanges();

        expect(htmlElement.classList.contains('app-hover-hl')).toBeTrue();
    });

    it('debería quitar la clase', () => {
        htmlElement.classList.add('app-hover-hl');
        htmlElement.dispatchEvent(new Event('mouseleave'));
        fixture.detectChanges();

        expect(htmlElement.classList.contains('app-hover-hl')).toBeFalse();
    });
});
