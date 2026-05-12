//Components
import toast from "react-hot-toast";

export const confirmToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  toast.custom((t) => (
    <div
      className={`
        select-none toast-in bg-[#1a1f2e] text-white px-4 py-3 rounded-lg shadow-lg w-72
        transition-all duration-300
        ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <p className="text-sm">{message}</p>

      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            onCancel?.();
          }}
          className="cursor-pointer px-3 py-1 rounded bg-[#4D5562] duration-300 hover:drop-shadow-[0_0_5px_#C93B76]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="cursor-pointer px-3 py-1 rounded bg-[#C93B76] duration-300 hover:drop-shadow-[0_0_5px_#C93B76]"
        >
          Confirm
        </button>
      </div>
    </div>
  ));
};
