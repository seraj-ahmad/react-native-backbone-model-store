/**
 * Copyright 2016 Clozr, Inc.
 *
 * @providesModule DebugStyle
 * @flow
 */


const COLORS = {
  'w': 'white',
  'r': 'red',
  'g': 'green',
  '-': 'gray',
  'y': 'yellow',
  'm': 'magenta',
  'M': 'maroon',
  'p': 'purple',
  'b': 'blue',
  'o': 'orange',
  'B': 'black',
  'k': 'khaki',
};

let style = {
  'greenwhite':  "background-color:green; color:white",
  'yellow': "background-color:yellow; color:white"
}

export default function(s) {
  let bg = s[0];
  let fg = s[1];
  return `background-color:${COLORS[bg]}; color:${COLORS[fg]}; font-weight: bold`;
}


