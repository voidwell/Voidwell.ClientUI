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
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/debounceTime");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/startWith");
require("rxjs/add/operator/map");
require("rxjs/add/observable/fromEvent");
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var BlogComponent = (function () {
    function BlogComponent(api, dialog) {
        this.api = api;
        this.dialog = dialog;
        this.blogPosts = [];
    }
    BlogComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.dataSource = new TableDataSource(this.blogPosts, this.paginator);
        this.getBlogPostsRequest = this.api.getAllBlogPosts()
            .subscribe(function (blogPosts) {
            _this.blogPosts = blogPosts;
            _this.dataSource = new TableDataSource(_this.blogPosts, _this.paginator);
            _this.isLoading = false;
        });
    };
    BlogComponent.prototype.newPost = function () {
        var _this = this;
        var dialogRef = this.dialog.open(BlogEditorDialog);
        dialogRef.afterClosed().subscribe(function (result) {
            _this.blogPosts.push(result);
        });
    };
    BlogComponent.prototype.onEdit = function (entry) {
        var dialogRef = this.dialog.open(BlogEditorDialog, {
            data: {
                entry: entry
            }
        });
        dialogRef.afterClosed().subscribe(function (result) {
        });
    };
    return BlogComponent;
}());
__decorate([
    core_1.ViewChild(material_1.MatPaginator),
    __metadata("design:type", material_1.MatPaginator)
], BlogComponent.prototype, "paginator", void 0);
BlogComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-blog',
        templateUrl: './blog.template.html',
        styleUrls: ['./blog.styles.css']
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, material_1.MatDialog])
], BlogComponent);
exports.BlogComponent = BlogComponent;
var TableDataSource = (function (_super) {
    __extends(TableDataSource, _super);
    function TableDataSource(data, paginator) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.paginator = paginator;
        return _this;
    }
    TableDataSource.prototype.connect = function () {
        var _this = this;
        var first = Observable_1.Observable.of(this.data);
        return Observable_1.Observable.merge(first, this.paginator.page).map(function () {
            if (_this.data == null || _this.data.length == 0) {
                return [];
            }
            var data = _this.data.slice();
            var startIndex = _this.paginator.pageIndex * _this.paginator.pageSize;
            return data.splice(startIndex, _this.paginator.pageSize);
        });
    };
    TableDataSource.prototype.disconnect = function () { };
    return TableDataSource;
}(collections_1.DataSource));
exports.TableDataSource = TableDataSource;
var BlogEditorDialog = (function () {
    function BlogEditorDialog(dialogRef, api, data) {
        this.dialogRef = dialogRef;
        this.api = api;
        this.data = data;
        this.updateList = false;
        this.errorMessage = null;
        this.entry = {
            title: null,
            content: null
        };
        if (this.data && this.data.entry) {
            this.entry = Object.assign({}, this.data.entry);
        }
    }
    BlogEditorDialog.prototype.onSaveBlogPost = function (blogPost) {
        var _this = this;
        if (blogPost.id) {
            this.api.updateBlogPost(blogPost)
                .subscribe(function (result) {
                _this.entry = result;
                Object.assign(_this.data.entry, result);
            });
        }
        else {
            this.api.createBlogPost(blogPost)
                .subscribe(function (result) {
                _this.entry = result;
                _this.updateList = true;
            });
        }
    };
    BlogEditorDialog.prototype.onDeleteBlogPost = function (blogPost) {
        var _this = this;
        this.api.deleteBlogPost(blogPost.id)
            .subscribe(function (result) {
            _this.closeDialog();
        });
    };
    BlogEditorDialog.prototype.closeDialog = function () {
        if (this.updateList) {
            this.dialogRef.close(this.entry);
        }
        else {
            this.dialogRef.close();
        }
    };
    BlogEditorDialog.prototype.onNoClick = function () {
        this.dialogRef.close();
    };
    return BlogEditorDialog;
}());
BlogEditorDialog = __decorate([
    core_1.Component({
        selector: 'blog-editor-dialog',
        templateUrl: 'blog-editor-dialog.html',
    }),
    __param(2, core_1.Inject(material_1.MAT_DIALOG_DATA)),
    __metadata("design:paramtypes", [material_1.MatDialogRef, voidwell_api_service_1.VoidwellApi, Object])
], BlogEditorDialog);
exports.BlogEditorDialog = BlogEditorDialog;
