function ConfirmDialog({
  open,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md border border-[#DED7C9] bg-[#F7F1E5] shadow-xl">
        {/* Header */}
        <div className="border-b border-[#DED7C9] px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Confirmation
          </p>

          <h2 className="mt-2 font-serif text-2xl text-[#233636]">{title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-[#6F766F]">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[#DED7C9] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-[#CFC7B8] bg-[#FDF9F1] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#596361] transition hover:bg-[#F2EBDD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-[#8B4E45] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#743E37] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
