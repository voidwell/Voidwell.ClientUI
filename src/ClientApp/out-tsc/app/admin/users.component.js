"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var collections_1 = require("@angular/cdk/collections");
var material_1 = require("@angular/material");
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/debounceTime");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/startWith");
require("rxjs/add/operator/map");
require("rxjs/add/observable/fromEvent");
var UsersComponent = (function () {
    function UsersComponent(api, dialog) {
        this.api = api;
        this.dialog = dialog;
        this.users = [];
        this.errorMessage = null;
        this.isLoading = false;
        this.isLoadingUsers = false;
        this.isLoadingRoles = false;
    }
    UsersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.dataSource = new TableDataSource(this.users, this.paginator);
        this.isLoadingUsers = true;
        this.getUsersRequest = this.api.getUsers()
            .subscribe(function (users) {
            _this.users = users;
            _this.dataSource = new TableDataSource(_this.users, _this.paginator);
            _this.isLoadingUsers = false;
            _this.updateLoading();
        });
        this.isLoadingRoles = true;
        this.getRolesRequest = this.api.getAllRoles()
            .subscribe(function (roles) {
            _this.roles = roles;
            _this.isLoadingRoles = false;
            _this.updateLoading();
        });
        this.updateLoading();
        Observable_1.Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(function () {
            if (!_this.dataSource) {
                return;
            }
            _this.dataSource.filter = _this.filter.nativeElement.value;
        });
    };
    UsersComponent.prototype.onEdit = function (user) {
        var dialogRef = this.dialog.open(UserEditorDialog, {
            data: {
                userId: user.id,
                roles: this.roles
            }
        });
        dialogRef.afterClosed().subscribe(function (result) {
            //Todo: save event after editing.
        });
    };
    UsersComponent.prototype.updateLoading = function () {
        this.isLoading = this.isLoadingRoles || this.isLoadingUsers;
    };
    UsersComponent.prototype.ngOnDestroy = function () {
        if (this.getUsersRequest) {
            this.getUsersRequest.unsubscribe();
        }
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    };
    return UsersComponent;
}());
__decorate([
    core_1.ViewChild(material_1.MatPaginator),
    __metadata("design:type", material_1.MatPaginator)
], UsersComponent.prototype, "paginator", void 0);
__decorate([
    core_1.ViewChild('filter'),
    __metadata("design:type", core_1.ElementRef)
], UsersComponent.prototype, "filter", void 0);
UsersComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-users',
        templateUrl: './users.template.html',
        styleUrls: ['./users.styles.css']
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, material_1.MatDialog])
], UsersComponent);
exports.UsersComponent = UsersComponent;
var TableDataSource = (function (_super) {
    __extends(TableDataSource, _super);
    function TableDataSource(data, paginator) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.paginator = paginator;
        _this._filterChange = new BehaviorSubject_1.BehaviorSubject('');
        return _this;
    }
    Object.defineProperty(TableDataSource.prototype, "filter", {
        get: function () { return this._filterChange.value; },
        set: function (filter) { this._filterChange.next(filter); },
        enumerable: true,
        configurable: true
    });
    TableDataSource.prototype.connect = function () {
        var _this = this;
        var first = Observable_1.Observable.of(this.data);
        return Observable_1.Observable.merge(first, this.paginator.page, this._filterChange).map(function () {
            if (_this.data == null || _this.data.length == 0) {
                return [];
            }
            var data = _this.data.slice();
            var filteredData = data.filter(function (item) {
                var searchStr = item.userName.toLowerCase();
                return searchStr.indexOf(_this.filter.toLowerCase()) != -1;
            });
            var startIndex = _this.paginator.pageIndex * _this.paginator.pageSize;
            return filteredData.splice(startIndex, _this.paginator.pageSize);
        });
    };
    TableDataSource.prototype.disconnect = function () { };
    return TableDataSource;
}(collections_1.DataSource));
exports.TableDataSource = TableDataSource;
var UserEditorDialog = (function () {
    function UserEditorDialog(dialogRef, api, data) {
        var _this = this;
        this.dialogRef = dialogRef;
        this.api = api;
        this.data = data;
        this.errorMessage = null;
        this.isLoading = true;
        this.api.getUser(this.data.userId)
            .subscribe(function (user) {
            _this.user = user;
            _this.isLoading = false;
        });
    }
    UserEditorDialog.prototype.setRoles = function (user, userRolesForm) {
        var _this = this;
        if (userRolesForm.pristine) {
            return;
        }
        this.errorMessage = null;
        user.isLocked = true;
        this.api.updateUserRoles(user.id, userRolesForm.value)
            .catch(function (error) {
            _this.errorMessage = error._body;
            userRolesForm.form.patchValue(user);
            return Observable_1.Observable.throw(error);
        })
            .finally(function () {
            user.isLocked = false;
            userRolesForm.form.markAsPristine();
        })
            .subscribe(function (updatedRoles) {
            user.roles = updatedRoles;
        });
    };
    UserEditorDialog.prototype.lockUser = function (user) {
        this.errorMessage = null;
        user.isLocked = true;
        var params = {
            IsPermanant: true,
            LockLength: 60
        };
        this.api.lockUser(this.data.userId, params)
            .subscribe(function () {
            user.isLocked = false;
        });
    };
    UserEditorDialog.prototype.unlockUser = function (user) {
        this.errorMessage = null;
        user.isLocked = true;
        this.api.unlockUser(this.data.userId)
            .subscribe(function () {
            user.isLocked = false;
        });
    };
    UserEditorDialog.prototype.closeDialog = function () {
        this.dialogRef.close();
    };
    UserEditorDialog.prototype.onNoClick = function () {
        this.dialogRef.close();
    };
    return UserEditorDialog;
}());
UserEditorDialog = __decorate([
    core_1.Component({
        selector: 'user-editor-dialog',
        templateUrl: 'user-editor-dialog.html',
    }),
    __param(2, core_1.Inject(material_1.MAT_DIALOG_DATA)),
    __metadata("design:paramtypes", [material_1.MatDialogRef, voidwell_api_service_1.VoidwellApi, Object])
], UserEditorDialog);
exports.UserEditorDialog = UserEditorDialog;
