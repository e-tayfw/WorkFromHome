import { FC, PropsWithChildren } from "react";
// import React from "react";

const SiteContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <main className="relative w-full h-full">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </>
  );
};

export default SiteContainer;
