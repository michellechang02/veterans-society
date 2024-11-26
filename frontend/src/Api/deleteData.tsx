import axios from 'axios';

export const deleteCommentData = async (commentId: string) => {
    try {
      // Send DELETE request to the API
      await axios.delete(`http://127.0.0.1:8000/comments/${commentId}`);
  
      console.log(`Comment with ID ${commentId} deleted successfully.`);
    } catch (error) {
      // Handle errors gracefully
      console.error(`Failed to delete comment with ID ${commentId}:`, error);
      throw error; // Optionally rethrow the error to handle it in the caller
    }
};
