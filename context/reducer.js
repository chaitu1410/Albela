export const initialState = {
  basket: [],
  product: null,
  user: null,
  price: 0,
  seller: "",
  paymentProducts: [],
  isAdminValidated: false,
  directBuyProduct: null,
};

export const getBasketTotal = (basket) =>
  basket?.reduce((amount, item) => item.price + amount, 0);

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_BASKET":
      return {
        ...state,
        basket: action.basket,
      };
    case "ADD_TO_BASKET":
      return {
        ...state,
        basket: [...state.basket, action.id],
      };
    case "EMPTY_BASKET":
      return {
        ...state,
        basket: [],
      };
    case "REMOVE_FROM_BASKET":
      const index = state.basket.findIndex(
        (basketItem) => basketItem === action.id
      );
      let newBasket = [...state.basket];
      if (index >= 0) {
        newBasket.splice(index, 1);
      } else {
      }
      return {
        ...state,
        basket: newBasket,
      };
    case "REMOVE_ALL_FROM_BASKET":
      let resultantBasket = state.basket.filter((id) => id !== action.id);
      return {
        ...state,
        basket: resultantBasket,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };
    case "SET_PRODUCT":
      return {
        ...state,
        product: action.product,
      };
    case "SET_PRICE":
      return {
        ...state,
        price: (state.price += Number(action.price)),
      };
    case "RESET_PRICE":
      return {
        ...state,
        price: 0,
      };
    case "SET_SELLER":
      return {
        ...state,
        seller: action.seller,
      };
    case "SET_PAYMENT_PRODUCTS":
      return {
        ...state,
        paymentProducts: action.paymentProducts,
      };
    case "SET_IS_ADMIN_VALIDATED":
      return {
        ...state,
        isAdminValidated: action.isAdminValidated,
      };
    case "SET_DIRECT_BUY_PRODUCT":
      return {
        ...state,
        directBuyProduct: action.directBuyProduct,
      };
    default:
      return state;
  }
};

export default reducer;
