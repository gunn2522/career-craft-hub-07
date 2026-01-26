import { TorchLoader } from "@/components/ui/TorchLoader";

const Loading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <TorchLoader />
    </div>
  );
};

export default Loading;
