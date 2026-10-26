import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { BlogPost } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { BlogComponent } from './blog.component';

const post = (id: string, title: string, publishDate: string, authorName?: string): BlogPost => ({ id, title, htmlContent: '', publishDate, authorName });
const POSTS = [
    post('1', 'Old news', '2026-01-05T12:00:00Z', 'Pyrrhic'),
    post('2', 'Patch notes', '2026-10-21T12:00:00Z', 'Wakeful'),
    post('3', 'Anonymous', '2026-05-02T12:00:00Z')
];

function create(posts: BlogPost[] | Error = POSTS, dialogResult?: unknown) {
    const open = vi.fn(() => ({ afterClosed: () => of(dialogResult) }));
    TestBed.configureTestingModule({
        providers: [
            { provide: PostRepository, useValue: { getPosts: () => (posts instanceof Error ? throwError(() => posts) : of(posts)) } },
            { provide: MatDialog, useValue: { open } }
        ]
    });
    const fixture = TestBed.createComponent(BlogComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, open };
}

const titles = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')].map(row => row.querySelectorAll('td')[1].textContent?.trim());

describe('BlogComponent', () => {
    it('lists the posts, the newest first, with a dash for a missing author', () => {
        const { el } = create();

        expect(titles(el)).toEqual(['Patch notes', 'Anonymous', 'Old news']);
        expect([...el.querySelectorAll('tbody tr')[1].querySelectorAll('td')].map(td => td.textContent?.trim())[2]).toBe('—');
    });

    it('sorts by a column header', () => {
        const { fixture, el } = create();

        (el.querySelector('th[mat-sort-header="title"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(titles(el)).toEqual(['Anonymous', 'Old news', 'Patch notes']);
    });

    it('pages a long list', () => {
        const many = Array.from({ length: 60 }, (_, i) => post(String(i), `Post ${i}`, new Date(Date.UTC(2026, 0, 1 + i)).toISOString()));
        const { fixture, el } = create(many);

        expect(titles(el)).toHaveLength(25);
        expect(el.querySelector('.stat-pager')?.textContent?.replace(/\s+/g, ' ')).toContain('Posts 1–25 of 60');

        (el.querySelector('button[aria-label="Next page"]') as HTMLElement).click();
        fixture.detectChanges();
        expect(el.querySelector('.stat-pager')?.textContent?.replace(/\s+/g, ' ')).toContain('Posts 26–50 of 60');
    });

    it('opens the editor for a new post, and adds the saved post at the top', () => {
        const saved = post('9', 'Fresh', '2026-10-25T12:00:00Z', 'Wakeful');
        const { fixture, el, open } = create(POSTS, { action: 'saved', post: saved });

        (el.querySelector('button.new') as HTMLElement).click();
        fixture.detectChanges();

        expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: {} }));
        expect(titles(el)[0]).toBe('Fresh');
    });

    it('opens the editor for a post, and drops it when it is deleted', () => {
        const { fixture, el, open } = create(POSTS, { action: 'deleted', id: '2' });

        (el.querySelector('tbody .action') as HTMLElement).click();
        fixture.detectChanges();

        expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: { entry: POSTS[1] } }));
        expect(titles(el)).toEqual(['Anonymous', 'Old news']);
    });

    it('says when there are no posts, and shows the error card when they fail to load', () => {
        expect(create([]).el.textContent).toContain('No posts yet.');
        TestBed.resetTestingModule();

        const { el } = create(new Error('nope'));
        expect(el.querySelector('vw-error-card')).not.toBeNull();
        expect(el.querySelector('table')).toBeNull();
    });
});
