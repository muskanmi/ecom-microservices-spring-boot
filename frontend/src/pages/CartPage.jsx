import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const CartPage = () => {
  const navigate = useNavigate();

  const cartItems = [];

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={
          <ShoppingCartOutlined
            sx={{
              fontSize: 42,
              color: "#263f3f",
            }}
          />
        }
        title="Your cart is empty"
        description="Looks like you haven't added anything to your cart yet. Discover products and find something you love."
        buttonText="Continue Shopping"
        onButtonClick={() => navigate("/products")}
        iconBackground="#eef4f3"
      />
    );
  }

  return <div>Cart Items</div>;
};

export default CartPage;
