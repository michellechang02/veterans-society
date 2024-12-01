import React, { useState } from 'react';
import { Box, Grid, VStack, Text, Spinner, Heading } from '@chakra-ui/react';
import GroupSearchSidebar from './GroupSearchSidebar';
import Post from './Post';
import CreatePostCard from './CreatePostCard';

// Dummy data with updated images
const groupData = {
  1: {
    name: 'Veterans Support',
    description: 'A group for veterans to connect and support each other.',
    posts: [
      {
        postId: '1',
        author: 'LeBron James',
        content: 'Working on my post-game moves!',
        topics: ['Fitness'],
        images: ['https://bit.ly/dan-abramov'],
        likes: 5,
      },
      {
        postId: '2',
        author: 'Stephen Curry',
        content: 'Sharpening my shooting skills!',
        topics: ['Sports'],
        images: ['https://bit.ly/dan-abramov'],
        likes: 8,
      },
    ],
  },
  2: {
    name: 'Job Training for Veterans',
    description: 'A group focused on career development for veterans.',
    posts: [
      {
        postId: '3',
        author: 'Kevin Durant',
        content: 'Got a new gig with a tech startup!',
        topics: ['Career'],
        images: ['https://bit.ly/dan-abramov'],
        likes: 10,
      },
      {
        postId: '4',
        author: 'Giannis Antetokounmpo',
        content: 'Exploring business opportunities in Greece.',
        topics: ['Entrepreneurship'],
        images: ['https://bit.ly/dan-abramov'],
        likes: 7,
      },
    ],
  },
};

const Groups: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const groupInfo = selectedGroupId ? groupData[selectedGroupId] : null;

  const renderGroupContent = () => {
    if (!selectedGroupId) {
      return (
        <Text fontSize="lg" color="gray.500">
          Select a group to view its details and posts.
        </Text>
      );
    }

    if (!groupInfo) {
      return (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text>Loading group data...</Text>
        </Box>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {/* Note: Add a field for the group ID in CreatePostCard */}
        <CreatePostCard mutate={() => {}} />
        {groupInfo.posts.length > 0 ? (
          groupInfo.posts.map((post) => (
            <Post
              key={post.postId}
              postId={post.postId}
              author={post.author}
              content={post.content}
              topics={post.topics}
              images={post.images}
              likes={post.likes}
            />
          ))
        ) : (
          <Text>No posts available in this group.</Text>
        )}
      </VStack>
    );
  };

  return (
    <Grid templateColumns="1fr 3fr" gap={4} p={4}>
      {/* Left Sidebar */}
      <GroupSearchSidebar setGroupId={setSelectedGroupId} />

      {/* Main Content */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
        {selectedGroupId && groupInfo && (
          <>
            <Heading size="lg" mb={2}>
              {groupInfo.name}
            </Heading>
            <Text mb={4} color="gray.600">
              {groupInfo.description}
            </Text>
          </>
        )}
        {renderGroupContent()}
      </Box>
    </Grid>
  );
};

export default Groups;
