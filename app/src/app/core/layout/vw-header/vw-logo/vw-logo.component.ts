import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import dynamics from 'dynamics.js';
import tinycolor from 'tinycolor2';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'vw-logo',
    templateUrl: './vw-logo.component.html',
    styleUrls: ['./vw-logo.component.css']
})

export class VWLogoComponent implements OnInit, OnDestroy {
    @ViewChild('logowrapper', { static: true }) logoElement: ElementRef<HTMLElement>;
    @ViewChild('effectwrapper', { static: true }) effectElement: ElementRef<HTMLElement>;

    logoTimeout: ReturnType<typeof setTimeout>;

    ngOnInit() {

        setTimeout(() => {
            this.animateCrazyLogo();
            //this.logoAnimationLoop();
        }, 3000);

        this.logoElement.nativeElement.addEventListener('mouseover', () => {
            this.animateCrazyLogo();
        });
    }

    private logoAnimationLoop() {
        this.logoTimeout = setTimeout(() => {
            this.animateCrazyLogo();
            this.logoAnimationLoop();
        }, 100 + Math.random() * 5000);
    };

    private animateCrazyLogo() {
        const el = this.logoElement.nativeElement;
        const box = el.getBoundingClientRect();
        const count = 8 + Math.random() * 10;
        const masks = this.createMasksWithStripes(count, box, Math.round(100 / count));
        const clonedEls: HTMLElement[] = [];
    
        for (let i = 0; i < masks.length; i++) {
            const clonedEl = this.cloneAndStripeElement(el, masks[i], this.effectElement.nativeElement);
            const path = clonedEl.querySelector('path');
            const _color2 = tinycolor('hsl(' + Math.round(Math.random() * 360) + ', 80%, 65%)');
            dynamics.css(path, {
                fill: _color2.toRgbString()
            });
            clonedEls.push(clonedEl);
        }
    
        const _loop3 = (_i3: number) => {
            const clonedEl = clonedEls[_i3];
            const d = Math.random() * 100;
    
            setTimeout(() => {
                clonedEl.style.display = '';
                dynamics.css(clonedEl, {
                translateX: Math.random() * 100 - 50
                });
            }, d);
        
            setTimeout(() => {
                dynamics.css(clonedEl, {
                translateX: Math.random() * 20 - 10
                });
            }, d + 50);
        
            setTimeout(() => {
                dynamics.css(clonedEl, {
                translateX: Math.random() * 5 - 2.5
                });
            }, d + 100);

            setTimeout(() => {
                clonedEl.remove();
            }, d + 150);
        };
    
        for (let _i3 = 0; _i3 < clonedEls.length; _i3++) {
            _loop3(_i3);
        }
    }

    private totalMaskIdx = 0;
    private createMasksWithStripes(count: number, box: { width: number; height: number }, averageHeight = 10): string[] {

        const masks: string[][] = [];
        for (let i = 0; i < count; i++) {
          masks.push([]);
        }
        const maskNames: string[] = [];
        for (let i = this.totalMaskIdx; i < this.totalMaskIdx + masks.length; i++) {
          maskNames.push(`clipPath${i}`);
        }
        this.totalMaskIdx += masks.length;
        let maskIdx = 0;
        let x = 0;
        let y = 0;
        let stripeHeight = averageHeight;
        while(true) {
            const w = Math.max(stripeHeight * 10, Math.round(Math.random() * box.width));
            masks[maskIdx].push(`
                M ${x},${y} L ${x + w},${y} L ${x + w},${y + stripeHeight} L ${x},${y + stripeHeight} Z
            `);
        
            maskIdx += 1;
            if (maskIdx >= masks.length) {
                maskIdx = 0;
            }
        
            x += w;
            if (x > box.width) {
                x = 0;
                y += stripeHeight;
                stripeHeight = Math.round(Math.random() * averageHeight + averageHeight / 2);
            }
            if (y >= box.height) {
                break;
            }
        }

        masks.forEach((rects, i) => {
            const el = this.createSvgChildEl(`<clipPath id="${maskNames[i]}">
                <path d="${rects.join(' ')}" fill="white"></path>
            </clipPath>`);
            document.querySelector('#clip-paths g').appendChild(el);
        });
        
          return maskNames;
    }

    private cloneAndStripeElement(element: HTMLElement, clipPathName: string, parent: HTMLElement): HTMLElement {
        const el = element.cloneNode(true) as HTMLElement;
        const elementBox = element.getBoundingClientRect();
        const parentBox = parent.getBoundingClientRect();
        const box = {
            top: elementBox.top - parentBox.top,
            left: elementBox.left - parentBox.left,
            width: elementBox.width,
            height: elementBox.height
        };
        const style = window.getComputedStyle(element);
      
        dynamics.css(el, {
            position: 'absolute',
            left: Math.round(box.left),
            top: Math.round(box.top),
            width: Math.ceil(box.width),
            height: Math.ceil(box.height),
            display: 'none',
            pointerEvents: 'none',
            background: '#1e2a31',
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            color: style.color,
            textDecoration: style.textDecoration,
            'z-index': 1000
        });
        parent.appendChild(el);
        const clipPathUrl = `url(${window.location.href}#${clipPathName})`;
        el.style.setProperty('-webkit-clip-path', clipPathUrl);
        el.style.setProperty('clip-path', clipPathUrl);
      
        return el;
    }

    private createSvgChildEl(template: string) {
        return this.createSvgEl(template).firstChild;
    }

    private createSvgEl(template: string) {
        const el = this.createEl(`
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${template.trim()}</svg>
        `);
        return el;
    }

    private createEl(template: string) {
        const el = document.createElement('div');
        el.innerHTML = template.trim();
        return el.firstChild;
    }

    ngOnDestroy() {
        if (this.logoTimeout) clearTimeout(this.logoTimeout);
    }
}