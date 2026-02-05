import { Type } from "./action.type";

export const initialState = {
  basket: [],
  user: null,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case Type.ADD_TO_BASKET:
      if (!action.item) {
        console.error("ADD_TO_BASKET missing item. Action =", action);
        return state;
      }

      console.log("ADD:", action.item);

      const existingItem = state.basket.find(
        (item) => item && item.id === action.item.id,
      );

      if (!existingItem) {
        return {
          ...state,
          basket: [...state.basket, { ...action.item, amount: 1 }],
        };
      } else {
        const updatedBasket = state.basket.map((item) =>
          item && item.id === action.item.id
            ? {
                ...item,
                amount: (item.amount ?? 1) + 1,
              }
            : item,
        );
        console.log("UPDATED BASKET:", updatedBasket);

        return {
          ...state,
          basket: updatedBasket,
        };
      }
    case Type.REMOVE_FROM_BASKET:
      const index = state.basket.findIndex((item) => item.id === action.id);
      let newBasket = [...state.basket];
      if (index >= 0) {
        if (newBasket[index].amount > 1) {
          newBasket[index] = {
            ...newBasket[index],
            amount: newBasket[index].amount - 1,
          };
        } else newBasket.splice(index, 1);
      }
      return {
        ...state,
        basket: newBasket,
      };
    case Type.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case Type.EMPTY_BASKET:
      return { ...state, basket: [] };

    default:
      return state;
  }
};

// export default reducer;
// const [state,dispatch]=useReducer(reducer,initialState)
