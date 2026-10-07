import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { BlogPost } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { BlogTableDataSource } from './blog.data-source';
import { BlogEditorDialog } from './blog-editor-dialog/blog-editor-dialog.component';

@Component({
    selector: 'voidwell-admin-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DatePipe]
})

export class BlogComponent implements OnInit {
    private postRepository = inject(PostRepository);
    private dialog = inject(MatDialog);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    errorMessage: string = null;
    blogPosts: BlogPost[] = [];
    isLoading: boolean;
    isCreating: boolean;
    getBlogPostsRequest: Subscription;
    dataSource: BlogTableDataSource;

    ngOnInit() {
        this.isLoading = true;
        this.dataSource = new BlogTableDataSource(this.blogPosts, this.paginator);

        this.getBlogPostsRequest = this.postRepository.getPosts()
            .subscribe(blogPosts => {
                this.blogPosts = blogPosts || [];
                this.dataSource = new BlogTableDataSource(this.blogPosts, this.paginator);

                this.isLoading = false;
            });
    }

    newPost() {
        const dialogRef = this.dialog.open(BlogEditorDialog);

        dialogRef.afterClosed().subscribe(result => {
            this.blogPosts.push(result);
        });
    }

    onEdit(entry: BlogPost) {

        const dialogRef = this.dialog.open(BlogEditorDialog, {
            data: {
                entry: entry
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            
        });
    }
}

