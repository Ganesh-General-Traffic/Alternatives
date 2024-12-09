import { toast, Toaster } from "sonner";

const ToastWrapper = () => {
  return (
    <>
      <div onClick={() => toast.dismiss()}>
        <Toaster position="top-right" richColors />
      </div>
    </>
  );
};

export default ToastWrapper;
