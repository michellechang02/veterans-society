import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Auth/Auth";
import { Box, Text } from "@chakra-ui/react";

const ProtectedRoute = ({allowedRoles}: {allowedRoles: string[]}) => {
    const { authToken } = useAuth();
    const role = localStorage.getItem("role");

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

    if (allowedRoles && !allowedRoles.includes(role as string)) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
