import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext({
    isAddMealVisible: false,
    showAddMeal: () => {},
    hideAddMeal: () => {},
});

export const ModalProvider = ({ children }) => {
    const [isAddMealVisible, setIsAddMealVisible] = useState(false);

    const showAddMeal = () => setIsAddMealVisible(true);
    const hideAddMeal = () => setIsAddMealVisible(false);

    return (
        <ModalContext.Provider value={{ isAddMealVisible, showAddMeal, hideAddMeal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
