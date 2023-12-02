import React, { createContext, useContext, useEffect, useState } from "react";

const DateCheckerContext = createContext();

export const DateCheckerProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setItems((prevItems) => {
        return prevItems.map((item) => ({
          ...item,
          isWithin10Minutes: checkIfWithin10Minutes(item.date),
        }));
      });
    }, 60000); // 1 minute interval

    // Check items on mount
    setItems((prevItems) => {
      return prevItems.map((item) => ({
        ...item,
        isWithin10Minutes: checkIfWithin10Minutes(item.date),
      }));
    });

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const checkIfWithin10Minutes = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate - inputDate;
    return Math.abs(differenceInMilliseconds) <= 600000; // 10 minutes in milliseconds
  };

  const addDateToCheck = (id, date) => {
    // Check if the item with the same id already exists
    const itemExists = items.some((item) => item.id === id);

    if (!itemExists) {
      setItems((prevItems) => [
        ...prevItems,
        { id, date, isWithin10Minutes: false },
      ]);
    }
  };

  return (
    <DateCheckerContext.Provider value={{ items, addDateToCheck }}>
      {children}
    </DateCheckerContext.Provider>
  );
};

export const useDateChecker = () => {
  return useContext(DateCheckerContext);
};
