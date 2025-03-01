import { Box, Text, VStack, Image, HStack, IconButton, Avatar, Divider, Input, Button } from "@chakra-ui/react";
import { Heart, Trash2 } from "react-feather";
import { useState, useEffect } from "react";
import { useAuth } from "../Auth/Auth";
import { deleteCommentData } from "../Api/deleteData";
import { postCommentData, postGroupLikeData } from "../Api/postData";
import { getCommentData, getUserProfilePic } from "../Api/getData";

interface GroupPostProps {
  groupId: string;
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  likedBy: string[];
}

interface Comment {
  commentId: string;
  postId: string;
  author: string | null;
  content: string;
  profilePic: string;
}

const GroupPost: React.FC<GroupPostProps> = ({ groupId, postId, author, content, topics, images, likes, likedBy = [] }) => {
  const { username } = useAuth();
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(likedBy?.includes(username ?? '') || false);
  const [profilePic, setProfilePic] = useState<string>('');
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (author !== null && author !== undefined) {
        try {
          const pfp = await getUserProfilePic(author);
          setProfilePic(pfp);
        } catch (error) {
          console.error("Failed to fetch profile picture:", error);
        }
      }
    };
  
    fetchProfilePic();
  }, [author]);

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
      setComments((prev) => [...prev, {...commentData, profilePic}]); // Update state with the new comment
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
        <Avatar name={author} src={profilePic} />
        <Text fontWeight="bold">{author}</Text>
      </HStack>

      {/* Post Content */}
      <Text mb={4}>{content}</Text>

      {/* Post Images */}
      {images && images.length > 0 && (
        <VStack spacing={2} mb={4}>
          {images.map((image, index) => (
            <Image key={index} src={image} />
          ))}
        </VStack>
      )}

      {/* Post Topics */}
      {topics && topics.length > 0 && (
        <HStack spacing={2} mb={4}>
          {topics.map((topic, index) => (
            <Text key={index} fontSize="sm" color="gray.500">
              #{topic}
            </Text>
          ))}
        </HStack>
      )}

      {/* Like Button */}
      <HStack spacing={4}>
        <IconButton
          aria-label="Like"
          icon={<Heart fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "currentColor"} />}
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
                  <Avatar size="sm" src={comment.profilePic} />
                  <Text fontWeight="bold">{comment.author}</Text>
                </HStack>
                {comment.author === username && (
                  <IconButton
                    aria-label="Delete comment"
                    icon={<Trash2 />}
                    size="sm"
                    variant="ghost"
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
