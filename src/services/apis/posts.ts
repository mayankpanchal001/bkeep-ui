import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PostType } from '../../types';
import axiosClient from '../axiosClient';

// Type for creating a new post (without id)
type NewPost = Omit<PostType, 'id'>;

// Query keys for cache management
const postQueryKeys = {
    all: ['posts'] as const,
    detail: (postId: number) => ['posts', postId] as const,
};

// API Functions
const addPost = async (newPost: NewPost): Promise<PostType> => {
    const response = await axiosClient.post<PostType>('/posts', newPost);
    return response.data;
};

const getPosts = async (): Promise<PostType[]> => {
    const response = await axiosClient.get<PostType[]>('/posts');
    return response.data;
};

const getPostByID = async (postId: number): Promise<PostType> => {
    const response = await axiosClient.get<PostType>(`/posts/${postId}`);
    return response.data;
};

const updatePost = async (updatedPost: PostType): Promise<PostType> => {
    const response = await axiosClient.put<PostType>(
        `/posts/${updatedPost.id}`,
        updatedPost
    );
    return response.data;
};

const deletePost = async (postId: number): Promise<number> => {
    await axiosClient.delete(`/posts/${postId}`);
    return postId;
};

// Custom Hooks
export const useAddPost = () => {
    const queryClient = useQueryClient();

    return useMutation<PostType, Error, NewPost>({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
        },
    });
};

export const usePosts = () => {
    return useQuery<PostType[], Error>({
        queryKey: postQueryKeys.all,
        queryFn: getPosts,
    });
};

export const usePost = (postId: number) => {
    return useQuery<PostType, Error>({
        queryKey: postQueryKeys.detail(postId),
        queryFn: () => getPostByID(postId),
        enabled: !!postId,
    });
};

export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation<PostType, Error, PostType>({
        mutationFn: updatePost,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
            queryClient.invalidateQueries({
                queryKey: postQueryKeys.detail(data.id),
            });
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation<number, Error, number>({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
        },
    });
};
