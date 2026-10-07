export interface BlogPostTag {
    id: string;
    name: string;
}

/** `GET platform/post` and `GET platform/post/{id}` */
export interface BlogPost {
    id: string;
    title: string;
    htmlContent: string;
    authorName?: string;
    publishDate: string;
    tags?: BlogPostTag[];
}

/** `GET platform/post/edit/{id}` */
export interface EditableBlogPost {
    id: string;
    title: string;
    markdownContent: string;
    tags?: BlogPostTag[];
}

/** Body of `POST platform/post` and `PUT platform/post/edit/{id}` */
export interface BlogPostRequest {
    title: string;
    markdownContent: string;
    tags?: BlogPostTag[];
}
