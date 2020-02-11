import {
  AppActionTypes,
  GET_VDIR,
  Layout,
  Page,
  SET_COLOR,
  SET_VDIR,
  SWITCH_LAYOUT,
  SWITCH_PAGE
} from "./types";
import { Vdir } from "../../lib/vdir";

export function setVdir(vdir: Vdir): AppActionTypes {
  return { type: SET_VDIR, payload: { vdir } };
}

export function getVdir(): AppActionTypes {
  return { type: GET_VDIR };
}

export function randomColor(): AppActionTypes {
  return { type: SET_COLOR };
}

export function switchLayout(layout: Layout): AppActionTypes {
  return {
    type: SWITCH_LAYOUT,
    payload: { layout }
  };
}

export function switchPage(page: Page, bucket?: string): AppActionTypes {
  if (page === Page.bucket && !bucket) throw new Error("需要传递bucket参数");
  return {
    type: SWITCH_PAGE,
    payload: { page, bucket }
  };
}
