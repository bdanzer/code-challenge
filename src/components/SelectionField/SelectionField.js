import { memo, useRef, useState } from "react";
import { useMouse } from "../../hooks/useMouse";
import {
  getCorrectedLeftBoundarySecondsFromPixels,
  getCorrectedRightBoundarySecondsFromPixels,
  getSecondsFromPixels,
} from "../../utils";

function SelectionField({
  fieldId,
  start,
  end,
  height,
  isMouseDownParent,
  onResize,
  active,
}) {
  const ref = useRef(null);

  const [isToolTipShown, setToolTip] = useState(false);
  const trueStart = start < end ? start : end; //this covers the initial creation for going left or right
  const trueEnd = end > start ? end : start;

  const refBoundingRectValues = ref.current?.getBoundingClientRect();
  const top = refBoundingRectValues?.top - 60;
  const left = refBoundingRectValues?.left;
  const width = Math.abs(start - end);

  const toolTipText = `Start ${getCorrectedLeftBoundarySecondsFromPixels(
    trueStart
  )}s - End ${getCorrectedRightBoundarySecondsFromPixels(
    trueEnd
  )}s | Duration ${getSecondsFromPixels(width)}s`;

  const stopPropagation = (_e) => {
    if (!isMouseDownParent) {
      _e.stopPropagation();
    }
  };

  const updateToolTip = (e) => {
    if (!isMouseDownParent) {
      setToolTip(true);
    }
  };

  const handleOnMouseEnterSelectionField = (_e) => {
    stopPropagation(_e);
    updateToolTip(_e);
  };

  const { isLeft, isMiddle, isRight } = useMouse({
    ref,
    onMouseDownEl: (e, _obj) => {
      stopPropagation(e);
    },
    onMouseMove: (_e, obj) => {
      if (obj.isMouseDown) {
        onResize?.(fieldId, obj, ref?.current);
      }
    },
  });

  const getBorderColor = () => {
    if (active) return "lightgreen";
    if (isToolTipShown) return "skyblue";

    return "blue";
  };

  return (
    <>
      <div
        ref={ref}
        className="selectionField"
        style={{
          zIndex: 11,
          position: "absolute",
          height: height ?? 107,
          width,
          background: "rgb(0 0 255 / 59%)",
          top: 10,
          left: trueStart,
          borderRadius: 12,
          boxSizing: "border-box",
          border: `3px solid ${getBorderColor()}`,
          ...(isRight && {
            cursor: "col-resize",
          }),
          ...(isMiddle && {
            cursor: "move",
          }),
          ...(isLeft && {
            cursor: "col-resize",
          }),
        }}
        onMouseOut={(e) => {
          stopPropagation(e);
        }}
        onMouseEnter={handleOnMouseEnterSelectionField}
        onMouseLeave={(e) => {
          stopPropagation(e);
          setToolTip(false);
        }}
      ></div>
      {isToolTipShown && (
        <div
          style={{
            position: "fixed",
            top,
            left,
            padding: 16,
            background: "rgb(0 0 0 / 20%)",
            borderRadius: 12,
            border: "2px solid black",
          }}
        >
          {toolTipText}
        </div>
      )}
    </>
  );
}

export const MemoizedSelectionField = memo(SelectionField);
