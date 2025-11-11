# Posts API Service Documentation

This document describes the Posts API service that provides CRUD operations for managing posts using React Query and Axios.

## Overview

The Posts API service provides a complete set of hooks and functions for managing posts in the application. It uses React Query for data fetching, caching, and state management, and Axios for HTTP requests.

## Types

### PostType

The main type representing a post:

```typescript
type PostType = {
    id: number;
    userId: number;
    title: string;
    body: string;
};
```

### NewPost

Type for creating a new post (without the `id` field):

```typescript
type NewPost = Omit<PostType, 'id'>;
```

## Query Keys

Query keys are used for cache management in React Query:

- `postQueryKeys.all` - Key for all posts list
- `postQueryKeys.detail(postId)` - Key for a specific post by ID

## API Functions

### `addPost(newPost: NewPost): Promise<PostType>`

Creates a new post.

**Parameters:**
- `newPost` - The post object without `id` (userId, title, body)

**Returns:** Promise resolving to the created post with `id`

**Endpoint:** `POST /posts`

---

### `getPosts(): Promise<PostType[]>`

Fetches all posts.

**Returns:** Promise resolving to an array of posts

**Endpoint:** `GET /posts`

---

### `getPostByID(postId: number): Promise<PostType>`

Fetches a single post by its ID.

**Parameters:**
- `postId` - The ID of the post to fetch

**Returns:** Promise resolving to the post object

**Endpoint:** `GET /posts/:postId`

---

### `updatePost(updatedPost: PostType): Promise<PostType>`

Updates an existing post.

**Parameters:**
- `updatedPost` - The complete post object including `id`

**Returns:** Promise resolving to the updated post

**Endpoint:** `PUT /posts/:id`

---

### `deletePost(postId: number): Promise<number>`

Deletes a post by its ID.

**Parameters:**
- `postId` - The ID of the post to delete

**Returns:** Promise resolving to the deleted post ID

**Endpoint:** `DELETE /posts/:postId`

---

## Custom Hooks

### `useAddPost()`

Hook for creating a new post.

**Returns:** React Query mutation object with:
- `mutate` - Function to create a post
- `mutateAsync` - Async function to create a post
- `isPending` - Loading state
- `isError` - Error state
- `isSuccess` - Success state
- `data` - Created post data
- `error` - Error object if mutation failed

**Example:**
```typescript
const addPostMutation = useAddPost();

const handleCreate = () => {
    addPostMutation.mutate({
        userId: 1,
        title: 'New Post',
        body: 'Post content'
    });
};
```

**Cache Invalidation:** Automatically invalidates the posts list cache on success.

---

### `usePosts()`

Hook for fetching all posts.

**Returns:** React Query query object with:
- `data` - Array of posts
- `isLoading` - Loading state
- `isError` - Error state
- `error` - Error object
- `refetch` - Function to manually refetch

**Example:**
```typescript
const { data: posts, isLoading, error } = usePosts();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return (
    <div>
        {posts?.map(post => (
            <div key={post.id}>{post.title}</div>
        ))}
    </div>
);
```

---

### `usePost(postId: number)`

Hook for fetching a single post by ID.

**Parameters:**
- `postId` - The ID of the post to fetch

**Returns:** React Query query object with:
- `data` - Post object
- `isLoading` - Loading state
- `isError` - Error state
- `error` - Error object
- `refetch` - Function to manually refetch

**Features:**
- Automatically disabled if `postId` is falsy
- Only fetches when `postId` is provided

**Example:**
```typescript
const { data: post, isLoading } = usePost(1);

if (isLoading) return <div>Loading...</div>;

return <div>{post?.title}</div>;
```

---

### `useUpdatePost()`

Hook for updating an existing post.

**Returns:** React Query mutation object with:
- `mutate` - Function to update a post
- `mutateAsync` - Async function to update a post
- `isPending` - Loading state
- `isError` - Error state
- `isSuccess` - Success state
- `data` - Updated post data
- `error` - Error object if mutation failed

**Example:**
```typescript
const updatePostMutation = useUpdatePost();

const handleUpdate = () => {
    updatePostMutation.mutate({
        id: 1,
        userId: 1,
        title: 'Updated Title',
        body: 'Updated content'
    });
};
```

**Cache Invalidation:** Automatically invalidates both the posts list and the specific post cache on success.

---

### `useDeletePost()`

Hook for deleting a post.

**Returns:** React Query mutation object with:
- `mutate` - Function to delete a post
- `mutateAsync` - Async function to delete a post
- `isPending` - Loading state
- `isError` - Error state
- `isSuccess` - Success state
- `data` - Deleted post ID
- `error` - Error object if mutation failed

**Example:**
```typescript
const deletePostMutation = useDeletePost();

const handleDelete = (postId: number) => {
    deletePostMutation.mutate(postId);
};
```

**Cache Invalidation:** Automatically invalidates the posts list cache on success.

---

## Usage Examples

### Complete CRUD Example

```typescript
import { usePosts, useAddPost, useUpdatePost, useDeletePost } from './services/apis/posts';

function PostsComponent() {
    const { data: posts, isLoading } = usePosts();
    const addPost = useAddPost();
    const updatePost = useUpdatePost();
    const deletePost = useDeletePost();

    const handleAdd = () => {
        addPost.mutate({
            userId: 1,
            title: 'New Post',
            body: 'Content'
        });
    };

    const handleUpdate = (post: PostType) => {
        updatePost.mutate({
            ...post,
            title: 'Updated Title'
        });
    };

    const handleDelete = (id: number) => {
        deletePost.mutate(id);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <button onClick={handleAdd}>Add Post</button>
            {posts?.map(post => (
                <div key={post.id}>
                    <h3>{post.title}</h3>
                    <button onClick={() => handleUpdate(post)}>Update</button>
                    <button onClick={() => handleDelete(post.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}
```

---

## Error Handling

All hooks return error states that can be handled:

```typescript
const { data, isError, error } = usePosts();

if (isError) {
    console.error('Failed to fetch posts:', error);
    return <div>Error: {error.message}</div>;
}
```

For mutations:

```typescript
const addPost = useAddPost();

addPost.mutate(newPost, {
    onError: (error) => {
        console.error('Failed to create post:', error);
    },
    onSuccess: (data) => {
        console.log('Post created:', data);
    }
});
```

---

## Notes

- All API functions use the `axiosClient` instance configured in `services/axiosClient.ts`
- React Query automatically handles caching, refetching, and background updates
- Cache invalidation ensures data consistency after mutations
- The `usePost` hook is disabled when `postId` is falsy to prevent unnecessary API calls

