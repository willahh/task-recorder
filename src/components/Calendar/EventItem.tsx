import React from 'react';
import { useDispatch } from 'react-redux';
import { UserEvent, deleteUserEvent } from '../../redux/user-event';

export type IEventItemProps = {
  event: UserEvent;
};

const EventItem: React.FC<IEventItemProps> = ({ event }) => {
  const dispatch = useDispatch();
  const handleDeleteClick = () => {
    dispatch(deleteUserEvent(event.id));
  };
  return (
    <div className="calendar-event">
      <div className="calendar-event-info">
        <div className="calendar-event-time">10:00 - 12:00</div>
        <div className="calendar-event-title">{event.title}</div>
      </div>
      <button
        className="calendar-event-delete-button"
        onClick={handleDeleteClick}
      >
        &times;
      </button>
    </div>
  );
};

export default EventItem;
