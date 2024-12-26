import { Box, Text, VStack, Image, HStack, IconButton, Avatar, Divider, Input, Button } from "@chakra-ui/react";
import { Heart, Trash2 } from "react-feather";
import { useState, useEffect } from "react";
import { useAuth } from "../Auth/Auth";
import { deleteCommentData } from "../Api/deleteData";
import { postCommentData } from "../Api/postData";
import { getCommentData } from "../Api/getData";
import { putPostData } from "../Api/putData";


interface PostProps {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
}

interface Comment {
  commentId: string;
  postId: string;
  author: string | null;
  content: string;
}



const Post: React.FC<PostProps> = ({ postId, author, content, topics, images, likes }) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const { username } = useAuth();

  const handleLike = async () => {
    try {
      // Increment the like count optimistically
      setLikeCount((prev) => prev + 1);
  
      // Send PUT request to update the likes
      const response = await putPostData(postId, { likes: Number(likeCount + 1) });
  
      if (!response.success) {
        // Revert like count if request fails
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      // Revert like count if any unexpected error occurs
      setLikeCount((prev) => prev - 1);
    }
  };


  // Fetch comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const fetchedComments = await getCommentData(postId);
        setComments(fetchedComments);
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
      const commentData = await postCommentData(postId, username, newComment);
      setComments((prev) => [...prev, commentData]); // Update state with the new comment
      setNewComment(""); // Clear the input
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };


  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentData(commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };



  return (
    <Box shadow="md" p={4} mb={4} id={postId}>
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
            <Image key={index} src={image} alt={`Post image ${index + 1}`} />
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
          <Button onClick={handleAddComment} bgColor="gray.500" color="white" >
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
                  <Avatar size="sm" />
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
