// import { usePosts } from '../../services/apis/postsSecond';
import { PostType } from '../../types';

export default function Homepage() {
    // const { data, isLoading, isError, error } = usePosts();

    // console.log('isLoading', isLoading);
    // console.log('isError', isError);
    // console.log('error', error);

    // if (isLoading) return <div>Loading...</div>;
    // if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="max-w-4xl mx-auto flex flex-wrap gap-8 overflow-y-auto py-20 max-h-[calc(100vh-80px)] ">
            {data?.map((post: PostType) => (
                <div
                    key={post.id}
                    className="flex p-4 rounded-md w-64 bg-red-300 flex-col gap-2"
                >
                    <div>{post.title}</div>
                    <div>{post.body}</div>
                    <div>{post.userId}</div>
                </div>
            ))}
        </div>
    );
}
