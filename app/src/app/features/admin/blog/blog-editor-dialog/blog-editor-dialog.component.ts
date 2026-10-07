import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlogPost, BlogPostRequest } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'blog-editor-dialog',
    templateUrl: './blog-editor-dialog.component.html',
    imports: [
        ErrorMessageComponent,
        MatFormField,
        MatInput,
        FormsModule,
        MatButton,
    ],
})
export class BlogEditorDialog {
    dialogRef = inject<MatDialogRef<BlogEditorDialog>>(MatDialogRef);
    private postRepository = inject(PostRepository);
    data = inject<{ entry?: BlogPost }>(MAT_DIALOG_DATA, { optional: true });

    public entry: BlogPost | null = null;
    public form: BlogPostRequest & { id?: string } = { title: '', markdownContent: '' };
    public errorMessage: string = null;
    updateList: boolean = false;

    constructor() {
        const existing = this.data?.entry;
        if (existing) {
            this.entry = existing;
            this.form = { id: existing.id, title: existing.title, markdownContent: '', tags: existing.tags };

            // The list only carries rendered HTML, so load the markdown source to edit.
            this.postRepository.getEditablePost(existing.id)
                .subscribe(editable => {
                    this.form = { id: editable.id, title: editable.title, markdownContent: editable.markdownContent, tags: editable.tags };
                });
        }
    }

    onSaveBlogPost() {
        const request: BlogPostRequest = {
            title: this.form.title,
            markdownContent: this.form.markdownContent,
            tags: this.form.tags
        };

        if (this.form.id) {
            this.postRepository.updatePost(this.form.id, request)
                .subscribe(result => {
                    this.entry = result;
                    Object.assign(this.data.entry, result);
                });
        } else {
            this.postRepository.createPost(request)
                .subscribe(result => {
                    this.entry = result;
                    this.form.id = result.id;
                    this.updateList = true;
                });
        }
    }

    onDeleteBlogPost() {
        this.postRepository.deletePost(this.form.id)
            .subscribe(() => {
                this.closeDialog();
            });
    }

    closeDialog() {
        if (this.updateList) {
            this.dialogRef.close(this.entry);
        } else {
            this.dialogRef.close();
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
