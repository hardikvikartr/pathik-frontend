import React from "react";

const Loader = ({ message }: { message: string }) => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="flex flex-col items-center gap-3">
        <i className="fas fa-spinner fa-spin text-4xl text-pathik-primary"></i>
        <p className="text-pathik-text-light">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
