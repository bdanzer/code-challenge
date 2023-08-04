import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { SineWave } from "components";
import {
  convertSecondsToPixels,
  getStartOrEndPositionBoundary,
  uid,
} from "../../utils";
import { MemoizedSelectionField } from "../../components/SelectionField/SelectionField";
import { getEventsFromApi } from "../../api/initialEvents";

const Container = styled.div`
  position: relative;
`;

// The Overlay is a div that lies on top of the chart to capture mouse events
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 170px;
  z-index: 10;
`;

// The chart canvas will be the same height/width as the ChartWrapper
// https://www.chartjs.org/docs/3.2.1/configuration/responsive.html#important-note
const ChartWrapper = styled.div``;

const SignalView = () => {
  // Access the height of the chart as chartWrapperRef.current?.clientHeight to determine the height to set on events
  const chartWrapperRef = useRef();
  //   const mouseDown = useRef(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [currentSelectionID, setCurrentSelectionID] = useState(null);
  const [selections, setSelections] = useState([]);

  const handleInitialSelectionFieldMouseDown = (e) => {
    // 1. track current mouse down position
    // 2. generate unique id, initial/end position to track for later
    // 3. track via state what is the most recently created selection field for easy reference
    const currentCursorPosition = e.pageX;
    const generatedID = uid();
    setMouseDown(true);
    setCurrentSelectionID(generatedID);
    setSelections((prevSelections) => [
      ...prevSelections,
      {
        generatedID,
        start: getStartOrEndPositionBoundary(currentCursorPosition), //on initial start set both start and end to same
        end: getStartOrEndPositionBoundary(currentCursorPosition),
      },
    ]);
  };

  const handleInitialSelectionFieldCreationMovement = (e) => {
    //1. Check if we are currently mouse down
    //3. Establish boundaries to match axis
    //2. Update start & end position, and direction on specific selection ID
    if (mouseDown) {
      setSelections((prevSelections) => {
        const currentSpot = e.pageX;

        return prevSelections.map((prevSelection) => {
          if (prevSelection.generatedID === currentSelectionID) {
            return {
              ...prevSelection,
              end: getStartOrEndPositionBoundary(currentSpot),
            };
          }

          return prevSelection;
        });
      });
    }
  };

  const handleInitialSelectionFieldMouseUp = () => {
    // 1. keep track of when mouse down is false
    setMouseDown(false);

    // clean data points to get correct start and ends
    setSelections((prevSelections) => {
      return prevSelections.map((prevSelection) => {
        let cleanObj = { ...prevSelection };
        // flip start and end to be normal, probably a better way to handle but this is my quick solution
        if (prevSelection.end < prevSelection.start) {
          cleanObj = {
            ...prevSelection,
            start: prevSelection.end,
            end: prevSelection.start,
          };
        }

        //this is for if a user just clicks on the graph and doesn't drag could also just delete it but this seemed nicer
        if (prevSelection.end === prevSelection.start) {
          cleanObj = {
            ...cleanObj,
            start: getStartOrEndPositionBoundary(cleanObj.start - 20),
            end: getStartOrEndPositionBoundary(cleanObj.end + 20),
          };
        }

        return cleanObj;
      });
    });
  };

  const handleSelectionFieldResize = useCallback(
    // MouseContext
    //   currentMousePositionStatus,
    //   lastKnownMouseDirection,
    //   currentMousePosition,
    //   currentMouseDirection,
    //   isMouseOverTargetEl,
    //   isMouseDown,
    //   mouseDownPositionStatus,
    //   currentMouseDownPosition,
    //   currentMouseUpPosition,
    (fieldId, mouseContext, el) => {
      setCurrentSelectionID(fieldId);
      setSelections((prevSelections) =>
        prevSelections.map((prevSelection) => {
          if (!mouseContext.mouseDownPositionStatus) return null;

          if (prevSelection.generatedID === fieldId) {
            if (mouseContext.mouseDownPositionStatus === "middle") {
              const elBoundingRect = el.getBoundingClientRect();

              const diff = Math.abs(
                mouseContext.currentMousePosition -
                  mouseContext.lastKnownMouseDirection
              );

              const isMouseMovingRight =
                mouseContext.currentMouseDirection === "right";

              const newLeft = Math.abs(
                isMouseMovingRight
                  ? diff + elBoundingRect.left
                  : diff - elBoundingRect.left
              );

              const newRight = Math.abs(
                isMouseMovingRight
                  ? diff + elBoundingRect.right
                  : diff - elBoundingRect.right
              );

              return {
                ...prevSelection,
                start: getStartOrEndPositionBoundary(newLeft),
                end: getStartOrEndPositionBoundary(newRight),
              };
            }

            const keyBasedOnDirection =
              mouseContext.mouseDownPositionStatus === "left" ? "start" : "end";

            return {
              ...prevSelection,
              ...{
                [keyBasedOnDirection]: getStartOrEndPositionBoundary(
                  mouseContext.currentMousePosition
                ),
              },
            };
          }

          return prevSelection;
        })
      );
    },
    []
  );

  useEffect(() => {
    getEventsFromApi().then((res) => {
      const mapped = res.map((item) => ({
        generatedID: item.id,
        start: convertSecondsToPixels(item.start),
        end: convertSecondsToPixels(item.duration + item.start),
      }));

      //Could do this later, setting state in the .then is a bit problematic with race conditions but decided not to fix due to time
      setSelections((prevSelections) => [...mapped, ...prevSelections]);
    });
  }, []);

  useEffect(() => {
    const keyListener = (e) => {
      if (e.key === "Backspace") {
        setSelections((prevSelections) => {
          return prevSelections.filter(
            (prevSelection) => prevSelection.generatedID !== currentSelectionID
          );
        });
      }
    };

    document.addEventListener("keydown", keyListener);

    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [currentSelectionID]);

  return (
    <Container>
      <ChartWrapper ref={chartWrapperRef}>
        <SineWave samplingRate={50} lowerBound={0} upperBound={10} />
      </ChartWrapper>
      <Overlay
        className="overlay"
        onMouseDown={handleInitialSelectionFieldMouseDown}
        onMouseMove={handleInitialSelectionFieldCreationMovement}
        onMouseUp={handleInitialSelectionFieldMouseUp}
      >
        {selections.map((selection) => (
          <MemoizedSelectionField
            key={selection.generatedID}
            fieldId={selection.generatedID}
            height={chartWrapperRef.current?.clientHeight}
            start={selection.start}
            end={selection.end}
            isMouseDown={mouseDown}
            onResize={handleSelectionFieldResize}
            active={selection.generatedID === currentSelectionID}
          />
        ))}
      </Overlay>

      <div style={{ padding: "0 32px" }}>
        <h2>Layers</h2>
        {selections.map((selection, i) => (
          <li
            style={{
              cursor: "pointer",
              textDecoration:
                selection.generatedID === currentSelectionID
                  ? "underline"
                  : "none",
            }}
            key={selection.generatedID}
            onClick={() => {
              setCurrentSelectionID(selection.generatedID);
            }}
          >
            Layer number {i + 1} - ID {selection.generatedID}
          </li>
        ))}
      </div>
    </Container>
  );
};

export default SignalView;
