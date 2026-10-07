import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { PostRepository } from '@core/api/platform/post.repository';
import { BlogPostComponent } from './blog-post.component';

describe('BlogPostComponent route binding', () => {
    const getPost = vi.fn((id: string) => of({ id, title: 'Post ' + id, htmlContent: '<p>hi</p>', publishDate: '2024-01-01T00:00:00Z' }));

    beforeEach(() => {
        getPost.mockClear();
        TestBed.configureTestingModule({
            providers: [
                provideRouter([{ path: ':id', component: BlogPostComponent }], withComponentInputBinding()),
                { provide: PostRepository, useValue: { getPost } }
            ]
        });
    });

    it('loads the post named by the :id route parameter', async () => {
        const harness = await RouterTestingHarness.create('/abc');
        harness.detectChanges();

        expect(getPost).toHaveBeenCalledWith('abc');
        expect(harness.routeNativeElement?.textContent).toContain('Post abc');
    });

    it('reloads when the route parameter changes without recreating the component', async () => {
        const harness = await RouterTestingHarness.create('/abc');
        harness.detectChanges();
        const component = harness.routeDebugElement?.componentInstance;

        await harness.navigateByUrl('/def');
        harness.detectChanges();

        expect(harness.routeDebugElement?.componentInstance).toBe(component);
        expect(getPost).toHaveBeenLastCalledWith('def');
        expect(getPost).toHaveBeenCalledTimes(2);
    });
});
