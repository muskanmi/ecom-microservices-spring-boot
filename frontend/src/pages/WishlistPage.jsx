import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const WishlistPage = () => {
  const navigate = useNavigate();

  const wishlistItems = [];

  if (wishlistItems.length === 0) {
    return (
      <EmptyState
        icon={
          <FavoriteBorderOutlined
            sx={{
              fontSize: 42,
              color: "#f0a500",
            }}
          />
        }
        title="Your wishlist is empty"
        description="Save the products you love and come back to them anytime. Start exploring and add something to your wishlist."
        buttonText="Explore Products"
        onButtonClick={() => navigate("/products")}
      />
    );
  }

  return <div>Wishlist Items</div>;
};

export default WishlistPage;
