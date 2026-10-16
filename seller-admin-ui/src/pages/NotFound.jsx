import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-xl border border-[#DED7C9] bg-[#F7F1E5] px-8 py-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
          Seller Console
        </p>

        <p className="mt-6 font-serif text-7xl text-[#233636]">404</p>

        <h1 className="mt-4 font-serif text-2xl text-[#233636]">
          Page Not Found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6F766F]">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/admin"
            className="inline-flex bg-[#2D3A3A] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#233030]"
          >
            Back to Dashboard
          </Link>

          <Link
            to="/admin/products"
            className="inline-flex border border-[#CFC6B7] bg-[#FFFCF4] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#344444] transition hover:bg-[#F3ECDF]"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
