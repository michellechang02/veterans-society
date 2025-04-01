import { Box, Text, VStack, Image, HStack, IconButton, Avatar, Divider, Input, Button, Flex } from "@chakra-ui/react";
import { Heart, Trash2 } from "react-feather";
import { useState, useEffect } from "react";
import { useAuth } from "../Auth/Auth";
import { deleteCommentData, deleteGroupPostData } from "../Api/deleteData";
import { postCommentData, postGroupLikeData } from "../Api/postData";
import { getCommentData, getUserProfilePic } from "../Api/getData";
import { useToast } from "@chakra-ui/react";

interface GroupPostProps {
  groupId: string;
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  likedBy: string[];
  onPostDelete?: (postId: string) => void;
}

interface Comment {
  commentId: string;
  postId: string;
  author: string | null;
  content: string;
  profilePic: string;
}

const GroupPost: React.FC<GroupPostProps> = ({ groupId, postId, author, content, topics, images, likes, likedBy = [], onPostDelete }) => {
  const { username, isVeteran } = useAuth();
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(likedBy?.includes(username ?? '') || false);
  const [authorProfilePic, setAuthorProfilePic] = useState<string>('');
  const [userProfilePic, setUserProfilePic] = useState<string>('');
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (author !== null && author !== undefined) {
        try {
          let pfp = await getUserProfilePic(author);
          setAuthorProfilePic(pfp);
          pfp = await getUserProfilePic(username!);
          setUserProfilePic(pfp)
        } catch (error) {
          console.error("Failed to fetch profile picture:", error);
        }
      }
    };
  
    fetchProfilePic();
  }, [author, username]);

  const handleLikeToggle = async () => {
    if (!username) return;
    
    try {
      setIsLikeLoading(true);
      const response = await postGroupLikeData(groupId, postId, username);
      
      if (response.success) {
        // Use the response data if available, otherwise calculate locally
        if (response.likes !== undefined) {
          setLikeCount(response.likes);
        } else {
          setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        }
        setIsLiked(!isLiked);
      } else {
        console.error('Error toggling like:', response.error);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!username) return;
    
    try {
      setIsDeleting(true);
      await deleteGroupPostData(groupId, postId);
      // Show success toast
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Call the callback to update parent component
      if (onPostDelete) {
        onPostDelete(postId);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const fetchedComments = await getCommentData(postId);
        // TODO: speed up comment pfp fetching
        const commentsWithPfp = await Promise.all(
          fetchedComments.map(async (comment) => {
            const res = await getUserProfilePic(comment.author!);
            return {
              ...comment,
              profilePic: res,
            };
          })
        );
        setComments(commentsWithPfp);
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
      setComments((prev) => [...prev, {...commentData, profilePic: userProfilePic}]); // Update state with the new comment
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
    <Box p={4} id={postId}>
      {/* Author Info */}
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Avatar name={author} src={authorProfilePic} size="sm" />
          <Text fontWeight="bold">{author}</Text>
        </HStack>
        {/* Delete Post Button - shown if user is author or not a veteran */}
        {(username === author || !isVeteran) && (
          <IconButton
            aria-label="Delete post"
            icon={<Trash2 size={18} />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleDeletePost}
            isLoading={isDeleting}
            disabled={isDeleting}
          />
        )}
      </Flex>

      {/* Post Content */}
      <Text mb={4}>{content}</Text>

      {/* Post Images */}
      {images && images.length > 0 && images.some(img => img && img.trim() !== '') && (
        <VStack spacing={2} mb={4}>
          {images
            .filter(img => img && img.trim() !== '')
            .map((image, index) => (
              <Box key={index}>
                {/* Only render the Image component if the URL is valid */}
                {image.startsWith('http') ? (
                  <Image 
                    src={image} 
                    onError={(e) => {
                      // Hide the image element if it fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    fallback={<Box />} // Empty box as fallback
                  />
                ) : null}
              </Box>
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
          icon={<Heart 
            fill={isLiked ? "red" : "none"} 
            color={isLiked ? "red" : "currentColor"}
          />}
          variant="ghost"
          onClick={handleLikeToggle}
          isLoading={isLikeLoading}
          disabled={isLikeLoading}
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
          <Button onClick={handleAddComment} bgColor="gray.500" color="white">
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
                  <Avatar size="sm" src={comment.profilePic} />
                  <Text fontWeight="bold">{comment.author}</Text>
                </HStack>
                {comment.author === username && (
                  <IconButton
                    aria-label="Delete comment"
                    icon={<Trash2 size={18} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeleteComment(comment.commentId)}
                  />
                )}
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

export default GroupPost;
