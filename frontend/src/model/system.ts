import { action, computed, get, makeObservable, observable } from "mobx";
import { Calendar } from "./calendar";

export class System {
  @observable private mCalendars: Calendar[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  addCalendar(calendar: Calendar) {
    this.calendars.push(calendar);
  }

  @computed
  get calendars() {
    return this.mCalendars;
  }
}