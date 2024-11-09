// frontend/src/components/Post.tsx
import { Box, Text, HStack, VStack, Image, Avatar, IconButton, Input, Divider } from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';
import { Heart, Send } from 'react-feather';

interface Comment {
  author: string;
  content: string;
}

interface PostProps {
  post: {
    postId: number;
    author: string;
    content: string;
    topics: string;
    image: string;
    likes: number;
    profileImage: string;
    comments: Comment[];
  };
  mutate: () => void; // Function to revalidate the SWR data in Feed component
}

const Post: React.FC<PostProps> = ({ post, mutate }) => {
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      // await axios.post('http://127.0.0.1:8000/likes/add', { postId: post.postId });
      // mutate(); // Refresh the posts data
    } catch (error) {
      alert(error.response?.data.error || 'Failed to like.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      // await axios.post('http://127.0.0.1:8000/comments/add', {
      //   postId: post.postId,
      //   text: commentText,
      // });
      // mutate(); // Refresh the posts data
      setCommentText(''); // Clear the comment input
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommentSubmit();
    }
  };

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
      {/* User Information */}
      <HStack spacing={4} mb={4}>
        <Avatar src={post.profileImage} alt={`${post.author}'s profile`} />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold">{post.author}</Text>
        </VStack>
      </HStack>

      {/* Post Image */}
      {post.image && (
        <Box mb={4}>
          <Image src={post.image} alt="Post content" borderRadius="md" maxH="400px" objectFit="cover" />
        </Box>
      )}

      {/* Post Content */}
      <Text mb={1}>{post.content}</Text>
      
      {/* Post Topics */}
      <Text fontSize="sm" color="gray.500" mb={4}>
        #{post.topics}
      </Text>

      {/* Likes and Comments Button */}
      <HStack spacing={4} mb={4}>
        <IconButton
          aria-label="Like post"
          icon={<Heart />}
          onClick={handleLike}
          variant="ghost"
        />
        <Text>{post.likes} Likes</Text>
      </HStack>

      {/* Comments Section */}
      <Divider mb={4} />
      <VStack align="start" spacing={3} mb={4}>
        {post.comments.map((comment, index) => (
          <HStack key={index} align="start">
            <Text fontWeight="bold">{comment.author}</Text>
            <Text>{comment.content}</Text>
          </HStack>
        ))}
      </VStack>

      {/* Comment Input */}
      <HStack as="form" onSubmit={(e) => e.preventDefault()}>
        <Input
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          aria-label="Submit comment"
          icon={<Send />}
          onClick={handleCommentSubmit}
          variant="ghost"
        />
      </HStack>
    </Box>
  );
};

export default Post;

