import { Action, AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "./store";
import { selectDateStart } from './recorder';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> { }

const LOAD_SUCCESS = 'userEvents/load_success';

interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  }
}

const LOAD_FAILURE = 'userEvents/load_failure';
interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

const CREATE_REQUEST = 'userEvents/create_request';

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> { }

const CREATE_SUCCESS = 'userEvents/create_success';

interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  }
}

const CREATE_FAILURE = 'userEvents/create_failure';

interface CreatefailureAction extends Action<typeof CREATE_FAILURE> { }

export const createUserEvent = (): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  CreateRequestAction | CreateSuccessAction | CreatefailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: CREATE_REQUEST
  });

  try {
    const dateStart = selectDateStart(getState());
    const event: Omit<UserEvent, 'id'> = {
      title: 'No name',
      dateStart,
      dateEnd: new Date().toISOString()
    };

    const response = await fetch(`http://localhost:3001/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    const createdEvent: UserEvent = await response.json();

    dispatch({
      type: CREATE_SUCCESS,
      payload: {
        event: createdEvent
      }
    });
  } catch (e) {
    dispatch({
      type: CREATE_FAILURE
    })
  }
}

const selectUserEventsState = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventsState(rootState);
  return state.allIds.map(id => state.byIds[id]);
};

const initialState: UserEventsState = {
  byIds: {},
  allIds: []
}

export const loadUserEvents = (): ThunkAction<
  void, RootState, undefined, LoadRequestAction | LoadSuccessAction | LoadFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: LOAD_REQUEST
  });

  try {
    const response = await fetch('http://localhost:3001/events');
    const events: UserEvent[] = await response.json();

    dispatch({
      type: LOAD_SUCCESS,
      payload: { events }
    })
  } catch (e) {
    dispatch({
      type: LOAD_FAILURE,
      error: "Failed to load events."
    })
  }
};

const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction | CreateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {})
      };
    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event }
      };
    default:
      return state;
  }
}

export default userEventsReducer;