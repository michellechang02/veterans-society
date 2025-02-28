import { Outlet } from "react-router-dom";
import { useAuth } from "../Auth/Auth";
import { Box, Text } from "@chakra-ui/react";

const ProtectedRoute = () => {
    const { authToken } = useAuth();

    if (!authToken) {
        if (!authToken) {
            return (
                <Box textAlign="center" py={20}>
                    <Text fontSize="xl" color="red.500">
                        You must be logged in to view this page.
                    </Text>
                </Box>
            );
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
