import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PostType } from '../../types';
import axiosClient from '../axiosClient';

type NewPost = Omit<PostType, 'id'>;

const postQueryKeys = {
    all: ['posts'] as const,
    detail: (postId: number) => ['posts', postId] as const,
};

async function addPost(newPost: NewPost) {
    const response = await axiosClient.post('/posts', newPost);
    return response.data;
}

async function getPosts() {
    const response = await axiosClient.get('/posts');
    return response.data;
}

async function getPostByID(postId: number) {
    const response = await axiosClient.get(`/posts/${postId}`);
    return response.data;
}

async function updatePost(updatedPost: PostType) {
    const response = await axiosClient.put(
        `/posts/${updatedPost.id}`,
        updatedPost
    );
    return response.data;
}

async function deletePost(postId: number) {
    await axiosClient.delete(`/posts/${postId}`);
    return postId;
}

export function useAddPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
        },
    });
}

export function usePosts() {
    return useQuery({
        queryKey: postQueryKeys.all,
        queryFn: getPosts,
    });
}

export function usePost(postId: number) {
    return useQuery({
        queryKey: postQueryKeys.detail(postId),
        queryFn: () => getPostByID(postId),
        enabled: !!postId,
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePost,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
            queryClient.invalidateQueries({
                queryKey: postQueryKeys.detail(data.id),
            });
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
        },
    });
}
