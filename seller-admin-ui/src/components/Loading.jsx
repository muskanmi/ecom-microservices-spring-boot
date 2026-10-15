function Loading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DED7C9] border-t-[#2D3A3A]" />

        {/* Message */}
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Loading;
