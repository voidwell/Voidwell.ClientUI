import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { BlogPost, BlogPostRequest, BlogPostTag } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { getErrorMessage } from '@core/util/error-message';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

export interface BlogEditorDialogData {
    entry?: BlogPost;
}

/** What the dialog closes with when it changed something; it closes empty otherwise. */
export type BlogEditorDialogResult =
    | { action: 'saved', post: BlogPost }
    | { action: 'deleted', id: string };

@Component({
    selector: 'blog-editor-dialog',
    templateUrl: './blog-editor-dialog.component.html',
    styleUrls: ['./blog-editor-dialog.component.css'],
    imports: [
        ErrorMessageComponent,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatFormField,
        MatLabel,
        MatError,
        MatInput,
        MatProgressBar,
        FormsModule,
        MatButton,
    ],
})
export class BlogEditorDialog {
    private dialogRef = inject<MatDialogRef<BlogEditorDialog, BlogEditorDialogResult>>(MatDialogRef);
    private postRepository = inject(PostRepository);
    private cdr = inject(ChangeDetectorRef);
    private data = inject<BlogEditorDialogData>(MAT_DIALOG_DATA, { optional: true });

    id: string | null = null;
    title = '';
    markdownContent = '';
    private tags: BlogPostTag[] | undefined;

    isLoading = false;
    isSaving = false;
    errorMessage: string = null;

    constructor() {
        const existing = this.data?.entry;
        if (!existing) {
            return;
        }

        this.id = existing.id;
        this.title = existing.title;
        this.tags = existing.tags;
        this.isLoading = true;

        // The list only carries rendered HTML, so load the markdown source to edit.
        this.postRepository.getEditablePost(existing.id)
            .subscribe({
                next: editable => {
                    this.title = editable.title;
                    this.markdownContent = editable.markdownContent ?? '';
                    this.tags = editable.tags;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: error => {
                    this.errorMessage = getErrorMessage(error);
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    get isNew(): boolean {
        return !this.id;
    }

    get canSave(): boolean {
        return !this.isLoading && !this.isSaving && this.title.trim().length > 0;
    }

    onSave() {
        if (!this.canSave) {
            return;
        }

        const request: BlogPostRequest = {
            title: this.title.trim(),
            markdownContent: this.markdownContent,
            tags: this.tags
        };

        const save$ = this.id
            ? this.postRepository.updatePost(this.id, request)
            : this.postRepository.createPost(request);

        this.isSaving = true;
        this.errorMessage = null;

        save$.subscribe({
            next: post => this.dialogRef.close({ action: 'saved', post }),
            error: error => this.onRequestFailed(error)
        });
    }

    onDelete() {
        if (!this.id || this.isSaving || !confirm(`Delete "${this.title}"? This cannot be undone.`)) {
            return;
        }

        const id = this.id;
        this.isSaving = true;
        this.errorMessage = null;

        this.postRepository.deletePost(id)
            .subscribe({
                next: () => this.dialogRef.close({ action: 'deleted', id }),
                error: error => this.onRequestFailed(error)
            });
    }

    onCancel() {
        this.dialogRef.close();
    }

    private onRequestFailed(error: unknown) {
        this.errorMessage = getErrorMessage(error);
        this.isSaving = false;
        this.cdr.markForCheck();
    }
}
