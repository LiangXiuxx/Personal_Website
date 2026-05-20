import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("idle");

  useEffect(() => {
    if (children !== displayChildren) {
      // 开始退出动画
      setTransitionStage("exiting");

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage("entering");

        const enterTimer = setTimeout(() => {
          setTransitionStage("idle");
        }, 300);

        return () => clearTimeout(enterTimer);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [children, displayChildren]);

  return (
    <div className={`page-transition page-${transitionStage}`}>
      {transitionStage === "exiting" && (
        <div className="transition-loader">
          <div className="loader-bar"></div>
          <span className="loader-text font-cyber">LOADING_DATA...</span>
        </div>
      )}
      {displayChildren}
    </div>
  );
};

export default PageTransition;
