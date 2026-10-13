import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { BlogEditorDialog, BlogEditorDialogData, BlogEditorDialogResult } from './blog-editor-dialog/blog-editor-dialog.component';

@Component({
    selector: 'voidwell-admin-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DatePipe]
})

export class BlogComponent implements OnInit {
    private postRepository = inject(PostRepository);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    errorMessage: string = null;
    blogPosts: BlogPost[] = [];
    isLoading: boolean;
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
                this.cdr.markForCheck();
            });
    }

    newPost() {
        this.openEditor({});
    }

    onEdit(entry: BlogPost) {
        this.openEditor({ entry });
    }

    private openEditor(data: BlogEditorDialogData) {
        const dialogRef = this.dialog.open<BlogEditorDialog, BlogEditorDialogData, BlogEditorDialogResult>(BlogEditorDialog, {
            data,
            width: '900px',
            maxWidth: '95vw',
            disableClose: true,
            autoFocus: 'first-tabbable'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }

            if (result.action === 'deleted') {
                this.blogPosts.splice(0, this.blogPosts.length, ...this.blogPosts.filter(p => p.id !== result.id));
            } else {
                const idx = this.blogPosts.findIndex(p => p.id === result.post.id);
                if (idx > -1) {
                    this.blogPosts[idx] = { ...this.blogPosts[idx], ...result.post };
                } else {
                    this.blogPosts.unshift(result.post);
                }
            }

            this.dataSource.refresh();
            this.cdr.markForCheck();
        });
    }
}
