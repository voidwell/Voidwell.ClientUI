import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { BlogPost } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { cellOf, sortRows } from '../../planetside/components/combat-report/combat-report-figures';
import { BlogRow, blogRows } from '../admin-figures';
import { BlogEditorDialog, BlogEditorDialogData, BlogEditorDialogResult } from './blog-editor-dialog/blog-editor-dialog.component';

/** The blog table's rows per page. */
export const ADMIN_BLOG_PAGE_SIZE = 25;

@Component({
    selector: 'voidwell-admin-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.css'],
    imports: [LoaderComponent, ErrorCardComponent, MatButton, MatIcon, MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, DatePipe]
})

export class BlogComponent {
    private postRepository = inject(PostRepository);
    private dialog = inject(MatDialog);

    readonly pageSize = ADMIN_BLOG_PAGE_SIZE;
    readonly isLoading = signal(true);
    readonly hasError = signal(false);
    readonly sort = signal<Sort>({ active: 'published', direction: 'desc' });
    readonly page = signal(0);
    readonly expanded = signal<ReadonlySet<string>>(new Set());

    private readonly posts = signal<BlogPost[]>([]);
    readonly total = computed(() => this.posts().length);

    private readonly sorted = computed(() => sortRows(blogRows(this.posts()), this.sort(), cellOf));
    readonly pageRows = computed<BlogRow[]>(() => this.sorted().slice(this.page() * ADMIN_BLOG_PAGE_SIZE, (this.page() + 1) * ADMIN_BLOG_PAGE_SIZE));
    readonly firstRow = computed(() => (this.pageRows().length ? this.page() * ADMIN_BLOG_PAGE_SIZE + 1 : 0));
    readonly lastRow = computed(() => this.page() * ADMIN_BLOG_PAGE_SIZE + this.pageRows().length);
    readonly hasNext = computed(() => this.lastRow() < this.total());

    constructor() {
        this.postRepository.getPosts().subscribe({
            next: posts => {
                this.posts.set(posts || []);
                this.isLoading.set(false);
            },
            error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
            }
        });
    }

    newPost() {
        this.openEditor({});
    }

    onEdit(entry: BlogPost) {
        this.openEditor({ entry });
    }

    onSort(sort: Sort) {
        this.sort.set(sort);
        this.page.set(0);
    }

    goToPage(page: number) {
        this.page.set(page);
    }

    toggle(id: string) {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
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
                this.posts.update(posts => posts.filter(p => p.id !== result.id));
                if (this.page() > 0 && this.firstRow() === 0) {
                    this.page.update(page => page - 1);
                }
            } else {
                this.posts.update(posts => {
                    const idx = posts.findIndex(p => p.id === result.post.id);
                    if (idx < 0) {
                        return [result.post, ...posts];
                    }
                    const next = [...posts];
                    next[idx] = { ...posts[idx], ...result.post };
                    return next;
                });
            }
        });
    }
}
