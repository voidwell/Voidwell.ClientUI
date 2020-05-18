import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import * as dynamics from 'dynamics.js';
import * as tinycolor from 'tinycolor2';

@Component({
    selector: 'vw-logo',
    templateUrl: './vw-logo.template.html',
    styleUrls: ['./vw-logo.styles.css']
})

export class VWLogoComponent implements OnInit, OnDestroy {
    @ViewChild('logowrapper', { static: true }) logoElement: ElementRef;
    @ViewChild('effectwrapper', { static: true }) effectElement: ElementRef;

    logoTimeout: any;

    ngOnInit() {
        let self = this;

        setTimeout(function() {
            self.animateCrazyLogo();
            //self.logoAnimationLoop();
        }, 3000);

        this.logoElement.nativeElement.addEventListener('mouseover', function() {
            self.animateCrazyLogo();
        });
    }

    private logoAnimationLoop() {
        let self = this;
        this.logoTimeout = setTimeout(function() {
            self.animateCrazyLogo();
            self.logoAnimationLoop();
        }, 100 + Math.random() * 5000);
    };

    private animateCrazyLogo() {
        let self = this;
        let el = this.logoElement.nativeElement;
        let box = el.getBoundingClientRect();
        let count = 8 + Math.random() * 10;
        let masks = this.createMasksWithStripes(count, box, Math.round(100 / count));
        let clonedEls = [];
    
        for (let i = 0; i < masks.length; i++) {
            let clonedEl = this.cloneAndStripeElement(el, masks[i], this.effectElement.nativeElement);
            let path = clonedEl.querySelector('path');
            let _color2 = tinycolor('hsl(' + Math.round(Math.random() * 360) + ', 80%, 65%)');
            dynamics.css(path, {
                fill: _color2.toRgbString()
            });
            clonedEls.push(clonedEl);
        }
    
        let _loop3 = function _loop3(_i3) {
            let clonedEl = clonedEls[_i3];
            let d = Math.random() * 100;
    
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

            setTimeout(function () {
                self.effectElement.nativeElement.removeChild(clonedEl);
            }, d + 150);
        };
    
        for (let _i3 = 0; _i3 < clonedEls.length; _i3++) {
            _loop3(_i3);
        }
    }

    private totalMaskIdx = 0;
    private createMasksWithStripes(count, box, averageHeight=10) {
        let self = this;

        let masks = [];
        for (let i = 0; i < count; i++) {
          masks.push([]);
        }
        let maskNames = [];
        for (let i = this.totalMaskIdx; i < this.totalMaskIdx + masks.length; i++) {
          maskNames.push(`clipPath${i}`);
        }
        this.totalMaskIdx += masks.length;
        let maskIdx = 0;
        let x = 0;
        let y = 0;
        let stripeHeight = averageHeight;
        while(true) {
            let w = Math.max(stripeHeight * 10, Math.round(Math.random() * box.width));
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

        masks.forEach(function(rects, i) {
            let el = self.createSvgChildEl(`<clipPath id="${maskNames[i]}">
                <path d="${rects.join(' ')}" fill="white"></path>
            </clipPath>`);
            document.querySelector('#clip-paths g').appendChild(el);
        });
        
          return maskNames;
    }

    private cloneAndStripeElement(element, clipPathName, parent) {
        let el = element.cloneNode(true);
        let box = element.getBoundingClientRect();
        let parentBox = parent.getBoundingClientRect();
        box = {
            top: box.top - parentBox.top,
            left: box.left - parentBox.left,
            width: box.width,
            height: box.height
        };
        let style = window.getComputedStyle(element);
      
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
        let clipPathUrl = `url(${window.location.href}#${clipPathName})`;
        el.style['-webkit-clip-path'] = clipPathUrl;
        el.style['clip-path'] = clipPathUrl;
      
        return el;
    }

    private createSvgChildEl(template) {
        return this.createSvgEl(template).firstChild;
    }

    private createSvgEl(template) {
        let el = this.createEl(`
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${template.trim()}</svg>
        `);
        return el;
    }

    private createEl(template) {
        let el = document.createElement('div');
        el.innerHTML = template.trim();
        return el.firstChild;
    }

    ngOnDestroy() {
        if (this.logoTimeout) clearTimeout(this.logoTimeout);
    }
}