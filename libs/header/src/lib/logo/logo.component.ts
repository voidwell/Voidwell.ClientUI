import { Component, ElementRef, OnDestroy,OnInit, ViewChild } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as dynamics from 'dynamics.js';
import tinycolor from 'tinycolor2';

@Component({
    selector: 'vw-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.styles.css']
})

export class LogoComponent implements OnInit, OnDestroy {
    @ViewChild('logowrapper', { static: true }) logoElement!: ElementRef;
    @ViewChild('effectwrapper', { static: true }) effectElement!: ElementRef;

    logoTimeout: any;

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
        }, 100 + Math.random() * 500);
    };

    private animateCrazyLogo() {
        const el = this.logoElement.nativeElement;
        const box = el.getBoundingClientRect();
        const count = 8 + Math.random() * 10;
        const masks = this.createMasksWithStripes(count, box, Math.round(100 / count));
        const clonedEls: any[] = [];
    
        for (let i = 0; i < masks.length; i++) {
            const clonedEl = this.cloneAndStripeElement(el, masks[i], this.effectElement.nativeElement);
            const path = clonedEl.querySelector('path');
            const _color2 = tinycolor('hsl(' + Math.round(Math.random() * 360) + ', 80%, 65%)');
            dynamics.css(path, {
                fill: _color2.toRgbString()
            });
            clonedEls.push(clonedEl);
        }
    
        const _loop3 = (_i3: any) => {
            const clonedEl = clonedEls[_i3];
            const d = Math.random() * 100;
    
            setTimeout(function () {
                clonedEl.style.display = '';
                dynamics.css(clonedEl, {
                translateX: Math.random() * 100 - 50
                });
            }, d);
        
            setTimeout(function () {
                dynamics.css(clonedEl, {
                translateX: Math.random() * 20 - 10
                });
            }, d + 50);
        
            setTimeout(function () {
                dynamics.css(clonedEl, {
                translateX: Math.random() * 5 - 2.5
                });
            }, d + 100);

            setTimeout(() => {
                this.effectElement.nativeElement.removeChild(clonedEl);
            }, d + 150);
        };
    
        for (let _i3 = 0; _i3 < clonedEls.length; _i3++) {
            _loop3(_i3);
        }
    }

    private totalMaskIdx = 0;
    private createMasksWithStripes(count: number, box: any, averageHeight: number = 10) {
        const masks: any[] = [];
        for (let i = 0; i < count; i++) {
          masks.push([]);
        }
        const maskNames: any[] = [];
        for (let i = this.totalMaskIdx; i < this.totalMaskIdx + masks.length; i++) {
          maskNames.push(`clipPath${i}`);
        }
        this.totalMaskIdx += masks.length;
        let maskIdx = 0;
        let x = 0;
        let y = 0;
        let stripeHeight = averageHeight;

        do {
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
        } while (y < box.height)

        masks.forEach((rects, i) => {
            const el = this.createSvgChildEl(`<clipPath id="${maskNames[i]}">
                <path d="${rects.join(' ')}" fill="white"></path>
            </clipPath>`);
            document.querySelector('#clip-paths g')!.appendChild(el!);
        });
        
          return maskNames;
    }

    private cloneAndStripeElement(element: any, clipPathName: any, parent: any) {
        const el = element.cloneNode(true);
        let box = element.getBoundingClientRect();
        const parentBox = parent.getBoundingClientRect();
        box = {
            top: box.top - parentBox.top,
            left: box.left - parentBox.left,
            width: box.width,
            height: box.height
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
        el.style['-webkit-clip-path'] = clipPathUrl;
        el.style['clip-path'] = clipPathUrl;
      
        return el;
    }

    private createSvgChildEl(template: any) {
        return this!.createSvgEl(template)!.firstChild;
    }

    private createSvgEl(template: any) {
        const el = this.createEl(`
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${template.trim()}</svg>
        `);
        return el;
    }

    private createEl(template: any) {
        const el = document.createElement('div');
        el.innerHTML = template.trim();
        return el.firstChild;
    }

    ngOnDestroy() {
        if (this.logoTimeout) clearTimeout(this.logoTimeout);
    }
}