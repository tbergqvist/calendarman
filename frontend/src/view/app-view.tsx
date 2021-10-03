import { observer } from "mobx-react";
import * as React from "react";
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import { Calendar } from "../model/calendar";
import { StoreContext } from "../store-context";

function isSucess(response: GoogleLoginResponse | GoogleLoginResponseOffline) : response is GoogleLoginResponse {
  return !response.code;
}

interface GCalendarList {
  items: GCalendarItem[];
}

interface GEventList {
  items: GEventItem[];
}

interface GCalendarItem {
  id: string;
}

interface GDate {
  date: string;
  dateTime: string;
  timeZone: string;
}

interface GEventItem {
  id: string;
  start: GDate;
  end: GDate;
  summary: string;
}

export const AppView = observer(() => {
  let [accessToken, setAccessToken] = React.useState("");

  let successResponse = async (response: GoogleLoginResponse | GoogleLoginResponseOffline)=> {
    if (isSucess(response)) {
      console.log("online", response.tokenId, response.accessToken);

      let res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });
      let json: GCalendarList = await res.json();
      json.items.map(calendar => new Calendar(calendar.id)).forEach(c => system.addCalendar(c));
      setAccessToken(response.accessToken);
    } else {
      console.log("offline", response.code);
    }
  }

  let failedResponse = (error: any)=> {
    console.log("not cool", error);
  }

  let system = React.useContext(StoreContext);

  let syncCalendar = async (from?: Calendar, to?: Calendar)=> {
    if (from !== undefined && to !== undefined) {
      let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${from.id}/events?timeMin=2021-10-03T00:00:00.00Z`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      let json: GEventList = await res.json();
      for (let event of json.items) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/${to.id}/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            start: event.start,
            end: event.end,
            summary: event.summary,
            reminders: {
              overrides: [],
              useDefault: false
            }
          })
        });
      }

    }

  }

  let [calendarFrom, setCalendarFrom] = React.useState(undefined as Calendar | undefined);
  let [calendarTo, setCalendarTo] = React.useState(undefined as Calendar | undefined);

  return (
      <div className="main">
        <div className="googleBtn">
          <GoogleLogin
            clientId="761406443937-fh0061v6tfcutb7oldqrb1bt4o1o0i7i.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={successResponse}
            onFailure={failedResponse}
            cookiePolicy={'single_host_origin'}
            scope="https://www.googleapis.com/auth/calendar"
          />
        </div>
        From:
        <div className="calendars_from">
          {
            system.calendars.map(calendar =>
              <div key={calendar.id}>
                <input type="radio" name="calendar_from" id={`from_${calendar.id}`} onChange={e=> setCalendarFrom(calendar)} checked={calendar === calendarFrom}/>
                <label htmlFor={`from_${calendar.id}`}>{calendar.id}</label>
              </div>
            )
          }
        </div>
        To:
        <div className="calendars_to">
          {
            system.calendars.map(calendar =>
              <div key={calendar.id}>
                <input type="radio" name="calendar_to" id={`to_${calendar.id}`} onChange={e=> setCalendarTo(calendar)} checked={calendar === calendarTo}/>
                <label htmlFor={`to_${calendar.id}`}>{calendar.id}</label>
              </div>
            )
          }
        </div>
        <button onClick={e => syncCalendar(calendarFrom, calendarTo)}>Sync</button>
      </div>
  );
});