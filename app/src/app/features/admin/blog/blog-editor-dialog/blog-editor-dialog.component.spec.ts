import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PostRepository } from '@core/api/platform/post.repository';
import { BlogEditorDialog } from './blog-editor-dialog.component';

describe('BlogEditorDialog preview', () => {
    const getEditablePost = vi.fn((id: string) => of({ id, title: 'Post', markdownContent: '# Hello\n\nSome **bold** text' }));

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { entry: { id: 'abc', title: 'Post', htmlContent: '', publishDate: '2024-01-01T00:00:00Z' } } },
                { provide: PostRepository, useValue: { getEditablePost } }
            ]
        });
    });

    it('renders the markdown as html when switching to the preview tab and back', async () => {
        const fixture = TestBed.createComponent(BlogEditorDialog);
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.onTabChange(1);
        fixture.detectChanges();
        await fixture.whenStable();

        const preview: HTMLElement = fixture.nativeElement.querySelector('.blog-editor-preview');
        expect(preview.querySelector('h1')?.textContent).toBe('Hello');
        expect(preview.querySelector('strong')?.textContent).toBe('bold');

        fixture.componentInstance.onTabChange(0);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.selectedTab).toBe(0);
        expect(fixture.nativeElement.querySelector('textarea')).not.toBeNull();
    });

    it('re-renders the preview after the markdown changes', () => {
        const component = TestBed.createComponent(BlogEditorDialog).componentInstance;

        component.markdownContent = '*first*';
        component.onTabChange(1);
        expect(component.previewHtml).toContain('<em>first</em>');

        component.onTabChange(0);
        component.markdownContent = '`second`';
        component.onTabChange(1);
        expect(component.previewHtml).toContain('<code>second</code>');
    });
});
