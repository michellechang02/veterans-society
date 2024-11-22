import { Box, Text, VStack, Image, HStack, IconButton, Avatar, Divider, Input, Button } from "@chakra-ui/react";
import { Heart, Trash2 } from "react-feather";
import { useState, useEffect } from "react";
import axios from "axios";


interface PostProps {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  username: string;
}

interface Comment {
  commentId: string;
  postId: string;
  author: string;
  content: string;
}



const Post: React.FC<PostProps> = ({ postId, author, content, topics, images, likes, username }) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    try {
      // Increment the like count optimistically
      setLikeCount((prev) => prev + 1);

      // Send PUT request to update the likes
      await axios.put(`http://127.0.0.1:8000/posts/${postId}`, {
        likes: likeCount + 1,
      });
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert like count if request fails
      setLikeCount((prev) => prev - 1);
    }
  };


  // Fetch comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const response = await axios.get<Comment[]>(
          `http://127.0.0.1:8000/comments/${postId}`
        );
        setComments(response.data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [postId]);


  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        commentId: crypto.randomUUID(),
        postId,
        author: username, // Replace with actual username
        content: newComment.trim(),
      };
      await axios.post("http://127.0.0.1:8000/comments/", commentData);
      setComments((prev) => [...prev, commentData]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };


  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };



  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} mb={4} id={postId}>
      {/* Author Info */}
      <HStack spacing={4} mb={4}>
        <Avatar name={author} />
        <Text fontWeight="bold">{author}</Text>
      </HStack>

      {/* Post Content */}
      <Text mb={4}>{content}</Text>

      {/* Post Images */}
      {images.length > 0 && (
        <VStack spacing={2} mb={4}>
          {images.map((image, index) => (
            <Image key={index} src={image} alt={`Post image ${index + 1}`} borderRadius="md" />
          ))}
        </VStack>
      )}

      {/* Post Topics */}
      <HStack spacing={2} mb={4}>
        {topics.map((topic, index) => (
          <Text key={index} fontSize="sm" color="gray.500">
            #{topic}
          </Text>
        ))}
      </HStack>

      {/* Like Button */}
      <HStack spacing={4}>
        <IconButton
          aria-label="Like"
          icon={<Heart />}
          variant="ghost"
          onClick={handleLike}
        />
        <Text>{likeCount} Likes</Text>
      </HStack>
      
      <Divider mb={4} />

      {/* Comments Section */}
      <VStack align="stretch" spacing={4}>
        {/* Add New Comment */}
        <HStack>
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleAddComment} colorScheme="teal">
            Comment
          </Button>
        </HStack>

        {/* Display Comments */}
        {loadingComments ? (
          <Text>Loading comments...</Text>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Box key={comment.commentId} bg="gray.50" p={2} borderRadius="md">
              <HStack justifyContent="space-between">
                <HStack>
                  <Avatar name={comment.author} size="sm" />
                  <Text fontWeight="bold">{comment.author}</Text>
                </HStack>
                {/* Delete Button (Optional: Show only if current user is author) */}
                <IconButton
                  aria-label="Delete comment"
                  icon={<Trash2 />}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteComment(comment.commentId)}
                />
              </HStack>
              <Text mt={1}>{comment.content}</Text>
            </Box>
          ))
        ) : (
          <Text>No comments yet.</Text>
        )}
      </VStack>
      
    </Box>
  );
};

export default Post;
