import {
    Directive,
    ElementRef,
    Renderer2,
    HostListener,
    Input,
} from '@angular/core';

@Directive({
    selector: '[appHoverElement]',
    standalone: true,
})
export class HoverDirectiveForElement {

    constructor(
        private el: ElementRef<HTMLElement>,
        private renderer: Renderer2
    ) { }

    @HostListener('mouseenter')
    @HostListener('focusin')
    onEnter() {
        this.applyHighlight(true);
    }

    @HostListener('mouseleave')
    @HostListener('focusout')
    onLeave() {
        this.applyHighlight(false);
    }

    private applyHighlight(active: boolean) {
        if (active) {
            this.renderer.addClass(this.el.nativeElement, 'app-hover-hl');
        } else {
            this.renderer.removeClass(this.el.nativeElement, 'app-hover-hl');
        }
    }
}
