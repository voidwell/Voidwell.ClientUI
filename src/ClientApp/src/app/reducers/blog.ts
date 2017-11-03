import { BlogPost } from '../blog/blogPost';

export const GET_BLOG_POSTS = 'GET_BLOG_POSTS';
export const GET_BLOG_POST = 'GET_BLOG_POST';
export const GET_BLOG_POSTS_SUCCESS = 'GET_BLOG_POSTS_SUCCESS';
export const GET_BLOG_POST_SUCCESS = 'GET_BLOG_POST_SUCCESS';

export interface IBlogPostState {
    blogPost: BlogPost;
    id: string;
    status: string;
};

export interface IBlogPostListState {
    blogPosts: BlogPost[];
    status: string;
};

export const initialBlogPostState: IBlogPostState = {
    blogPost: null,
    id: null,
    status: ''
};

export const initialBlogPostListState: IBlogPostListState = {
    blogPosts: [],
    status: ''
};

export const blogPostReducer = (state = initialBlogPostState, action): IBlogPostState => {
    switch (action.type) {
        case GET_BLOG_POST:
            return Object.assign({}, state, {
                status: 'loading'
            });
        case GET_BLOG_POST_SUCCESS:
            const blogPost: BlogPost = action.payload;
            return Object.assign({}, state, {
                blogPost: Object.assign({}, blogPost),
                id: null,
                status: 'active'
            });
        default:
            return state;
    }
};

export const blogPostListReducer = (state = initialBlogPostListState, action): IBlogPostListState => {
    switch (action.type) {
        case GET_BLOG_POSTS:
            return Object.assign({}, state, {
                status: 'loading'
            });
        case GET_BLOG_POSTS_SUCCESS:
            const blogPosts: BlogPost[] = action.payload;
            return Object.assign({}, state, {
                blogPosts: blogPosts,
                id: null,
                status: 'active'
            });
        default:
            return state;
    }
};