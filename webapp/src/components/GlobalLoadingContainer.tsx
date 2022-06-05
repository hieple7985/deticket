import { FC } from "react";

export const GlobalLoadingContainer: FC<{ loading: boolean }> = ({ loading }) => {
  if (loading) {
    return (
      <div className="fixed w-full h-full bg-[rgba(255,255,255,0.6)] left-0 top-0 z-50 flex items-center justify-center">
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
  return null;
}
