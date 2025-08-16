const tintColorLight = '#007acc'; // brighter blue for light mode
const tintColorDark = '#ffffff';  // pure white for dark mode

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#4a4a4a',           // darker gray for inactive icons on white bg
    tabIconDefault: '#b0b0b0', // matches icon for consistency
    tabIconSelected: tintColorLight,
    border: '#d1d5db',         // lighter gray border (e.g., Tailwind gray-300)
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    tint: tintColorDark,
    icon: '#b0b0b0',           // lighter gray for inactive icons on dark bg
    tabIconDefault: '#4a4a4a',
    tabIconSelected: tintColorDark,
    border: '#333333',         // slightly lighter dark gray border
  },
};
