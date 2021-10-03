import * as React from "react";
import * as ReactDom from "react-dom";
import { AppView } from "./view/app-view";

import { System } from "./model/system";
import { StoreProvider } from "./store-context";

const store = new System();

function render() {
  ReactDom.render(
    <StoreProvider value={store}>
      <AppView />
  </StoreProvider>,
  document.getElementById("app")!);
}

setTimeout(()=> {
  render();
});