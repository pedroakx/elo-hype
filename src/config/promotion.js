export const LAUNCH_DISCOUNT = 0.5;

export const getDiscountedPrice = (price) => {
  return price * (1 - LAUNCH_DISCOUNT);
};

export const formatPrice = (price) => {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};