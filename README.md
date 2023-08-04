# Code challenge

Attempted this pretty cool code challenge

- Users should have the ability to create events by placing their cursor on the signal where the event should start and dragging to the right to where the event should end. In the scenario where the user drags from the right to the left, the start of the event should be considered their final cursor placement, and the end of the event should be their initial cursor placement. While the width will be determined by the start and end of the event, the height should remain constant at roughly the same size of the signal chart. Users can place multiple events on the channel. Do not worry about overlapping events.
  - Hint: First, try to just create a rectangularly shaped component that you can specify the position and width of. Then write event handlers to create this component as needed.
- When the mouse cursor hovers over the event, a popup should appear on top of the event that displays the start time, end time, and duration of the event in seconds. Note that the sine wave is displayed over a 10-second time interval. You will need to figure out how you can reliably convert the pixel width of the event into seconds.
- Events can be resized by placing the mouse cursor on the right or left border of the event and dragging to the desired width.
- Events can be moved to the left or right by placing the mouse cursor inside the event and dragging to the desired position.
- Pre populate the events on load by using the events in /src/api/initialEvents.js

Nice to haves but not necessary!

(Extra Credit) Place a delete button in the popup created in Step 2 that removes the event when clicked.
(Extra Credit) filter out overlapping events
(Extra Credit) Get creative!

# Deployment

View the github page on the right!

# Installation

Easy as it gets, npm install, npm start
