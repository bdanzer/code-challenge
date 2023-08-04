import { useEffect, useRef, useState } from "react";

export function useMouse({ ref, onMouseMove, onMouseDownEl, onMouseUpEl }) {
  const [mouseDirection, setMouseDirection] = useState(null);
  const lastKnownMouseDirection = useRef(null);
  const [isMouseOverTargetEl, setIsMouseOverTargetEl] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mousePositionOnEL, setMousePositionOnEL] = useState(null);
  const [currentMousePosition, setCurrentMousePosition] = useState(null);
  const [mouseDownPositionStatus, setMouseDownPositionStatus] = useState(null);
  const [currentMouseDownPosition, setCurrentMouseDownPosition] =
    useState(null);
  const [currentMouseUpPosition, setCurrentMouseUpPosition] = useState(null);

  const refBoundingRect = ref.current?.getBoundingClientRect();

  const getMousePositionStatus = (mousePosition) => {
    if (mousePosition >= refBoundingRect?.right - 6) {
      return "right";
    } else if (mousePosition <= refBoundingRect?.left + 6) {
      return "left";
    } else {
      return "middle";
    }
  };

  const returnValues = {
    mouseDirection,
    isMovingLeft: mouseDirection === "left",
    isMovingRight: mouseDirection === "right",
    isMouseOverTargetEl,
    isMouseDown,
    mousePositionOnEL,
    isLeft: mouseDownPositionStatus === "left" || mousePositionOnEL === "left",
    isMiddle:
      mouseDownPositionStatus === "middle" || mousePositionOnEL === "middle",
    isRight:
      mouseDownPositionStatus === "right" || mousePositionOnEL === "right",
    currentMousePosition,
    mouseDownPositionStatus,
    currentMouseDownPosition,
    currentMouseUpPosition,
  };

  //   Track mouse movements in and out of the target el
  useEffect(() => {
    const overlayEl = document.querySelector(".overlay");

    const mouseMoveListener = (e) => {
      const isMouseOverTargetEl = e.target.contains(ref.current);
      setIsMouseOverTargetEl(isMouseOverTargetEl);
      const currentMousePositionStatus = getMousePositionStatus(e.pageX);
      setMousePositionOnEL(currentMousePositionStatus);

      setCurrentMousePosition(e.pageX);

      let currentDirection;

      if (lastKnownMouseDirection.current === e.pageX) return;

      if (lastKnownMouseDirection.current) {
        currentDirection =
          lastKnownMouseDirection.current > e.pageX ? "left" : "right";
        setMouseDirection(currentDirection);
      }

      onMouseMove?.(e, {
        currentMousePositionStatus,
        lastKnownMouseDirection: lastKnownMouseDirection.current,
        currentMousePosition: e.pageX,
        currentMouseDirection: currentDirection,
        isMouseOverTargetEl,
        isMouseDown,
        mouseDownPositionStatus,
        currentMouseDownPosition,
        currentMouseUpPosition,
      });

      lastKnownMouseDirection.current = e.pageX;
    };

    overlayEl?.addEventListener("mousemove", mouseMoveListener);

    return () => {
      overlayEl?.removeEventListener("mousemove", mouseMoveListener);
    };
  }, [
    ref.current,
    isMouseDown,
    mouseDownPositionStatus,
    currentMouseDownPosition,
    currentMouseUpPosition,
  ]);

  //   Tracking mouse down/mouse up
  useEffect(() => {
    const overlayEl = document.querySelector(".overlay");
    const mouseDownListener = (e) => {
      const overEl = e.target.contains(ref.current);
      if (!overEl) return;
      const mouseDownPositionStatus = getMousePositionStatus(e.pageX);

      setMouseDownPositionStatus(mouseDownPositionStatus);
      setCurrentMouseDownPosition(e.pageX);
      setIsMouseDown(true);

      onMouseDownEl?.(e, { ...returnValues, isMouseDown: true });
    };

    const mouseUpListener = (e) => {
      const overEl = e.target.contains(ref.current);
      setIsMouseDown(false);

      if (!overEl) return;

      setMouseDownPositionStatus(null);
      setCurrentMouseUpPosition(e.pageX);

      onMouseUpEl?.(e, {
        ...returnValues,
        isMouseDown: false,
        mouseDownPosition: mouseDownPositionStatus,
      });
    };

    ref.current?.addEventListener("mousedown", mouseDownListener);
    overlayEl.addEventListener("mouseup", mouseUpListener);

    return () => {
      ref.current?.removeEventListener("mousedown", mouseDownListener);
      overlayEl.removeEventListener("mouseup", mouseUpListener);
    };
  }, [
    ref,
    returnValues.isLeft,
    returnValues.isMiddle,
    returnValues.isMouseDown,
    returnValues.isMouseOverTargetEl,
    returnValues.isMovingLeft,
    returnValues.isMovingRight,
    returnValues.isRight,
    returnValues.mouseDirection,
    returnValues.mousePositionOnEL,
    returnValues.currentMousePosition,
  ]);

  return returnValues;
}
