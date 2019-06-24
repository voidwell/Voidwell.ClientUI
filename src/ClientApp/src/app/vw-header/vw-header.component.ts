import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { NavMenuService } from './../shared/services/nav-menu.service';
import { SearchService } from './../shared/services/search.service';
import { VoidwellAuthService } from './../shared/services/voidwell-auth.service';
import { IAppState } from './../app.component';
import * as dynamics from 'dynamics.js';
import * as tinycolor from 'tinycolor2';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.template.html',
    styleUrls: ['./vw-header.styles.css']
})

export class VWHeaderComponent implements OnInit, OnDestroy {
    userState: Observable<any>;
    isLoggedIn: boolean = false;
    userName: string;
    userRoles: Array<string>;
    logoTimeout: any;

    constructor(public navMenuService: NavMenuService, public searchService: SearchService, private authService: VoidwellAuthService, private ngRedux: NgRedux<IAppState>) {
    }

    ngOnInit() {
        let self = this;
        
        this.userState = this.ngRedux.select('loggedInUser');
        this.userState.subscribe(user => {
            if (user) {
                this.isLoggedIn = user.isLoggedIn;
                if (user.user) {
                    this.userName = user.user.profile.name || '';
                }
                if (user.roles) {
                    this.userRoles = user.roles || [];
                }
            }
        });

        setTimeout(function() {
            self.animateCrazyLogo();
            //this.logoAnimationLoop();
        }, 3000);

        document.querySelector('#header-logo').addEventListener('mouseover', function() {
            self.animateCrazyLogo();
        });
    }

    signIn(): any {
        this.authService.signIn();
    }

    signOut(): any {
        this.authService.signOut();
    }

    canAccessAdmin(): boolean {
        return this.hasRoles(['Administrator', 'SuperAdmin', 'Blog', 'Events', 'PSB']);
    }

    hasRoles(roles: string[]): boolean {
        if (roles == null) {
            return true;
        }

        for (let i = 0; i < roles.length; i++) {
            if (this.hasRole(roles[i])) {
                return true;
            }
        }

        return false;
    }

    hasRole(role: string): boolean {
        if (this.userRoles && this.userRoles.indexOf(role) > -1) {
            return true;
        }

        return false;
    }
    
    focusSearch(event: MouseEvent) {
        event.stopPropagation();
        this.searchService.focusSearch()
    }

    public toggleNav() {
        this.navMenuService.toggle();
    }

    private logoAnimationLoop() {
        let self = this;
        this.logoTimeout = setTimeout(function() {
            self.animateCrazyLogo();
            self.logoAnimationLoop();
        }, 100 + Math.random() * 5000);
    };

    animateCrazyLogo() {
        let el = document.querySelector('#header-logo');
        let box = el.getBoundingClientRect();
        let count = 8 + Math.random() * 10;
        let masks = this.createMasksWithStripes(count, box, Math.round(100 / count));
        let clonedEls = [];
    
        for (let i = 0; i < masks.length; i++) {
            let clonedEl = this.cloneAndStripeElement(el, masks[i], document.body);
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
                document.body.removeChild(clonedEl);
            }, d + 150);
        };
    
        for (let _i3 = 0; _i3 < clonedEls.length; _i3++) {
            _loop3(_i3);
        }
    }

    private totalMaskIdx = 0;
    createMasksWithStripes(count, box, averageHeight=10) {
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

    cloneAndStripeElement(element, clipPathName, parent) {
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
            left: Math.round(box.left + window.scrollX),
            top: Math.round(box.top + window.scrollY),
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

    createSvgChildEl(template) {
        return this.createSvgEl(template).firstChild;
    }

    createSvgEl(template) {
        let el = this.createEl(`
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${template.trim()}</svg>
        `);
        return el;
    }

    createEl(template) {
        let el = document.createElement('div');
        el.innerHTML = template.trim();
        return el.firstChild;
    }

    ngOnDestroy() {
        if (this.logoTimeout) clearTimeout(this.logoTimeout);
    }
}