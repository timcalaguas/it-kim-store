import {
  Drawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerFooter,
  DrawerContent,
  DrawerBody,
  Button,
  Flex,
  Card,
  Box,
  Divider,
  Text,
  HStack,
  Image,
  Input,
  Heading,
} from "@chakra-ui/react";
import { useCartStore } from "@/hooks/stores/cartStore";
import { IoBagCheckOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { firestore } from "../../firebase-config";
import { useState, useEffect } from "react";

const Notifications = ({ userId, isOpen, onClose, btnRef }) => {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Reference to the Firestore collection
    const collectionRef = firestore
      .collection("notifications")
      .where("id", "==", userId);

    // Set up a real-time listener
    const unsubscribe = collectionRef.onSnapshot((snapshot) => {
      const updatedNotifications = snapshot.docs.map((doc) => doc.data());
      const reverse = updatedNotifications.slice().reverse();
      setNotifications(reverse);
    });

    // To stop listening for updates when the component unmounts
    return () => unsubscribe();
  }, []);

  function getHumanReadableDateDifference(targetDate) {
    // Convert target date to a Date object
    const target = new Date(targetDate);

    // Get the current date
    const now = new Date();

    // Calculate the difference in milliseconds
    const differenceSeconds = Math.floor((now - target) / 1000);

    // Define the time intervals
    const intervals = [
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    // Find the appropriate interval
    for (const interval of intervals) {
      const count = Math.floor(differenceSeconds / interval.seconds);

      if (count >= 1) {
        return count > 1
          ? `${count} ${interval.label}s ago`
          : `a ${interval.label} ago`;
      }
    }

    return "a few seconds ago"; // Default if the difference is less than 1 second
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent width={"100%"} maxW={"650px"}>
          <DrawerCloseButton />
          <DrawerHeader>
            <Heading fontSize={"2xl"}>Notifications</Heading>
          </DrawerHeader>
          <DrawerBody>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Box
                  p={"8px"}
                  border={"1px solid #B2BEB5"}
                  borderRadius={"12px"}
                  mb={"12px"}
                >
                  <Text fontWeight={"600"} fontSize={"12px"} mb={"12px"}>
                    Order {notif.orderId.slice(0, 4)}
                    {" - "}
                    {notif.status}
                  </Text>
                  <Text fontWeight={"700"}>{notif.message}</Text>
                  <Text fontSize={"12px"} mt="12px">
                    {getHumanReadableDateDifference(notif.date)}
                  </Text>
                </Box>
              ))
            ) : (
              <Box>No Notifications yet</Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Notifications;
