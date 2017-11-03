export class BlogPost {
    public id: string;
    public title: string;
    public author: string;
    public content: string;
    public publishDate: string;

    constructor(blogPost?: any) {
        console.log(blogPost);
        if (blogPost) {
            Object.assign(this, blogPost);
        }
    }
}