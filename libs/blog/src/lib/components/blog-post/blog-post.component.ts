import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlogPost } from '../../contracts/blogpost.model';

@Component({
  selector: 'vw-blog-post',
  templateUrl: './blog-post.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogPostComponent {
  @Input() blogPost!: BlogPost;
}
