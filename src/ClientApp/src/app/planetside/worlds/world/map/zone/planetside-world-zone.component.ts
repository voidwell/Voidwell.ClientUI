import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { PlanetsideWorldComponent } from './../../planetside-world.component';
import { WorldNamePipe } from './../../../../../shared/pipes/ps2/world-name.pipe';
import { ZoneNamePipe } from './../../../../../shared/pipes/ps2/zone-name.pipe';

@Component({
    templateUrl: './planetside-world-zone.template.html',
    styleUrls: ['./planetside-world-zone.styles.css']
})

export class PlanetsideWorldZoneComponent implements OnDestroy {
    private routeSub: Subscription;

    isLoading: boolean;
    errorMessage: string;
    worldId: string;
    zoneId: string;
    zone: any;

    mapUrl: SafeResourceUrl;
    frameId: string;

    constructor(public sanitizer: DomSanitizer, private worldNamePipe: WorldNamePipe, private zoneNamePipe: ZoneNamePipe, private route: ActivatedRoute, private parent: PlanetsideWorldComponent) {
        this.routeSub = this.route.params.subscribe(params => {
            //this.isLoading = true;
            this.zoneId = params['zoneId'];

            this.worldId = this.parent.worldId;

            this.mapUrl = this.getMapUrl();
            this.frameId = this.getFrameId();

            /*
            this.parent.getZoneState(this.zoneId)
                .catch(error => {
                    this.errorMessage = error._body
                    this.isLoading = false;
                    return Observable.throw(error);
                })
                .finally(() => {
                    this.isLoading = false;
                })
                .subscribe(zone => {
                    this.zone = zone;
                });
            */
        });
    }

    getFrameId() {
        let worldName = this.worldNamePipe.transform(this.worldId).toLowerCase();
        let zoneName = this.zoneNamePipe.transform(this.zoneId).toLowerCase();

        return worldName + "-" + zoneName + "-iframe";
    }

    getMapUrl() {
        let worldName = this.worldNamePipe.transform(this.worldId).toLowerCase();
        let zoneName = this.zoneNamePipe.transform(this.zoneId).toLowerCase();

        var url = "http://ps2maps.com/" + worldName + "/" + zoneName + "/embed";
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}