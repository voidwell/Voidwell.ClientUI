import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NewsPost } from '../../contracts/news-post.model';

@Component({
  selector: 'vw-ps2-news-post',
  templateUrl: './news-post.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsPostComponent {
  @Input() newsPost!: NewsPost;
}
